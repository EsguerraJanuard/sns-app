const fs = require('fs');
let code = fs.readFileSync('src/actions/transaction.ts', 'utf8');

const startPattern = 'export async function voidTransaction(id: string) {';
const startIndex = code.indexOf(startPattern);

if (startIndex === -1) {
  console.log('Could not find voidTransaction');
  process.exit(1);
}

// Find the end of the function (where revalidatePath is called)
const endPattern = "revalidatePath('/', 'layout')";
const endIndex = code.indexOf(endPattern, startIndex);

if (endIndex === -1) {
  console.log('Could not find end of voidTransaction');
  process.exit(1);
}

// Find the closing brace after revalidatePath
const closingBraceIndex = code.indexOf('}', endIndex);

const newImpl = `export async function voidTransaction(id: string) {
  const { data: tx, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tx) {
    throw new Error('Transaction not found')
  }

  // 1. Grouping logic: find all transactions related to this operation
  const groupId = tx.transfer_group_id || tx.id;

  const { data: relatedTxs } = await supabase
    .from('transactions')
    .select('id, kind, transfer_group_id')
    .or(\`id.eq.\${id},transfer_group_id.eq.\${groupId}\`)

  if (!relatedTxs || relatedTxs.length === 0) return { success: false, error: 'No transactions found' }

  const txIdsToVoid = relatedTxs.map(t => t.id)

  // 2. Void all related transactions atomically
  await supabase
    .from('transactions')
    .update({ status: 'voided' })
    .in('id', txIdsToVoid)

  // 3. Cascading void for BORROWED / LENT
  const borrowedOrLentIds = relatedTxs.filter(t => t.kind === 'BORROWED' || t.kind === 'LENT').map(t => t.id)
  
  if (borrowedOrLentIds.length > 0) {
    const { data: obs } = await supabase
      .from('obligations')
      .select('id')
      .in('origin_transaction_id', borrowedOrLentIds)

    if (obs && obs.length > 0) {
      const obIds = obs.map(o => o.id)
      
      const { data: reps } = await supabase
        .from('obligation_repayments')
        .select('transaction_id')
        .in('obligation_id', obIds)
        
      if (reps && reps.length > 0) {
        const repTxIds = reps.map(r => r.transaction_id)
        
        await supabase
          .from('transactions')
          .update({ status: 'voided' })
          .in('id', repTxIds)
          
        await supabase
          .from('obligation_repayments')
          .delete()
          .in('obligation_id', obIds)
      }
      
      await supabase
        .from('obligations')
        .update({ status: 'voided' })
        .in('id', obIds)
    }
  }

  // 4. Cascading fix for REPAYMENTS
  const repaymentIds = relatedTxs.filter(t => t.kind === 'REPAYMENT').map(t => t.id)
  if (repaymentIds.length > 0) {
    for (const repId of repaymentIds) {
      const { data: reps } = await supabase
        .from('obligation_repayments')
        .select('obligation_id')
        .eq('transaction_id', repId)
        
      if (reps && reps.length > 0) {
        const obIds = reps.map(r => r.obligation_id)
        
        await supabase
          .from('obligation_repayments')
          .delete()
          .eq('transaction_id', repId)
          
        await supabase
          .from('obligations')
          .update({ status: 'open', settled_at: null })
          .in('id', obIds)
      }
    }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/transactions', 'layout')
  return { success: true }
}`;

code = code.substring(0, startIndex) + newImpl + code.substring(closingBraceIndex + 1);
fs.writeFileSync('src/actions/transaction.ts', code);
console.log('Replaced voidTransaction');
