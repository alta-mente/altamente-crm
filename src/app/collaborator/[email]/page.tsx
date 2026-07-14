import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import CollaboratorClientApp from './CollaboratorClientApp'
import styles from '../../portal/Portal.module.css'

export default async function CollaboratorPortalPage({ params }: { params: { email: string } }) {
  const email = decodeURIComponent(params.email)
  const supabase = await createClient()

  // Fetch settings for logo
  const { data: settings } = await supabase.from('settings').select('*').single()

  // Fetch all projects assigned to this collaborator
  const { data: projects } = await supabase
    .from('projects')
    .select('*, companies(*), invoices(*), company_hours(*)')
    .eq('collaborator_email', email)

  if (!projects || projects.length === 0) {
    return (
      <div className={styles.portalContainer} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          {settings?.logo_url && (
            <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '60px', marginBottom: '2rem' }} />
          )}
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Nessun progetto trovato</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Non ci sono progetti assegnati a {email}</p>
        </div>
      </div>
    )
  }

  // Pre-calculate values
  const displayProjects = projects.map(p => {
    let pendingAmount = 0
    let paidAmount = 0

    if (p.invoices && p.invoices.length > 0) {
      p.invoices.forEach((inv: any) => {
        if (inv.status === 'paid') {
          paidAmount += Number(inv.amount)
        } else {
          pendingAmount += Number(inv.amount)
        }
      })
    }

    let remainingMin = 0
    let totalActiveMinutes = 0
    if (p.prepaid_minutes > 0) {
      remainingMin = p.prepaid_minutes
      if (p.company_hours && p.company_hours.length > 0) {
        const used = p.company_hours.reduce((acc: number, cur: any) => acc + (cur.minutes || 0), 0)
        totalActiveMinutes = used
        remainingMin -= used
      }
    } else if (p.time_tracking_enabled && p.company_hours) {
      // time tracking billing
      const billable = p.company_hours.filter((h: any) => !h.is_billed)
      totalActiveMinutes = billable.reduce((acc: number, cur: any) => acc + (cur.minutes || 0), 0)
    }

    // calculate accrued value
    let totalValue = 0
    if (p.billing_type?.startsWith('retainer') || (p.billing_amount > 0 && !p.time_tracking_enabled)) {
      totalValue = p.billing_amount || 0
    } else if (p.time_tracking_enabled) {
      totalValue = ((totalActiveMinutes / 60) * (p.hourly_rate || 0)) + paidAmount + pendingAmount
    }

    const commissionRate = p.commission_rate || 0
    const commissionValue = totalValue * (commissionRate / 100)

    return {
      ...p,
      pendingAmount,
      paidAmount,
      remainingMin,
      totalActiveMinutes,
      totalValue,
      commissionRate,
      commissionValue
    }
  })

  const globalTotalValue = displayProjects.reduce((acc, p) => acc + p.totalValue, 0)
  const globalTotalCommission = displayProjects.reduce((acc, p) => acc + p.commissionValue, 0)

  return (
    <div className={styles.portalContainer} style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          {settings?.logo_url && (
            <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '40px' }} />
          )}
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Portale Collaboratore</h1>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{email}</div>
          </div>
        </div>
        
        <CollaboratorClientApp 
          displayProjects={displayProjects}
          globalTotalValue={globalTotalValue}
          globalTotalCommission={globalTotalCommission}
          email={email}
        />
      </div>
    </div>
  )
}
