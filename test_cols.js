const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: d } = await supabase.from('deals').select('*').limit(1);
  const { data: p } = await supabase.from('projects').select('*').limit(1);
  console.log("Deals:", d ? Object.keys(d[0]||{}) : 'err');
  console.log("Projects:", p ? Object.keys(p[0]||{}) : 'err');
}
run();
