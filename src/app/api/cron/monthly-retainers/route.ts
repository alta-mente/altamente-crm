import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  // Verify cron secret if configured in Vercel
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Fetch all active monthly retainer projects
  // We assume a project is active if its phase is not 'archiviato', 'archived', 'lost'
  // Or simply fetch all retainer_monthly and we filter out terminal phases
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, billing_amount, phase_id')
    .eq('billing_type', 'retainer_monthly')

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
    return NextResponse.json({ error: 'Database error fetching projects' }, { status: 500 })
  }

  // Filter out archived projects (adjust based on actual phase IDs)
  const activeProjects = projects.filter(p => 
    p.phase_id !== 'archiviato' && 
    p.phase_id !== 'archived' && 
    p.phase_id !== 'lost' && 
    p.billing_amount > 0
  )

  if (activeProjects.length === 0) {
    return NextResponse.json({ message: 'No active monthly retainers found.' })
  }

  const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  
  const invoicesToInsert = activeProjects.map(p => ({
    project_id: p.id,
    amount: p.billing_amount,
    status: 'pending',
    issue_date: todayStr
  }))

  const { error: insertError } = await supabase
    .from('invoices')
    .insert(invoicesToInsert)

  if (insertError) {
    console.error('Error inserting invoices:', insertError)
    return NextResponse.json({ error: 'Database error inserting invoices' }, { status: 500 })
  }

  return NextResponse.json({ 
    message: 'Monthly retainer invoices generated successfully', 
    count: invoicesToInsert.length 
  })
}
