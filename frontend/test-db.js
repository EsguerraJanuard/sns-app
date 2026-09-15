const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\n]+)["']?/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\n]+)["']?/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = keyMatch ? keyMatch[1].trim() : process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: viewData, error: viewError } = await supabase.from('wallet_balances').select('wallet_id, expected_balance');
  console.log('VIEW DATA:', viewData);
  console.log('VIEW ERROR:', viewError);
}
run();
