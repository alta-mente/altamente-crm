const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: companyHours, error } = await supabase
    .from('company_hours')
    .select('*, companies(hourly_rate), projects(hourly_rate, prepaid_minutes, time_tracking_enabled)');
    
  if (error) console.error("Error:", error);
  const unbilled = companyHours?.filter(h => !h.billed);
  console.log("Total unbilled:", unbilled?.length);
  if (unbilled?.length > 0) {
    console.log("Sample unbilled h.projects:", unbilled[0].projects);
    const valid = unbilled.filter(h => (!h.projects?.prepaid_minutes || h.projects.prepaid_minutes === 0));
    console.log("Valid for consuntivi:", valid.length);
  }
}
run();
