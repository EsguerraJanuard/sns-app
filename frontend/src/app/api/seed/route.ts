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
    const contacts: string[] = []
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
    
    // Generate ~40 transactions over the last 7 days
    for (let i = 0; i < 40; i++) {
      const isOut = Math.random() > 0.6
      const wallet = wallets[Math.floor(Math.random() * wallets.length)]
      const contact = contacts[Math.floor(Math.random() * contacts.length)]
      const amount = Math.floor(Math.random() * 5000) + 100
      
      const date = new Date(now)
      date.setHours(date.getHours() - Math.floor(Math.random() * 168))
      
      let kind = 'CASH_IN'
      if (isOut) kind = 'CASH_OUT'

      // Force some LENT, BORROWED, and EXPENSE
      if (i === 5 || i === 6) { kind = 'BORROWED'; }
      if (i === 10 || i === 11) { kind = 'LENT'; }
      if (i === 15) { kind = 'EXPENSE'; }
      
      let direction = isOut ? 'OUT' : 'IN'
      if (kind === 'BORROWED') direction = 'IN' // User receives money they borrowed
      if (kind === 'LENT') direction = 'OUT' // User gives money to customer
      if (kind === 'EXPENSE') direction = 'OUT'
      
      const tx = {
        wallet_id: wallet.id,
        contact_id: kind === 'EXPENSE' ? null : contact,
        amount,
        direction,
        kind,
        created_at: date.toISOString(),
        note: kind === 'EXPENSE' ? 'Kuryente bill' : null
      }
      
      txs.push(tx)
    }

    const { data: insertedTxs } = await supabase.from('transactions').insert(txs).select('*')

    const obligationsToInsert = []
    if (insertedTxs) {
      for (const tx of insertedTxs) {
        if (tx.kind === 'BORROWED' || tx.kind === 'LENT') {
          obligationsToInsert.push({
            contact_id: tx.contact_id,
            origin_transaction_id: tx.id,
            original_amount: tx.amount,
            status: 'open',
            opened_at: tx.created_at
          })
        }
      }
    }
    
    if (obligationsToInsert.length > 0) {
      await supabase.from('obligations').insert(obligationsToInsert)
    }

    revalidatePath('/', 'layout')
    return NextResponse.json({ message: 'Database populated with random data (including Utang Mo, Pautang, & Expenses)!' })
  }
  
  return NextResponse.json({ message: 'Call /api/seed?action=reset or /api/seed?action=populate' })
}
