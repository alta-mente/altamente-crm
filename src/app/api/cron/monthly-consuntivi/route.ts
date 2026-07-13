import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMonthlyConsuntiviEmail } from '@/app/actions/emails'
import { generateReportToken } from '@/app/actions/time-tracking'

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

  // 1. Fetch all projects with companies
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*, companies(name, contact_email)')

  if (projectsError || !projects) {
    console.error('Error fetching projects:', projectsError)
    return NextResponse.json({ error: 'Database error fetching projects' }, { status: 500 })
  }

  // 2. Auto-generate pending invoices for monthly retainers
  const now = new Date()
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthStr = prevMonthDate.toLocaleDateString('it-IT', { month: '2-digit', year: 'numeric' })
  const noteStr = `Canone Mensile - ${prevMonthStr}`

  for (const p of projects) {
    if (p.billing_type === 'retainer_monthly' && p.billing_amount > 0) {
      // Check if retainer started before or during previous month
      const startDate = p.billing_start_date ? new Date(p.billing_start_date) : new Date(p.created_at)
      const startMonthDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      
      if (prevMonthDate.getTime() >= startMonthDate.getTime()) {
        const { data: existing } = await supabase
          .from('invoices')
          .select('id')
          .eq('project_id', p.id)
          .eq('notes', noteStr)
          .maybeSingle()

        if (!existing) {
          await supabase.from('invoices').insert({
            project_id: p.id,
            amount: p.billing_amount,
            status: 'pending',
            notes: noteStr,
            issue_date: new Date().toISOString().split('T')[0]
          })
        }
      }
    }
  }

  // 3. Fetch unbilled hours and pending invoices
  const { data: unbilledHours } = await supabase.from('company_hours').select('*').eq('billed', false)
  const { data: pendingInvoices } = await supabase.from('invoices').select('*').eq('status', 'pending')

  // 4. Aggregate data by project
  const projectStats = new Map<string, {
    project: any,
    totalMinutes: number,
    hourlyAmount: number,
    retainerAmount: number
  }>()

  projects.forEach(p => {
    projectStats.set(p.id, {
      project: p,
      totalMinutes: 0,
      hourlyAmount: 0,
      retainerAmount: 0
    })
  })

  // Add hours (only if prepaid_minutes is 0 or null)
  if (unbilledHours) {
    unbilledHours.forEach(h => {
      const stats = projectStats.get(h.project_id)
      if (stats && (!stats.project.prepaid_minutes || stats.project.prepaid_minutes === 0)) {
        stats.totalMinutes += h.minutes
        const rate = stats.project.hourly_rate || 0
        stats.hourlyAmount += (h.minutes / 60) * rate
      }
    })
  }

  // Add pending invoices
  if (pendingInvoices) {
    pendingInvoices.forEach(inv => {
      const stats = projectStats.get(inv.project_id)
      if (stats) {
        stats.retainerAmount += Number(inv.amount)
      }
    })
  }

  // 5. Send emails
  const results = []
  let emailsSent = 0

  for (const [projId, stats] of Array.from(projectStats.entries())) {
    const { project, totalMinutes, hourlyAmount, retainerAmount } = stats
    const clientEmail = project.companies?.contact_email
    const totalToBill = hourlyAmount + retainerAmount
    
    if ((totalToBill > 0 || project.always_send_report) && clientEmail) {
      let token = project.report_token
      if (!token) {
        token = await generateReportToken(projId)
      }

      const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://altamente-crm.vercel.app'}/report/${token}`
      const totalHoursStr = `${Math.floor(totalMinutes / 60)}h ${(totalMinutes % 60).toString().padStart(2, '0')}m`
      const hourlyRate = project.hourly_rate || 0

      const result = await sendMonthlyConsuntiviEmail({
        to: clientEmail,
        companyName: project.companies?.name || 'Azienda',
        projectName: project.title,
        hourlyRate,
        hourlyAmount,
        retainerAmount,
        totalAmount: totalToBill,
        totalHoursStr,
        reportUrl,
        logoUrl: settings?.logo_url
      })
      
      results.push({ projectId: projId, email: clientEmail, success: result.success })
      if (result.success) emailsSent++
    }
  }

  return NextResponse.json({ 
    message: `Cron job completato. Inviate ${emailsSent} email di riepilogo consuntivi.`,
    results 
  })
}
