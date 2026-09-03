'use server'

import { supabase } from '@/lib/supabase'

export async function getTotalObligations() {
  const { data: obs, error: obsError } = await supabase
    .from('obligations')
    .select('id, original_amount')
    .eq('status', 'open')

  if (obsError || !obs) return 0

  const { data: reps } = await supabase
    .from('obligation_repayments')
    .select('obligation_id, amount')

  const totalOriginal = obs.reduce((sum, o) => sum + Number(o.original_amount), 0)
  
  let totalRepayments = 0
  if (reps) {
    const openIds = new Set(obs.map(o => o.id))
    totalRepayments = reps
      .filter(r => openIds.has(r.obligation_id))
      .reduce((sum, r) => sum + Number(r.amount), 0)
  }

  return totalOriginal - totalRepayments
}

export async function getActiveObligationsGrouped() {
  const { data: obs, error: obsError } = await supabase
    .from('obligations')
    .select('id, contact_id, original_amount, contact:contacts(id, name)')
    .eq('status', 'open')

  if (obsError || !obs) return []

  const { data: reps } = await supabase
    .from('obligation_repayments')
    .select('obligation_id, amount')

  const repMap: Record<string, number> = {}
  if (reps) {
    reps.forEach(r => {
      repMap[r.obligation_id] = (repMap[r.obligation_id] || 0) + Number(r.amount)
    })
  }

  const grouped: Record<string, { contactId: string, name: string, total: number }> = {}

  obs.forEach(ob => {
    if (!ob.contact_id) return
    if (!grouped[ob.contact_id]) {
      grouped[ob.contact_id] = {
        contactId: ob.contact_id,
        name: (ob.contact as any)?.name || 'Unknown',
        total: 0
      }
    }
    const repaid = repMap[ob.id] || 0
    grouped[ob.contact_id].total += (Number(ob.original_amount) - repaid)
  })

  return Object.values(grouped).sort((a, b) => b.total - a.total)
}
