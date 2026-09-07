const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=\"([^\"]+)\"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/);
const url = urlMatch[1];
const key = keyMatch[1];
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('transactions').select().limit(1);
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
  } else {
    // create a dummy to check schema
    const { data: wallets } = await supabase.from('wallets').select('id').limit(1);
    const { data: dummy } = await supabase.from('transactions').insert({
      wallet_id: wallets[0].id,
      amount: 1,
      direction: 'IN',
      kind: 'REGULAR'
    }).select();
    console.log(Object.keys(dummy[0]));
    await supabase.from('transactions').delete().eq('id', dummy[0].id);
  }
}
run();
