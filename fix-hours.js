require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: projects } = await supabase.from('projects').select('id, title').ilike('title', '%altamente%')
  console.log('Found projects:', projects)
  
  if (projects.length === 0) return;
  const pId = projects[0].id;
  
  const { data: hours } = await supabase.from('company_hours').select('*').eq('project_id', pId).eq('billed', true)
  
  const badHours = hours.filter(h => !h.batch_id || !h.invoice_id)
  console.log(`Found ${badHours.length} hours to fix`)
  
  const { data: invoices } = await supabase.from('invoices').select('*').eq('project_id', pId).order('created_at', { ascending: false }).limit(1)
  
  if (badHours.length > 0 && invoices.length > 0) {
    const invId = invoices[0].id
    const batchId = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
    
    console.log('Updating to invoice', invId, 'and batch', batchId)
    
    const { error } = await supabase.from('company_hours').update({
      batch_id: batchId,
      invoice_id: invId
    }).in('id', badHours.map(h => h.id))
    
    if (error) console.error(error)
    else console.log('Fixed!')
  }
}
run()
