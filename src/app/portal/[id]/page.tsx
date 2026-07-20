import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Building, ArrowRight, Euro, Package, Clock, CalendarDays } from 'lucide-react'
import { PortalClientApp } from './PortalClientApp'
import Link from 'next/link'
import styles from '../Portal.module.css'

export const dynamic = 'force-dynamic'

export default async function PublicPortalPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  try {
    const resolvedParams = await params
  
  if (!resolvedParams.id || resolvedParams.id.length < 10) {
    notFound()
  }

  // Create admin client for public page
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Fetch all active projects for this company
  // We consider a project "active" if it's not explicitly archived, but we don't have an archived flag yet.
  // We'll fetch all projects and their invoices + hours.
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*, invoices(*), company_hours(*), deals(description, quote_description)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
  }

  // Fetch settings for logo
  const { data: settings } = await supabase
    .from('workspace_settings')
    .select('logo_url')
    .eq('id', 1)
    .single()

  // Calculate global stats
  let globalPendingAmount = 0
  let globalRetainerAmount = 0
  let globalPrepaidRemaining = 0
  
  const displayProjects = (projects || []).map(project => {
    // Invoices
    const pendingInvoices = (project.invoices || []).filter((i: any) => i.status === 'pending' || i.status === 'late')
    const pendingAmount = pendingInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0)
    
    // Hours
    const activeHours = (project.company_hours || []).filter((h: any) => !h.billed)
    const totalActiveMinutes = activeHours.reduce((sum: number, h: any) => sum + h.minutes, 0)
    
    // Derived stats
    const prepaidMin = project.prepaid_minutes || 0
    const remainingMin = Math.max(0, prepaidMin - totalActiveMinutes)
    const rate = project.hourly_rate || 0
    
    // For non-retainer projects with time tracking, add the unbilled hours value to pending amount
    // For non-retainer projects with time tracking, do not automatically add unbilled hours to pending amount.
    // The client only "owes" what has been invoiced.
    let projectTotalPending = pendingAmount

    if (project.billing_type !== 'retainer_monthly' && project.time_tracking_enabled === false && project.billing_amount > 0) {
      const paidInvoices = (project.invoices || []).filter((i: any) => i.status === 'paid')
      const totalPaidAmount = paidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0)
      projectTotalPending = Math.max(0, project.billing_amount - totalPaidAmount)
    }

    // Unbilled value (for display only)
    const unbilledValue = (project.billing_type !== 'retainer_monthly' && rate > 0 && prepaidMin === 0) ? (totalActiveMinutes / 60) * rate : 0;

    // Accumulate global
    globalPendingAmount += projectTotalPending
    if (project.billing_type === 'retainer_monthly') {
      globalRetainerAmount += (project.billing_amount || 0)
    }
    if (prepaidMin > 0) {
      globalPrepaidRemaining += remainingMin
    }

    return {
      ...project,
      pendingAmount: projectTotalPending,
      unbilledValue,
      remainingMin,
      totalActiveMinutes,
      activeHoursCount: activeHours.length
    }
  })

  return (
    <PortalClientApp 
      company={company} 
      settings={settings} 
      displayProjects={displayProjects}
      globalRetainerAmount={globalRetainerAmount}
      globalPendingAmount={globalPendingAmount}
      globalPrepaidRemaining={globalPrepaidRemaining}
    />
  )
  } catch (error) {
    console.error('Error generating portal:', error)
    return <div>Error loading portal</div>
  }
}
