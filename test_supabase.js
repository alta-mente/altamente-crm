const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase
    .from('projects')
    .select('title, companies(name, contact_email)')
    .limit(2);
  console.log(JSON.stringify(data, null, 2));
}
main();
