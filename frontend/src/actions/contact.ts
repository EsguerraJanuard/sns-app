'use server'

import { supabase } from '@/lib/supabase'

export async function searchContacts(query: string) {
  if (!query || query.trim().length === 0) {
    // Return recent contacts
    const { data } = await supabase
      .from('contacts')
      .select('id, name')
      .order('last_used_at', { ascending: false, nullsFirst: false })
      .limit(5)
    return data || []
  }

  const normalized = query.trim().toLowerCase()

  const { data, error } = await supabase
    .from('contacts')
    .select('id, name')
    .ilike('normalized_name', `%${normalized}%`)
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .limit(5)

  if (error) {
    console.error('Error searching contacts:', error)
    return []
  }

  return data
}

export async function getObligations() {
  const { data: obligations, error: obError } = await supabase
    .from('obligations')
    .select(`
      *,
      contact:contacts(name),
      repayments:obligation_repayments(amount)
    `)
    .eq('status', 'open')

  if (obError || !obligations) {
    console.error('Error fetching obligations:', obError)
    return []
  }

  return obligations.map(ob => {
    // @ts-ignore
    const totalRepaid = ob.repayments?.reduce((sum, r) => sum + Number(r.amount), 0) || 0
    const remaining = Number(ob.original_amount) - totalRepaid
    
    return {
      ...ob,
      remaining
    }
  }).filter(ob => ob.remaining > 0)
}
