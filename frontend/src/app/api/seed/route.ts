import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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
    revalidatePath('/', 'layout')
    return NextResponse.json({ message: 'Database wiped clean! Balances are back to zero.' })
  }
  
  if (action === 'populate') {
    // Ensure Cash wallet exists
    const { data: cashExists } = await supabase.from('wallets').select('id').eq('slug', 'cash').single()
    if (!cashExists) {
      await supabase.from('wallets').insert({ name: 'Cash', slug: 'cash', sort_order: 4 })
    }

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
    const obs = []
    const now = new Date()
    
    // Generate ~35 transactions over the last 7 days
    for (let i = 0; i < 35; i++) {
      const isOut = Math.random() > 0.5
      const wallet = wallets[Math.floor(Math.random() * wallets.length)]
      const contact = contacts[Math.floor(Math.random() * contacts.length)]
      const amount = Math.floor(Math.random() * 8000) + 150
      
      const occurredAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // random past 7 days

      // 10% chance it's borrowed money if it's incoming
      const isBorrowed = !isOut && Math.random() > 0.8 && contact
      
      txs.push({
        wallet_id: wallet.id,
        contact_id: Math.random() > 0.2 || isBorrowed ? contact : null, // 80% chance to have a contact, 100% if borrowed
        amount,
        direction: isOut ? 'OUT' : 'IN',
        kind: isBorrowed ? 'BORROWED' : 'REGULAR',
        occurred_at: occurredAt.toISOString(),
      })

      if (isBorrowed) {
        obs.push({
          contact_id: contact,
          original_amount: amount,
          status: 'open'
        })
      }
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

    // GUARANTEE a borrowed transaction
    const forcedContact = contacts[Math.floor(Math.random() * contacts.length)]
    txs.push({
      wallet_id: wallets[0].id,
      contact_id: forcedContact,
      amount: 7500,
      direction: 'IN',
      kind: 'BORROWED',
      occurred_at: now.toISOString()
    })
    obs.push({
      contact_id: forcedContact,
      original_amount: 7500,
      status: 'open'
    })

    await supabase.from('transactions').insert(txs)
    if (obs.length > 0) {
      await supabase.from('obligations').insert(obs)
    }

    revalidatePath('/', 'layout')

    return NextResponse.json({ message: 'Successfully seeded ~35 random transactions and contacts (including Borrowed Money)!' })

  }

  return NextResponse.json({ usage: 'Add ?action=populate to seed data, or ?action=reset to clear everything.' })
}
