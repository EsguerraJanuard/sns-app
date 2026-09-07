const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=\"([^\"]+)\"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/);
const url = urlMatch[1];
const key = keyMatch[1];
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
async function run() {
  const { data: contacts } = await supabase.from('contacts').select('*').limit(1);
  const { data: txs } = await supabase.from('transactions').select('*').limit(1);
  const { data, error } = await supabase.from('obligations').insert({
      contact_id: contacts[0].id,
      origin_transaction_id: txs[0].id,
      original_amount: 1,
      status: 'open'
  }).select();
  console.log('Result:', data, error);
}
run();
