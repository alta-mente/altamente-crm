import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDunningEmail } from '@/app/actions/emails'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Fetch settings for logo
  const { data: settings } = await supabase
    .from('workspace_settings')
    .select('logo_url')
    .eq('id', 1)
    .single()

  // Find invoices that are pending and issued > 30 days ago
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thresholdDateStr = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: overdueInvoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*, projects(title, report_token, companies(id, name, contact_email))')
    .eq('status', 'pending')
    .lte('issue_date', thresholdDateStr)

  if (invoicesError) {
    console.error('Error fetching overdue invoices:', invoicesError)
    return NextResponse.json({ error: 'Database error fetching invoices' }, { status: 500 })
  }

  if (!overdueInvoices || overdueInvoices.length === 0) {
    return NextResponse.json({ message: 'Nessuna fattura scaduta da sollecitare.' })
  }

  let emailsSent = 0
  const results = []

  for (const inv of overdueInvoices) {
    // 1. Update status to 'late'
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'late' })
      .eq('id', inv.id)

    if (updateError) {
      console.error('Failed to update invoice status:', updateError)
      continue
    }

    // 2. Send email
    const project = inv.projects
    if (project && project.companies && project.companies.contact_email) {
      const company = project.companies
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://altamente-crm.vercel.app'}/portal/${company.id}`
      
      const emailResult = await sendDunningEmail({
        to: company.contact_email,
        companyName: company.name,
        projectName: project.title,
        amount: inv.amount,
        issueDate: inv.issue_date,
        portalUrl,
        logoUrl: settings?.logo_url
      })

      results.push({ invoiceId: inv.id, email: company.contact_email, success: emailResult.success })
      if (emailResult.success) emailsSent++
    } else {
      results.push({ invoiceId: inv.id, success: false, reason: 'Missing company or contact_email' })
    }
  }

  return NextResponse.json({ 
    message: `Cron job completato. Inviati ${emailsSent} solleciti automatici su ${overdueInvoices.length} fatture scadute.`,
    results 
  })
}
