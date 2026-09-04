'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

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
  if (!input.amount || isNaN(input.amount) || input.amount <= 0) {
    throw new Error('Transaction amount must be greater than 0.')
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
    throw new Error('Could not save transaction')
  }

  // 3. If Borrowed or Lent, create obligation
  if ((input.kind === 'BORROWED' || input.kind === 'LENT') && finalContactId && tx) {
    await supabase.from('obligations').insert({
      contact_id: finalContactId,
      origin_transaction_id: tx.id,
      original_amount: input.amount,
      status: 'open'
    })
  }

  // 4. Create the Exchange / Transfer paired transaction
  if (input.exchange_wallet_id && transferGroupId) {
    const fee = input.exchange_fee || 0
    let exchangeAmount = input.amount
    let exchangeDirection = 'IN'
    
    if (input.is_personal_transfer) {
      // Personal Transfer: Base amounts match exactly. The fee is an EXPENSE.
      exchangeDirection = input.direction === 'IN' ? 'OUT' : 'IN'
      
      // Create the matching exchange
      await supabase.from('transactions').insert({
        wallet_id: input.exchange_wallet_id,
        contact_id: finalContactId || null,
        amount: input.amount,
        direction: exchangeDirection,
        kind: 'TRANSFER',
        note: input.note || 'Personal Transfer',
        transfer_group_id: transferGroupId
      })

      // Create a 3rd transaction for the fee as an EXPENSE
      if (fee > 0) {
        // If money went OUT (e.g. GCash -> Cash), the fee was charged to the Source (GCash).
        // If money came IN (e.g. Cash -> GCash), the fee was charged to the Exchange Wallet (Cash).
        const feeWalletId = input.direction === 'OUT' ? input.wallet_id : input.exchange_wallet_id
        
        await supabase.from('transactions').insert({
          wallet_id: feeWalletId,
          amount: fee,
          direction: 'OUT',
          kind: 'EXPENSE',
          note: 'Transfer Fee',
          transfer_group_id: transferGroupId
        })
      }
    } else {
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
  }

  revalidatePath('/')
  revalidatePath('/wallets/[slug]', 'page')
  return { success: true, transactionId: tx.id }
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

  return data
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
    return { in: 0, out: 0 }
  }

  let totalIn = 0
  let totalOut = 0

  data.forEach(tx => {
    if (tx.kind === 'TRANSFER') return; // Do not inflate totals with internal wallet transfers
    if (tx.direction === 'IN') totalIn += Number(tx.amount)
    if (tx.direction === 'OUT') totalOut += Number(tx.amount)
  })

  return { in: totalIn, out: totalOut }
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

  // 1. If it is a TRANSFER, void all transactions in the same transfer_group_id
  if ((tx.kind === 'TRANSFER' || tx.exchange_wallet_id) && tx.transfer_group_id) {
    await supabase
      .from('transactions')
      .update({ status: 'voided' })
      .eq('transfer_group_id', tx.transfer_group_id)
  } 
  else {
    // 2. Void the single transaction
    await supabase
      .from('transactions')
      .update({ status: 'voided' })
      .eq('id', id)

    // 3. Cascading void for BORROWED / LENT
    if (tx.kind === 'BORROWED' || tx.kind === 'LENT') {
      // Find the obligation
      const { data: ob } = await supabase
        .from('obligations')
        .select('id')
        .eq('origin_transaction_id', id)
        .single()
        
      if (ob) {
        // Find all repayments for this obligation
        const { data: reps } = await supabase
          .from('obligation_repayments')
          .select('transaction_id')
          .eq('obligation_id', ob.id)
          
        if (reps && reps.length > 0) {
          const repTxIds = reps.map(r => r.transaction_id)
          // Void the repayment transactions
          await supabase
            .from('transactions')
            .update({ status: 'voided' })
            .in('id', repTxIds)
            
          // Delete the linking records
          await supabase
            .from('obligation_repayments')
            .delete()
            .eq('obligation_id', ob.id)
        }
        
        // Void the obligation itself
        await supabase
          .from('obligations')
          .update({ status: 'voided' })
          .eq('id', ob.id)
      }
    }

    // 4. Cascading fix for REPAYMENTS
    if (tx.kind === 'REPAYMENT') {
      const { data: reps } = await supabase
        .from('obligation_repayments')
        .select('obligation_id')
        .eq('transaction_id', id)
      
      if (reps && reps.length > 0) {
        const obIds = reps.map(r => r.obligation_id)
        
        // Delete the repayment records
        await supabase
          .from('obligation_repayments')
          .delete()
          .eq('transaction_id', id)
          
        // Re-open those obligations since they now have a balance again
        await supabase
          .from('obligations')
          .update({ status: 'open', settled_at: null })
          .in('id', obIds)
      }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
