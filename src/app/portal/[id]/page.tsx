import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Building, ArrowRight, Euro, Package, Clock, CalendarDays } from 'lucide-react'
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
    .select('*, invoices(*), company_hours(*)')
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
    let projectTotalPending = pendingAmount
    if (project.billing_type !== 'retainer_monthly' && rate > 0 && prepaidMin === 0) {
      projectTotalPending += (totalActiveMinutes / 60) * rate
    }

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
      remainingMin,
      totalActiveMinutes,
      activeHoursCount: activeHours.length
    }
  })

  const formatTime = (totalMin: number) => {
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${h}h ${m.toString().padStart(2, '0')}m`
  }

  return (
    <div className={styles.container}>
      <div className={styles.reportCard}>
        
        {/* Header / Company Info */}
        <div className={styles.header}>
          <div className={styles.companyInfo}>
            {settings?.logo_url && (
              <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '50px', marginBottom: '1.5rem', display: 'block' }} />
            )}
            <h1 style={{ fontSize: '2.5rem' }}>Area Riservata</h1>
            <p style={{ marginTop: '0.5rem' }}><Building size={24} /> {company.name}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {/* Global Retainers */}
            {globalRetainerAmount > 0 && (
              <div className={styles.statBlock} style={{ minWidth: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <div className={styles.statLabel}><CalendarDays size={16} /> Canoni Attivi</div>
                <div className={styles.statValue} style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                  € {globalRetainerAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
            
            {/* Global Pending */}
            <div className={styles.statBlock} style={{ minWidth: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div className={styles.statLabel}><Euro size={16} /> Totale da Saldare</div>
              <div className={styles.statValue} style={{ fontSize: '2rem', color: globalPendingAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                € {globalPendingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className={styles.projectsGrid}>
          {displayProjects.map(project => {
            const hasToken = !!project.report_token;
            return (
              <Link 
                href={hasToken ? `/report/${project.report_token}` : '#'} 
                key={project.id}
                className={styles.projectCard}
                onClick={(e) => { if (!hasToken) e.preventDefault(); }}
                style={{ cursor: hasToken ? 'pointer' : 'default', opacity: hasToken ? 1 : 0.7 }}
              >
                <div className={styles.projectHeader}>
                  <div>
                    <div className={styles.projectTitle}>{project.title}
                      {!hasToken && <span style={{ fontSize: '0.7rem', background: '#eee', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Setup in corso</span>}
                    </div>
                  <div className={styles.projectType}>
                    {project.billing_type === 'retainer_monthly' ? 'Canone Mensile' : 
                     project.prepaid_minutes > 0 ? 'Monte Ore' : 'Progetto a Corpo / Ore'}
                  </div>
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  <ArrowRight size={20} />
                </div>
              </div>
              
              <div className={styles.projectStats}>
                {project.billing_type === 'retainer_monthly' && (
                  <div className={styles.statRow}>
                    <span>Valore Canone</span>
                    <span style={{ color: 'var(--color-primary)' }}>€ {(project.billing_amount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                
                {project.prepaid_minutes > 0 && (
                  <div className={styles.statRow}>
                    <span>Credito Residuo</span>
                    <span style={{ color: project.remainingMin > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {formatTime(project.remainingMin)}
                    </span>
                  </div>
                )}
                
                {project.pendingAmount > 0 && (
                  <div className={styles.statRow}>
                    <span>Da Saldare</span>
                    <span style={{ color: 'var(--color-warning)' }}>
                      € {project.pendingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {project.pendingAmount === 0 && project.billing_type !== 'retainer_monthly' && project.prepaid_minutes === 0 && (
                  <div className={styles.statRow}>
                    <span>Stato Pagamenti</span>
                    <span style={{ color: 'var(--color-success)' }}>Regolare</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
          
          {displayProjects.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              Nessun progetto attivo al momento.
            </div>
          )}
        </div>

      </div>
    </div>
  )
  } catch (error) {
    console.error('Error generating portal:', error)
    return <div>Error loading portal</div>
  }
}
