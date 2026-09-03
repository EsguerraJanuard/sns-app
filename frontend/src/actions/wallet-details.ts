'use server'

import { supabase } from '@/lib/supabase'
import { WalletWithBalance } from './wallet'

export async function getWalletBySlug(slug: string): Promise<WalletWithBalance | null> {
  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !wallet) return null

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, direction')
    .eq('wallet_id', wallet.id)
    .eq('status', 'active')

  let balance = Number(wallet.opening_balance)
  transactions?.forEach(tx => {
    if (tx.direction === 'IN') balance += Number(tx.amount)
    if (tx.direction === 'OUT') balance -= Number(tx.amount)
  })

  return { ...wallet, expected_balance: balance, opening_balance: Number(wallet.opening_balance) }
}
