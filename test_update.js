require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // get any project id
  const { data: proj } = await supabase.from('projects').select('id').limit(1).single();
  if (!proj) {
    console.error("No project found");
    return;
  }
  
  const { data, error } = await supabase.from('projects').update({ description: "test" }).eq('id', proj.id);
  console.log("Error:", error);
}

run();
