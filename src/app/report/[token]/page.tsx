import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { ProjectDetailView } from '@/components/portal/ProjectDetailView'
import styles from '../Report.module.css'

export const dynamic = 'force-dynamic'

export default async function PublicReportPage({ 
  params 
}: { 
  params: Promise<{ token: string }>
}) {
  try {
    const resolvedParams = await params
  
  if (!resolvedParams.token || resolvedParams.token.length < 5) {
    notFound()
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find project by token
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, companies(name, contact_email)')
    .eq('report_token', resolvedParams.token)
    .single()

  // Fetch settings for logo
  const { data: settings } = await supabase
    .from('workspace_settings')
    .select('logo_url')
    .eq('id', 1)
    .single()

  if (projectError || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.reportCard} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Activity size={40} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '0.5rem' }}>Accesso Negato</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Il link al report non è valido oppure è scaduto.</p>
        </div>
      </div>
    )
  }

  // Fetch hours
  const { data: hours, error: hoursError } = await supabase
    .from('company_hours')
    .select('*')
    .eq('project_id', project.id)
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  if (hoursError) {
    console.error('Error fetching hours:', hoursError)
  }

  // Fetch all invoices
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .eq('project_id', project.id)
    .order('issue_date', { ascending: false })
    
  if (invoicesError) {
    console.error('Error fetching invoices:', invoicesError)
  }

  const allInvoices = invoices || []
  const pendingInvoices = allInvoices.filter(i => i.status === 'pending' || i.status === 'late')
  const paidInvoices = allInvoices.filter(i => i.status === 'paid')
  const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const totalPaidAmount = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)

  const allHours = hours || []
  const activeHours = allHours.filter(h => !h.billed)
  const archivedHours = allHours.filter(h => h.billed)

  const archivedBatches = archivedHours.reduce((acc, row) => {
    const batch = row.batch_id || 'pregresso'
    if (!acc[batch]) acc[batch] = { hours: [], totalMinutes: 0 }
    acc[batch].hours.push(row)
    acc[batch].totalMinutes += row.minutes
    return acc
  }, {} as Record<string, { hours: typeof archivedHours, totalMinutes: number }>)
  
  const sortedBatches = Object.entries(archivedBatches).sort(([batchA], [batchB]) => {
    return batchB.localeCompare(batchA)
  })

  const totalActiveMinutes = activeHours.reduce((acc, curr) => acc + curr.minutes, 0)
  
  const formatTime = (minutes: number) => {
    const h = Math.floor(Math.abs(minutes) / 60)
    const m = Math.abs(minutes) % 60
    return `${minutes < 0 ? '-' : ''}${h}h ${m.toString().padStart(2, '0')}m`
  }

  const prepaidMin = project.prepaid_minutes || 0
  const rate = project.hourly_rate || 0
  
  const usedPercentage = prepaidMin > 0 ? Math.max(0, Math.min(100, (totalActiveMinutes / prepaidMin) * 100)) : 0
  const remainingMin = Math.max(0, prepaidMin - totalActiveMinutes)

  const projectData = {
    ...project,
    invoices: allInvoices,
    company_hours: allHours,
  }

  return <ProjectDetailView project={projectData} settings={settings} />
  } catch (error: any) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'sans-serif' }}>
        <h2>Errore Server (Debug)</h2>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING'}</p>
        <p>KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'}</p>
      </div>
    )
  }
}
