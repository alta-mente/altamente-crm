const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, companies(name, contact_email)')
    .ilike('title', '%pesaro%')
    .single();

  if (error) {
    console.error(error);
    return;
  }
  
  console.log("Project:", project.title);
  console.log("Company ID:", project.company_id);
  console.log("Company:", project.companies?.name);
  console.log("Contact Email:", project.companies?.contact_email);
  console.log("Always Send Report:", project.always_send_report);
  console.log("Prepaid minutes:", project.prepaid_minutes);
  console.log("Hourly rate:", project.hourly_rate);

  const { data: unbilledHours } = await supabase.from('company_hours').select('minutes').eq('project_id', project.id).eq('billed', false);
  const totalUnbilled = unbilledHours?.reduce((sum, h) => sum + h.minutes, 0) || 0;
  console.log("Total unbilled minutes:", totalUnbilled);

  const { data: pendingInvoices } = await supabase.from('invoices').select('amount').eq('project_id', project.id).in('status', ['pending', 'late']);
  const totalPending = pendingInvoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  console.log("Total pending amount:", totalPending);
}
main();
