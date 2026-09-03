import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const NAMES = ['Maria Santos', 'Juan Cruz', 'Supplier Auto', 'Tita Baby', 'Customer', 'Luzviminda', 'Kumpareng Boy']

export async function GET(req: Request) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')
  
  if (action === 'reset') {
    // Delete all data to start fresh
    await supabase.from('obligation_repayments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('obligations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    return NextResponse.json({ message: 'Database wiped clean! Balances are back to zero.' })
  }
  
  if (action === 'populate') {
    const { data: wallets } = await supabase.from('wallets').select('id, name')
    if (!wallets || wallets.length === 0) return NextResponse.json({ error: 'No wallets found' })

    // 1. Create contacts
    const contacts = []
    for (const name of NAMES) {
      const { data } = await supabase.from('contacts').insert({
        name,
        normalized_name: name.toLowerCase(),
        last_used_at: new Date().toISOString()
      }).select('id').single()
      if (data) contacts.push(data.id)
    }

    // 2. Create random transactions
    const txs = []
    const now = new Date()
    
    // Generate ~35 transactions over the last 7 days
    for (let i = 0; i < 35; i++) {
      const isOut = Math.random() > 0.5
      const wallet = wallets[Math.floor(Math.random() * wallets.length)]
      const contact = contacts[Math.floor(Math.random() * contacts.length)]
      const amount = Math.floor(Math.random() * 8000) + 150
      
      const occurredAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // random past 7 days

      txs.push({
        wallet_id: wallet.id,
        contact_id: Math.random() > 0.2 ? contact : null, // 80% chance to have a contact
        amount,
        direction: isOut ? 'OUT' : 'IN',
        kind: 'REGULAR',
        occurred_at: occurredAt.toISOString(),
      })
    }

    // Add a couple of really large transactions to test the "k" and "M" formatting
    txs.push({
      wallet_id: wallets.find(w => w.name.includes('MariBank'))?.id || wallets[0].id,
      contact_id: contacts[0],
      amount: 155000, // 155k
      direction: 'IN',
      kind: 'REGULAR',
      occurred_at: now.toISOString()
    })
    
    txs.push({
      wallet_id: wallets.find(w => w.name.includes('Maya'))?.id || wallets[1].id,
      amount: 1200000, // 1.2M
      direction: 'IN',
      kind: 'REGULAR',
      occurred_at: now.toISOString()
    })

    await supabase.from('transactions').insert(txs)

    return NextResponse.json({ message: 'Successfully seeded ~35 random transactions and contacts!' })
  }

  return NextResponse.json({ usage: 'Add ?action=populate to seed data, or ?action=reset to clear everything.' })
}
