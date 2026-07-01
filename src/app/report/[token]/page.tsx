import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Clock, Euro, CheckCircle2, Package, Archive, CalendarDays, Activity, Folder } from 'lucide-react'
import { RequestInvoiceButton } from './RequestInvoiceButton'
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

  return (
    <div className={styles.container}>
      {settings?.logo_url && (
        <div style={{ width: '100%', textAlign: 'center', marginBottom: '1rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={settings.logo_url} 
            alt="Logo Azienda" 
            style={{ maxHeight: '80px', objectFit: 'contain', margin: '0 auto' }} 
          />
        </div>
      )}
      
      <div className={styles.reportCard}>
        
        {/* Header Area */}
        <div className={styles.header}>
          <div className={styles.companyInfo}>
            <div className={styles.badge} style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <Activity size={14} /> REPORT ATTIVITÀ
            </div>
            <h1>{project.title}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{project.companies?.name || ''}</p>
            <p>
              <CalendarDays size={18} /> 
              Aggiornato al {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          {/* Stat Block */}
          <div className={styles.statBlock}>
            <div className={styles.statBlockIcon}>
              {prepaidMin > 0 ? <Package size={150} /> : rate > 0 ? <Euro size={150} /> : <Clock size={150} />}
            </div>
            
            {prepaidMin > 0 ? (
              <>
                <div className={styles.statLabel}>
                  <Package size={16} /> Credito Residuo
                </div>
                <div className={styles.statValue}>
                  {formatTime(remainingMin)}
                </div>
                
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBar}
                    style={{ 
                      width: `${usedPercentage}%`, 
                      background: usedPercentage > 80 ? 'var(--color-danger)' : usedPercentage > 50 ? 'var(--color-warning)' : 'var(--color-success)' 
                    }}
                  />
                </div>
                <div className={styles.progressLabels}>
                  <span>{formatTime(totalActiveMinutes)} usate</span>
                  <span>{formatTime(prepaidMin)} totali</span>
                </div>
              </>
            ) : rate > 0 ? (
              <>
                <div className={styles.statLabel}>
                  <Euro size={16} /> Totale Maturato
                </div>
                <div className={styles.statValue}>
                  € {((totalActiveMinutes / 60) * rate).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem' }}>
                  {formatTime(totalActiveMinutes)} ore in attesa
                </div>
                {totalActiveMinutes > 0 && (
                  <RequestInvoiceButton 
                    projectName={project.title} 
                    companyName={project.companies?.name || 'Azienda non specificata'} 
                    totalAmount={(totalActiveMinutes / 60) * rate}
                    reportUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'https://altamente-crm.vercel.app'}/report/${project.report_token}`}
                    logoUrl={settings?.logo_url || undefined}
                    clientEmail={project.companies?.contact_email || undefined}
                  />
                )}
              </>
            ) : (
              <>
                <div className={styles.statLabel}>
                  <Clock size={16} /> Ore in Attesa
                </div>
                <div className={styles.statValue}>
                  {formatTime(totalActiveMinutes)}
                </div>
                <div style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: 'var(--font-size-sm)' }}>
                  Nessuna tariffa impostata
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Hours Section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <div className={`${styles.iconWrapper} ${styles.active}`}>
              <CheckCircle2 size={24} />
            </div>
            Attività da fatturare
          </div>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrizione</th>
                <th className={styles.right}>Ore</th>
              </tr>
            </thead>
            <tbody>
              {activeHours.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className={styles.emptyState}>
                      <CheckCircle2 size={48} opacity={0.2} />
                      Nessuna attività in sospeso al momento.
                    </div>
                  </td>
                </tr>
              ) : (
                activeHours.map(row => (
                  <tr key={row.id}>
                    <td className={styles.date}>
                      {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td>{row.description}</td>
                    <td className={styles.right}>
                      {formatTime(row.minutes)}
                    </td>
                  </tr>
                ))
              )}
              {activeHours.length > 0 && (
                <tr className={styles.totalRow}>
                  <td colSpan={2} className={`${styles.right} ${styles.totalLabel}`}>
                    Totale Ore Selezionate
                  </td>
                  <td className={`${styles.right} ${styles.totalValue}`}>
                    {formatTime(totalActiveMinutes)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Archived Hours Section */}
        {archivedHours.length > 0 && (
          <div className={`${styles.section} ${styles.archivedSection}`}>
            <div className={styles.sectionTitle}>
              <div className={`${styles.iconWrapper} ${styles.archived}`}>
                <Archive size={20} />
              </div>
              Archivio Storico
            </div>
            
            <div>
              {sortedBatches.map(([batchId, data]) => {
                const batchDate = batchId !== 'pregresso' && batchId.length >= 8
                  ? new Date(batchId.slice(0,4) + '-' + batchId.slice(4,6) + '-' + batchId.slice(6,8)).toLocaleDateString('it-IT')
                  : 'Pregresso'
                
                const costDisplay = rate > 0 
                  ? `€ ${((data.totalMinutes / 60) * rate).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : null

                return (
                  <details key={batchId} className={styles.accordion}>
                    <summary className={styles.accordionSummary}>
                      <div className={styles.batchIcon}>
                        <Folder size={24} />
                      </div>
                      <div className={styles.batchTitle}>
                        Archiviato il {batchDate}
                      </div>
                      <div className={styles.batchStats}>
                        <span className={styles.batchTime}>({formatTime(data.totalMinutes)})</span>
                        {costDisplay && <span className={styles.batchCost}>— {costDisplay}</span>}
                      </div>
                    </summary>
                    <div className={styles.accordionContent}>
                      <table className={styles.table}>
                        <tbody>
                          {data.hours.map(row => (
                            <tr key={row.id}>
                              <td className={styles.date}>
                                {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td>{row.description}</td>
                              <td className={styles.right} style={{ color: 'var(--color-text-muted)' }}>
                                {formatTime(row.minutes)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )
              })}
            </div>
          </div>
        )}

      </div>
      
    </div>
  )
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
