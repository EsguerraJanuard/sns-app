'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export type TransactionInput = {
  wallet_id: string
  contact_id?: string
  contact_name?: string
  amount: number
  direction: 'IN' | 'OUT'
  kind: 'REGULAR' | 'BORROWED' | 'REPAYMENT' | 'TRANSFER' | 'ADJUSTMENT' | 'EXPENSE' | 'LENT'
  note?: string
  exchange_wallet_id?: string
  exchange_fee?: number
  is_personal_transfer?: boolean
  funding_debts?: { contact_name: string, amount: number }[]
}

export async function getTransaction(id: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      wallet:wallets(name, slug),
      contact:contacts(name)
    `)
    .eq('id', id)
    .single()
    
  if (error) return null
  return data
}

export async function createTransaction(input: TransactionInput) {
  try {
    if (!input.amount || isNaN(input.amount) || input.amount <= 0) {
      return { success: false, error: 'Transaction amount must be greater than 0.' }
    }

    // 1. Handle contact matching/creation if name is provided
    let finalContactId = input.contact_id

    if (!finalContactId && input.contact_name) {
      const normalized = input.contact_name.trim().toLowerCase()
      
      // Try to find existing contact
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('normalized_name', normalized)
        .single()

      if (existing) {
        finalContactId = existing.id
        // Update last_used_at
        await supabase.from('contacts').update({ last_used_at: new Date().toISOString() }).eq('id', existing.id)
      } else {
        // Create new contact
        const { data: newContact, error: createError } = await supabase
          .from('contacts')
          .insert({
            name: input.contact_name.trim(),
            normalized_name: normalized,
            last_used_at: new Date().toISOString()
          })
          .select('id')
          .single()
          
        if (!createError && newContact) {
          finalContactId = newContact.id
        } else if (createError) {
          return { success: false, error: 'Failed to create contact: ' + createError.message }
        }
      }
    }

    // Generate transfer group ID if this is an exchange
    let transferGroupId = undefined
    if (input.exchange_wallet_id) {
      transferGroupId = crypto.randomUUID()
    }

    // 2. Create the main transaction
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert({
        wallet_id: input.wallet_id,
        contact_id: finalContactId || null,
        amount: input.amount,
        direction: input.direction,
        kind: input.exchange_wallet_id ? 'TRANSFER' : input.kind,
        note: input.note || null,
        transfer_group_id: transferGroupId
      })
      .select('id')
      .single()

    if (txError) {
      console.error('Error creating transaction:', txError)
      return { success: false, error: 'Could not save transaction: ' + txError.message }
    }

  // 3. If Borrowed or Lent, create obligation
  if ((input.kind === 'BORROWED' || input.kind === 'LENT') && finalContactId && tx) {
    // For Customer Debts (LENT), the customer owes the principal + the fee.
    const obligationAmount = input.kind === 'LENT' ? input.amount + (input.exchange_fee || 0) : input.amount
    await supabase.from('obligations').insert({
      contact_id: finalContactId,
      origin_transaction_id: tx.id,
      original_amount: obligationAmount,
      status: 'open'
    })
  }

  // 4. Create the Exchange / Transfer paired transaction
  if (input.exchange_wallet_id && transferGroupId) {
    const fee = input.exchange_fee || 0
    let exchangeAmount = input.amount
    let exchangeDirection = 'IN'
    
    // Customer Transfer: The fee is applied directly to the exchange wallet amount.
    if (input.direction === 'IN') {
      exchangeDirection = 'OUT'
      exchangeAmount = input.amount - fee
    } else {
      exchangeDirection = 'IN'
      exchangeAmount = input.amount + fee
    }

    if (exchangeAmount > 0) {
      await supabase.from('transactions').insert({
        wallet_id: input.exchange_wallet_id,
        contact_id: finalContactId || null,
        amount: exchangeAmount,
        direction: exchangeDirection,
        kind: 'TRANSFER',
        note: `Exchange / Transfer Fee: ₱${fee}`,
        transfer_group_id: transferGroupId
      })
    }
  }

  // 5. Create Funding Debt if applicable (Nanghiram Pampuno)
  // 5. Create Borrowed funding transactions (Multiple Lenders Support)
  if (input.funding_debts && input.funding_debts.length > 0) {
    for (const debt of input.funding_debts) {
      if (debt.amount > 0 && debt.contact_name) {
        let fundingContactId = null
        const { data: existingFundingContact } = await supabase.from('contacts').select('id').ilike('name', debt.contact_name).single()
        
        if (existingFundingContact) {
          fundingContactId = existingFundingContact.id
        } else {
          const { data: newFundingContact, error: insertFundingError } = await supabase
            .from('contacts')
            .insert({ name: debt.contact_name })
            .select('id')
            .single()
          if (!insertFundingError && newFundingContact) {
            fundingContactId = newFundingContact.id
          }
        }

        // Default to the main wallet if no exchange wallet
        const targetFundingWalletId = input.direction === 'IN' 
          ? (input.exchange_wallet_id || input.wallet_id) 
          : input.wallet_id;

        if (fundingContactId && targetFundingWalletId) {
          const { data: fundingTx } = await supabase
            .from('transactions')
            .insert({
              wallet_id: targetFundingWalletId,
              contact_id: fundingContactId,
              amount: debt.amount,
              direction: 'IN', // Borrowing money is money IN to the agent
              kind: 'BORROWED',
              note: 'Funded transaction',
              transfer_group_id: transferGroupId || tx.id // link to exchange group OR the main tx id
            })
            .select('id')
            .single()

          if (fundingTx) {
            await supabase.from('obligations').insert({
              contact_id: fundingContactId,
              origin_transaction_id: fundingTx.id,
              original_amount: debt.amount,
              status: 'open'
            })
          }
        }
      }
    }
  }

  revalidatePath('/')
  revalidatePath('/wallets/[slug]', 'page')
  return { success: true, transactionId: tx.id }

  } catch (error: any) {
    console.error('Unhandled error in createTransaction:', error)
    return { success: false, error: 'Internal Server Error: ' + error.message }
  }
}


async function attachFundingInfo(primaryTxs: any[]) {
  if (!primaryTxs || primaryTxs.length === 0) return primaryTxs;

  const groupIds = primaryTxs.map(tx => tx.transfer_group_id).filter(Boolean);
  const txIds = primaryTxs.map(tx => tx.id);

  let fundingQuery = supabase
    .from('transactions')
    .select('id, transfer_group_id, amount')
    .eq('status', 'active')
    .eq('note', 'Funded transaction');
  
  if (groupIds.length > 0) {
    fundingQuery = fundingQuery.or(`transfer_group_id.in.(${groupIds.join(',')}),transfer_group_id.in.(${txIds.join(',')})`);
  } else if (txIds.length > 0) {
    fundingQuery = fundingQuery.in('transfer_group_id', txIds);
  } else {
    return primaryTxs;
  }

  const { data: fundingTxs } = await fundingQuery;

  if (fundingTxs && fundingTxs.length > 0) {
    return primaryTxs.map(tx => {
      if (tx.kind === 'TRANSFER' && tx.direction !== 'IN') {
        return tx;
      }
      const relatedFunding = fundingTxs.filter(f => f.transfer_group_id === tx.transfer_group_id || f.transfer_group_id === tx.id);
      if (relatedFunding.length > 0) {
        return {
          ...tx,
          fundingCount: relatedFunding.length,
          fundingTotal: relatedFunding.reduce((sum, f) => sum + f.amount, 0)
        };
      }
      return tx;
    });
  }

  return primaryTxs;
}

export async function getRecentTransactions(limit = 5, walletId?: string) {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      wallet:wallets(name, slug),
      contact:contacts(name)
    `)
    .eq('status', 'active')
    .or('note.neq.Funded transaction,note.is.null')
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (walletId) {
    query = query.eq('wallet_id', walletId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return await attachFundingInfo(data)
}

export async function getTodaySummary() {
  // Use Philippine Time (UTC+8) for "Today" boundaries
  const now = new Date()
  const phtOffset = 8 * 60 * 60 * 1000
  // Current time in PHT
  const phtTime = new Date(now.getTime() + phtOffset)
  // Set to midnight PHT
  phtTime.setUTCHours(0, 0, 0, 0)
  // Convert back to UTC for the database query
  const startOfTodayUTC = new Date(phtTime.getTime() - phtOffset)
  
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, direction, kind')
    .eq('status', 'active')
    .gte('occurred_at', startOfTodayUTC.toISOString())

  if (error || !data) {
    return { in: 0, out: 0, profit: 0 }
  }

  let totalIn = 0
  let totalOut = 0
  let totalFeeProfit = 0

  data.forEach(tx => {
    if (tx.kind === 'TRANSFER') {
      if (tx.direction === 'IN') totalFeeProfit += Number(tx.amount)
      if (tx.direction === 'OUT') totalFeeProfit -= Number(tx.amount)
      return; // Do not inflate Money IN/OUT totals with internal transfers
    }
    // Also skip LENT, BORROWED, and REPAYMENT to avoid inflating daily revenue metrics
    if (tx.kind === 'LENT' || tx.kind === 'BORROWED' || tx.kind === 'REPAYMENT') return;

    if (tx.direction === 'IN') totalIn += Number(tx.amount)
    if (tx.direction === 'OUT') totalOut += Number(tx.amount)
  })

  return { in: totalIn, out: totalOut, profit: totalFeeProfit }
}

export async function getRecentProfitHistory(daysCount: number = 3) {
  const now = new Date()
  const phtOffset = 8 * 60 * 60 * 1000
  
  // Array of dates to fetch
  const dates: { label: string; start: string; end: string; profit: number }[] = []
  for (let i = 1; i <= daysCount; i++) { // Start from 1 to skip today (which is already shown at the top)
    const d = new Date(now.getTime() + phtOffset)
    d.setUTCHours(0, 0, 0, 0)
    d.setUTCDate(d.getUTCDate() - i)
    
    const startUTC = new Date(d.getTime() - phtOffset)
    const endUTC = new Date(d.getTime() - phtOffset + 24 * 60 * 60 * 1000 - 1)
    
    dates.push({
      label: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', weekday: 'short' }),
      start: startUTC.toISOString(),
      end: endUTC.toISOString(),
      profit: 0
    })
  }

  // Get all active TRANSFER transactions in the date range
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, direction, occurred_at')
    .eq('status', 'active')
    .eq('kind', 'TRANSFER')
    .gte('occurred_at', dates[dates.length - 1].start)
    .lte('occurred_at', dates[0].end)

  if (!error && data) {
    data.forEach(tx => {
      // Find which date bucket it belongs to
      for (const d of dates) {
        if (tx.occurred_at >= d.start && tx.occurred_at <= d.end) {
          if (tx.direction === 'IN') d.profit += Number(tx.amount)
          if (tx.direction === 'OUT') d.profit -= Number(tx.amount)
          break
        }
      }
    })
  }

  // Return only dates that have profit (or return all so user sees zeros? Usually better to return all past 3 days)
  return dates.map(d => ({ label: d.label, profit: d.profit }))
}

export async function searchTransactions(params: {
  query?: string,
  dateFrom?: string,
  dateTo?: string,
  walletId?: string
}) {
  let q = supabase
    .from('transactions')
    .select(`
      *,
      wallet:wallets(name, slug),
      contact:contacts(name)
    `)
    .eq('status', 'active')
    .order('occurred_at', { ascending: false })

  if (params.walletId) {
    q = q.eq('wallet_id', params.walletId)
  }
  
  if (params.dateFrom) {
    q = q.gte('occurred_at', params.dateFrom + 'T00:00:00.000Z')
  }
  
  if (params.dateTo) {
    q = q.lte('occurred_at', params.dateTo + 'T23:59:59.999Z')
  }

  const { data, error } = await q

  if (error || !data) {
    console.error('Error searching transactions:', error)
    return []
  }

  let results = data

  if (params.query) {
    const search = params.query.toLowerCase()
    results = results.filter((tx: any) => {
      const matchName = tx.contact?.name?.toLowerCase().includes(search)
      const matchAmount = tx.amount.toString().includes(search)
      const matchNote = tx.note?.toLowerCase().includes(search)
      return matchName || matchAmount || matchNote
    })
  }

  return results
}

export async function voidTransaction(id: string) {
  const { data: tx, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tx) {
    throw new Error('Transaction not found')
  }

  // 1. Grouping logic: find all transactions related to this operation
  const groupId = tx.transfer_group_id || tx.id;

  const { data: relatedTxs } = await supabase
    .from('transactions')
    .select('id, kind, transfer_group_id')
    .or(`id.eq.${id},transfer_group_id.eq.${groupId}`)

  if (!relatedTxs || relatedTxs.length === 0) return { success: false, error: 'No transactions found' }

  const txIdsToVoid = relatedTxs.map(t => t.id)

  // 2. Void all related transactions atomically
  await supabase
    .from('transactions')
    .update({ status: 'voided' })
    .in('id', txIdsToVoid)

  // 3. Cascading void for BORROWED / LENT
  const borrowedOrLentIds = relatedTxs.filter(t => t.kind === 'BORROWED' || t.kind === 'LENT').map(t => t.id)
  
  if (borrowedOrLentIds.length > 0) {
    const { data: obs } = await supabase
      .from('obligations')
      .select('id')
      .in('origin_transaction_id', borrowedOrLentIds)

    if (obs && obs.length > 0) {
      const obIds = obs.map(o => o.id)
      
      const { data: reps } = await supabase
        .from('obligation_repayments')
        .select('transaction_id')
        .in('obligation_id', obIds)
        
      if (reps && reps.length > 0) {
        const repTxIds = reps.map(r => r.transaction_id)
        
        await supabase
          .from('transactions')
          .update({ status: 'voided' })
          .in('id', repTxIds)
          
        await supabase
          .from('obligation_repayments')
          .delete()
          .in('obligation_id', obIds)
      }
      
      await supabase
        .from('obligations')
        .update({ status: 'voided' })
        .in('id', obIds)
    }
  }

  // 4. Cascading fix for REPAYMENTS
  const repaymentIds = relatedTxs.filter(t => t.kind === 'REPAYMENT').map(t => t.id)
  if (repaymentIds.length > 0) {
    for (const repId of repaymentIds) {
      const { data: reps } = await supabase
        .from('obligation_repayments')
        .select('obligation_id')
        .eq('transaction_id', repId)
        
      if (reps && reps.length > 0) {
        const obIds = reps.map(r => r.obligation_id)
        
        await supabase
          .from('obligation_repayments')
          .delete()
          .eq('transaction_id', repId)
          
        await supabase
          .from('obligations')
          .update({ status: 'open', settled_at: null })
          .in('id', obIds)
      }
    }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/transactions', 'layout')
  return { success: true }
}
