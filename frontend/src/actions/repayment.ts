'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function repayObligation(formData: FormData) {
  const contactId = formData.get('contactId') as string
  const walletId = formData.get('walletId') as string
  const amountStr = formData.get('amount') as string
  const isLent = formData.get('isLent') === 'true'
  
  // Clean string (e.g. "5,000" -> 5000)
  const amount = Number(amountStr.replace(/,/g, ''))

  if (!contactId || !walletId || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid input')
  }

  // 1. Fetch all open obligations for this contact, ordered by oldest first
  const debtType = isLent ? 'LENT' : 'BORROWED'
  const { data: obsRaw, error: obsError } = await supabase
    .from('obligations')
    .select('id, original_amount, transactions(kind)')
    .eq('contact_id', contactId)
    .eq('status', 'open')
    .order('opened_at', { ascending: true })

  if (obsError || !obsRaw || obsRaw.length === 0) {
    throw new Error('No open obligations found for this person.')
  }

  const obs = obsRaw.filter(o => {
    const kind = (o.transactions as any)?.kind || 'BORROWED'
    return kind === debtType
  })

  if (obs.length === 0) {
    throw new Error('No open obligations of this type found.')
  }

  // Fetch all repayments for these obligations
  const obIds = obs.map(o => o.id)
  const { data: reps } = await supabase
    .from('obligation_repayments')
    .select('obligation_id, amount')
    .in('obligation_id', obIds)

  const repMap: Record<string, number> = {}
  if (reps) {
    reps.forEach(r => {
      repMap[r.obligation_id] = (repMap[r.obligation_id] || 0) + Number(r.amount)
    })
  }

  // Total owed checking
  const totalOwed = obs.reduce((sum, ob) => sum + (Number(ob.original_amount) - (repMap[ob.id] || 0)), 0)
  
  if (amount > totalOwed) {
    throw new Error(`Repayment amount (₱${amount}) cannot exceed the total amount owed (₱${totalOwed}).`)
  }

  // 2. Create the Money IN/OUT transaction based on isLent
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      wallet_id: walletId,
      contact_id: contactId,
      amount: amount,
      direction: isLent ? 'IN' : 'OUT',
      kind: 'REPAYMENT',
      status: 'active'
    })
    .select('id')
    .single()

  if (txError || !tx) {
    throw new Error('Failed to create repayment transaction.')
  }

  // 3. Distribute the repayment amount across open obligations (Oldest first)
  let remainingRepayment = amount
  const newRepayments = []
  const obligationsToSettle = []

  for (const ob of obs) {
    if (remainingRepayment <= 0) break

    const paidSoFar = repMap[ob.id] || 0
    const obRemaining = Number(ob.original_amount) - paidSoFar

    if (obRemaining <= 0) continue

    const amountToApply = Math.min(remainingRepayment, obRemaining)
    
    newRepayments.push({
      obligation_id: ob.id,
      transaction_id: tx.id,
      amount: amountToApply
    })

    remainingRepayment -= amountToApply

    // If this fully pays off the obligation, mark it settled
    if (amountToApply >= obRemaining) {
      obligationsToSettle.push(ob.id)
    }
  }

  if (newRepayments.length > 0) {
    await supabase.from('obligation_repayments').insert(newRepayments)
  }

  if (obligationsToSettle.length > 0) {
    await supabase.from('obligations')
      .update({ status: 'settled', settled_at: new Date().toISOString() })
      .in('id', obligationsToSettle)
  }

  revalidatePath('/', 'layout')
  redirect('/obligations')
}
