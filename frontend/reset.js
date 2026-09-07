const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=\"([^\"]+)\"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/);
const url = urlMatch[1];
const key = keyMatch[1];
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
async function run() {
  const { data: wallets } = await supabase.from('wallets').select('*').eq('slug', 'cash').single();
  const { data: txs } = await supabase.from('transactions').select('amount, direction, wallet_id');
  let balance = wallets.opening_balance;
  for (const tx of txs || []) {
    if (tx.wallet_id === wallets.id) {
      if (tx.direction === 'IN') balance += tx.amount;
      if (tx.direction === 'OUT') balance -= tx.amount;
    }
  }
  console.log('Current Computed Balance:', balance);
  
  const offset = -balance + wallets.opening_balance;
  await supabase.from('wallets').update({ opening_balance: offset }).eq('slug', 'cash');
  console.log('Updated opening_balance to:', offset, 'so current balance is now 0');
}
run();
