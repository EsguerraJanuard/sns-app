'use server'

import { supabase } from '@/lib/supabase'

export async function getTotalObligations() {
  const { data, error } = await supabase
    .from('obligations')
    .select('remaining_amount')
    .eq('status', 'ACTIVE')

  if (error || !data) return 0

  return data.reduce((sum, ob) => sum + Number(ob.remaining_amount), 0)
}

export async function getActiveObligationsGrouped() {
  const { data, error } = await supabase
    .from('obligations')
    .select('contact_id, remaining_amount, contact:contacts(id, name)')
    .eq('status', 'ACTIVE')

  if (error || !data) return []

  const grouped: Record<string, { contactId: string, name: string, total: number }> = {}

  data.forEach(ob => {
    if (!ob.contact_id) return
    if (!grouped[ob.contact_id]) {
      grouped[ob.contact_id] = {
        contactId: ob.contact_id,
        name: (ob.contact as any)?.name || 'Unknown',
        total: 0
      }
    }
    grouped[ob.contact_id].total += Number(ob.remaining_amount)
  })

  // Sort by highest amount owed
  return Object.values(grouped).sort((a, b) => b.total - a.total)
}
