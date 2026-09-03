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

  // 2. Create the transaction
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      wallet_id: input.wallet_id,
      contact_id: finalContactId || null,
      amount: input.amount,
      direction: input.direction,
      kind: input.kind,
      note: input.note || null
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

  // Note: Repayment logic would need obligation mapping here. For MVP, we might keep it simple 
  // or handle it in a separate repayObligation action.

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
  // Get start of today (local time approach, simplified)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, direction')
    .eq('status', 'active')
    .gte('occurred_at', today.toISOString())

  if (error || !data) {
    return { in: 0, out: 0 }
  }

  let totalIn = 0
  let totalOut = 0

  data.forEach(tx => {
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
