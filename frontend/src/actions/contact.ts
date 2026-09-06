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

export async function getTopContacts(limit: number = 3) {
  // Fetch recent transactions to tally the most frequent contacts (Suki)
  const { data } = await supabase
    .from('transactions')
    .select(`
      id,
      transfer_group_id,
      contact_id,
      contact:contacts(id, name),
      wallet:wallets(name)
    `)
    .not('contact_id', 'is', null)
    .neq('status', 'voided')
    .order('created_at', { ascending: false })
    .limit(300)

  if (!data) return []

  const tally: Record<string, { id: string, name: string, count: number }> = {}
  const processedGroups = new Set<string>()

  data.forEach((tx: any) => {
    // Filter out auto-supply transactions from "Suki"
    const walletName = tx.wallet && !Array.isArray(tx.wallet) ? tx.wallet.name : ''
    if (walletName.toLowerCase().includes('auto-supply')) return

    if (tx.contact) {
      // Handle Supabase relation typing (sometimes array, sometimes object)
      const c = Array.isArray(tx.contact) ? tx.contact[0] : tx.contact
      
      // Prevent double counting 2-part/3-part transfers
      const uniqueId = tx.transfer_group_id || tx.id
      if (processedGroups.has(uniqueId)) return
      processedGroups.add(uniqueId)

      if (!tally[c.id]) {
        tally[c.id] = { id: c.id, name: c.name, count: 0 }
      }
      tally[c.id].count++
    }
  })

  // Sort by highest count and return top N
  return Object.values(tally)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
