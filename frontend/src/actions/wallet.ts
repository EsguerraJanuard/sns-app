'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export type Wallet = {
  id: string
  name: string
  slug: string
  opening_balance: number
  sort_order: number
  is_active?: boolean
}

export type WalletWithBalance = Wallet & { expected_balance: number }

export async function getWallets(): Promise<WalletWithBalance[]> {
  const { data: wallets, error: walletsError } = await supabase
    .from('wallets')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (walletsError || !wallets) {
    console.error('Error fetching wallets:', walletsError)
    return []
  }

  const balances: Record<string, number> = {}
  
  wallets.forEach(w => {
    balances[w.id] = Number(w.opening_balance)
  })

  // Try fetching from the O(1) SQL View first
  const { data: viewData, error: viewError } = await supabase.from('wallet_balances').select('wallet_id, expected_balance')
  
  if (!viewError && viewData) {
    viewData.forEach(row => {
      balances[row.wallet_id] = Number(row.expected_balance)
    })
  } else {
    // FALLBACK: O(N) calculation if the View hasn't been created yet on the Supabase instance
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('wallet_id, amount, direction')
      .eq('status', 'active')
      
    if (txError) {
      console.error('Error fetching transactions for balances:', txError)
      return wallets.map(w => ({ ...w, expected_balance: Number(w.opening_balance) }))
    }

    transactions?.forEach(tx => {
      if (balances[tx.wallet_id] !== undefined) {
        if (tx.direction === 'IN') {
          balances[tx.wallet_id] += Number(tx.amount)
        } else if (tx.direction === 'OUT') {
          balances[tx.wallet_id] -= Number(tx.amount)
        }
      }
    })
  }

  return wallets.map(w => ({
    ...w,
    opening_balance: Number(w.opening_balance),
    expected_balance: balances[w.id]
  }))
}
