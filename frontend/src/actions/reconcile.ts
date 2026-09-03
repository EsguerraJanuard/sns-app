'use server'

import { supabase } from '@/lib/supabase'

export async function saveReconciliation(input: {
  wallet_id: string
  expected_balance: number
  observed_balance: number
  difference: number
}) {
  const { error } = await supabase
    .from('reconciliations')
    .insert({
      wallet_id: input.wallet_id,
      expected_balance: input.expected_balance,
      observed_balance: input.observed_balance,
      difference: input.difference
    })

  if (error) {
    console.error('Error saving reconciliation:', error)
    // Even if it fails, we don't necessarily block the UI from showing the diff, 
    // but ideally we'd want this saved for history.
  }
}
