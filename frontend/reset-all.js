const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=\"([^\"]+)\"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/);
const url = urlMatch[1];
const key = keyMatch[1];
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function run() {
  console.log('Resetting all data to zero...');
  
  // 1. obligation_repayments
  await supabase.from('obligation_repayments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('obligation_repayments deleted.');

  // 2. obligations
  await supabase.from('obligations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('obligations deleted.');

  // 3. transactions
  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('transactions deleted.');

  // 4. contacts (optional, but good for a fresh start)
  await supabase.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('contacts deleted.');

  // Set opening balances of all wallets to 0
  await supabase.from('wallets').update({ opening_balance: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Wallet balances reset to 0.');

  console.log('Done!');
}
run();
