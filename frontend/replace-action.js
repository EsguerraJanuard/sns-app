const fs = require('fs');
let code = fs.readFileSync('src/actions/transaction.ts', 'utf8');

// Update TransactionInput Type
code = code.replace(
  /funding_debt_amount\?: number\s*funding_debt_contact\?: string/m,
  'funding_debts?: { contact_name: string, amount: number }[]'
);

// Update implementation inside createTransaction
const oldImpl = `  if (input.funding_debt_amount && input.funding_debt_amount > 0 && input.funding_debt_contact && input.exchange_wallet_id && transferGroupId) {`;

const blockStart = code.indexOf(oldImpl);
if (blockStart > -1) {
  // Find the end of the block (which is before revalidatePath('/'))
  const blockEnd = code.indexOf("revalidatePath('/')", blockStart);
  
  const newImpl = `  // 5. Create Borrowed funding transactions (Multiple Lenders Support)
  if (input.funding_debts && input.funding_debts.length > 0) {
    for (const debt of input.funding_debts) {
      if (debt.amount > 0 && debt.contact_name) {
        let fundingContactId = null
        const { data: existingFundingContact } = await supabase.from('contacts').select('id').ilike('name', debt.contact_name).single()
        
        if (existingFundingContact) {
          fundingContactId = existingFundingContact.id
        } else {
          const { data: newFundingContact, error: insertFundingError } = await supabase
            .from('contacts')
            .insert({ name: debt.contact_name })
            .select('id')
            .single()
          if (!insertFundingError && newFundingContact) {
            fundingContactId = newFundingContact.id
          }
        }

        // Default to the main wallet if no exchange wallet
        const targetFundingWalletId = input.direction === 'IN' 
          ? (input.exchange_wallet_id || input.wallet_id) 
          : input.wallet_id;

        if (fundingContactId && targetFundingWalletId) {
          const { data: fundingTx } = await supabase
            .from('transactions')
            .insert({
              wallet_id: targetFundingWalletId,
              contact_id: fundingContactId,
              amount: debt.amount,
              direction: 'IN', // Borrowing money is money IN to the agent
              kind: 'BORROWED',
              note: 'Funded transaction',
              transfer_group_id: transferGroupId || tx.id // link to exchange group OR the main tx id
            })
            .select('id')
            .single()

          if (fundingTx) {
            await supabase.from('obligations').insert({
              contact_id: fundingContactId,
              origin_transaction_id: fundingTx.id,
              original_amount: debt.amount,
              status: 'open'
            })
          }
        }
      }
    }
  }

  `;
  code = code.substring(0, blockStart) + newImpl + code.substring(blockEnd);
  fs.writeFileSync('src/actions/transaction.ts', code);
  console.log('Done transaction.ts');
} else {
  console.log('Could not find old impl block');
}
