'use client'

import React from 'react'
import { Clock, Euro, CheckCircle2, Package, Archive, CalendarDays, Activity, Folder, RefreshCw, ArrowLeft } from 'lucide-react'
import { RequestInvoiceButton } from '@/app/report/[token]/RequestInvoiceButton'
import styles from '@/app/report/Report.module.css'

interface ProjectDetailViewProps {
  project: any
  settings: any
  onBack?: () => void
}

export function ProjectDetailView({ project, settings, onBack }: ProjectDetailViewProps) {
  const allInvoices = project.invoices || []
  const pendingInvoices = allInvoices.filter((i: any) => i.status === 'pending' || i.status === 'late')
  const paidInvoices = allInvoices.filter((i: any) => i.status === 'paid')
  const totalPendingAmount = pendingInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0)
  const totalPaidAmount = paidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0)

  const allHours = project.company_hours ? [...project.company_hours].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []
  const activeHours = allHours.filter((h: any) => !h.billed)
  const archivedHours = allHours.filter((h: any) => h.billed)

  const archivedBatches = archivedHours.reduce((acc: any, row: any) => {
    const batch = row.batch_id || 'pregresso'
    if (!acc[batch]) acc[batch] = { hours: [], totalMinutes: 0 }
    acc[batch].hours.push(row)
    acc[batch].totalMinutes += row.minutes
    return acc
  }, {} as Record<string, { hours: any[], totalMinutes: number }>)
  
  const sortedBatches = Object.entries(archivedBatches).sort(([batchA], [batchB]) => {
    return batchB.localeCompare(batchA)
  })

  const totalActiveMinutes = activeHours.reduce((acc: number, curr: any) => acc + curr.minutes, 0)
  
  const formatTime = (minutes: number) => {
    const h = Math.floor(Math.abs(minutes) / 60)
    const m = Math.abs(minutes) % 60
    return `${minutes < 0 ? '-' : ''}${h}h ${m.toString().padStart(2, '0')}m`
  }

  const prepaidMin = project.prepaid_minutes || 0
  const rate = project.hourly_rate || 0
  
  const usedPercentage = prepaidMin > 0 ? Math.max(0, Math.min(100, (totalActiveMinutes / prepaidMin) * 100)) : 0
  const remainingMin = Math.max(0, prepaidMin - totalActiveMinutes)
  
  let nextRenewal = null;
  let canCancel = true;
  if (project.billing_type === 'retainer_yearly' && project.billing_start_date) {
    const start = new Date(project.billing_start_date);
    if (!isNaN(start.getTime())) {
      const today = new Date();
      nextRenewal = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      while (nextRenewal <= today) {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
      }
      const oneMonthBefore = new Date(nextRenewal);
      oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
      if (today >= oneMonthBefore) {
        canCancel = false;
      }
    }
  }

  return (
    <div className={styles.container}>
      {settings?.logo_url && (
        <div style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
          {onBack ? (
            <button 
              onClick={onBack}
              style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
            >
              <ArrowLeft size={16} /> Area Cliente
            </button>
          ) : project?.company_id ? (
            <a 
              href={`/portal/${project.company_id}`}
              style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}
            >
              <ArrowLeft size={16} /> Area Cliente
            </a>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={settings.logo_url} 
            alt="Logo Azienda" 
            style={{ maxHeight: '80px', objectFit: 'contain', margin: '0 auto' }} 
          />
        </div>
      )}
      
      {!settings?.logo_url && onBack && (
        <div style={{ width: '100%', marginBottom: '1rem' }}>
          <button 
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
          >
            <ArrowLeft size={16} /> Torna alla Dashboard
          </button>
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
              {project.billing_type?.startsWith('retainer') ? <RefreshCw size={150} /> : prepaidMin > 0 ? <Package size={150} /> : rate > 0 ? <Euro size={150} /> : <Clock size={150} />}
            </div>
            
            {project.billing_type?.startsWith('retainer') ? (
              <>
                <div className={styles.statLabel}>
                  <RefreshCw size={16} /> {project.billing_type === 'retainer_yearly' ? 'Canone Annuale' : 'Canone Mensile'}
                </div>
                <div className={styles.statValue} style={{ color: 'var(--color-primary)' }}>
                  € {(project.billing_amount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </div>
                {totalPendingAmount > 0 ? (
                  <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-warning)' }}>
                      Fatture/Canoni in sospeso: € {totalPendingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>
                    Nessun canone in sospeso al momento.
                  </div>
                )}
                {project.billing_type === 'retainer_yearly' && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ marginBottom: '1rem' }}>
                      I canoni annuali si intendono attivati per 12 mesi al termine dei quali verranno rinnovati per un periodo analogo. L’eventuale disdetta va finalizzata almeno un mese prima del rinnovo automatico.
                    </p>
                    <p style={{ marginBottom: '1.5rem' }}>
                      Non sono considerati all’interno del canone tutti gli eventuali costi vivi, come ad esempio trasferte, acquisto plug-in per funzionalità non previste inizialmente, che verranno preventivati ove esigenti (di volta in volta, di lavoro in lavoro), e per i quali si dovrà procedere solo ed esclusivamente previa approvazione del Cliente.
                    </p>
                    <button 
                      disabled={!canCancel}
                      onClick={() => alert("Per procedere con la disdetta, contatta l'amministrazione.")}
                      style={{ background: canCancel ? 'var(--color-danger)' : 'var(--color-surface-hover)', color: canCancel ? '#fff' : 'var(--color-text-muted)', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: canCancel ? 'pointer' : 'not-allowed', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', width: '100%' }}>
                      {canCancel ? 'Disdici Canone' : 'Disdetta non disponibile (meno di 1 mese al rinnovo)'}
                    </button>
                  </div>
                )}
              </>
            ) : project.time_tracking_enabled === false ? (
              (() => {
                const totalInvoiced = totalPaidAmount + totalPendingAmount;
                const unInvoicedAmount = Math.max(0, project.billing_amount - totalInvoiced);
                const toPayAmount = project.billing_amount > 0 ? Math.max(0, project.billing_amount - totalPaidAmount) : totalPendingAmount;
                
                return (
                  <>
                    <div className={styles.statLabel}>
                      <Euro size={16} /> Totale da Saldare
                    </div>
                    <div className={styles.statValue} style={{ color: toPayAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      € {toPayAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </div>
                    
                    {project.billing_amount > 0 && (
                      <div style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: 'var(--font-size-sm)' }}>
                        Valore progetto: € {project.billing_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                    
                    {toPayAmount === 0 && (
                      <div style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>
                        Nessun pagamento in sospeso al momento.
                      </div>
                    )}

                    {totalPendingAmount > 0 && (
                      <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-warning)' }}>
                          Di cui già fatturato (da saldare): € {totalPendingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    )}

                    {unInvoicedAmount > 0 && (
                      <div style={{ marginTop: totalPendingAmount > 0 ? '0.5rem' : '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
                          {totalInvoiced > 0 ? 'Saldo / scaglioni da fatturare:' : 'Fatture non ancora emesse:'} € {unInvoicedAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </div>
                        {totalInvoiced === 0 && (
                          <RequestInvoiceButton 
                            projectId={project.id}
                            projectName={project.title} 
                            companyName={project.companies?.name || 'Azienda non specificata'} 
                            totalAmount={unInvoicedAmount}
                            reportUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'https://altamente-crm.vercel.app'}/report/${project.report_token}`}
                            logoUrl={settings?.logo_url || undefined}
                            clientEmail={project.companies?.contact_email || undefined}
                          />
                        )}
                      </div>
                    )}
                  </>
                );
              })()
            ) : prepaidMin > 0 ? (
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
                  <Euro size={16} /> Da Saldare (Fatturato)
                </div>
                <div className={styles.statValue} style={{ color: totalPendingAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  € {totalPendingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {totalActiveMinutes > 0 && (
                  <div style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                    + € {((totalActiveMinutes / 60) * rate).toLocaleString('it-IT', { minimumFractionDigits: 2 })} per {formatTime(totalActiveMinutes)} di nuove lavorazioni in corso non ancora fatturate.
                  </div>
                )}
                {totalPendingAmount === 0 && totalActiveMinutes === 0 && (
                  <div style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem', color: 'var(--color-success)' }}>
                    Stato pagamenti regolare.
                  </div>
                )}
                {(totalActiveMinutes > 0 || totalPendingAmount > 0) && (
                  <RequestInvoiceButton 
                    projectId={project.id}
                    projectName={project.title} 
                    companyName={project.companies?.name || 'Azienda non specificata'} 
                    totalAmount={((totalActiveMinutes / 60) * rate) + totalPendingAmount}
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

        {/* Storico Canoni Section (Retainer Only) */}
        {project.billing_type?.startsWith('retainer') && allInvoices && allInvoices.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={`${styles.iconWrapper}`} style={{ background: 'var(--color-primary)', color: '#fff' }}>
                <CalendarDays size={24} />
              </div>
              Storico Canoni
            </div>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data / Mese</th>
                  <th>Descrizione</th>
                  <th>Stato</th>
                  <th className={styles.right}>Importo</th>
                </tr>
              </thead>
              <tbody>
                {allInvoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className={styles.date}>
                      {new Date(inv.issue_date).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                    </td>
                    <td>{inv.notes || (project.billing_type === 'retainer_yearly' ? 'Canone Annuale' : 'Canone Mensile')}</td>
                    <td>
                      {inv.status === 'paid' ? (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(0,255,0,0.1)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Saldato</span>
                      ) : inv.status === 'late' ? (
                        <span style={{ fontSize: '0.75rem', background: 'var(--color-danger)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>In Ritardo</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,150,0,0.1)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>In Attesa</span>
                      )}
                    </td>
                    <td className={styles.right} style={{ fontWeight: 600, color: inv.status === 'paid' ? 'var(--color-success)' : 'inherit' }}>
                      € {Number(inv.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pending Invoices Section (Non-Retainer) */}
        {(!project.billing_type?.startsWith('retainer')) && pendingInvoices.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={`${styles.iconWrapper} ${styles.active}`} style={{ background: 'var(--color-warning)', color: '#fff' }}>
                <Euro size={24} />
              </div>
              Da Saldare / Fatturato
            </div>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data Emissione</th>
                  <th>Descrizione</th>
                  <th className={styles.right}>Importo</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className={styles.date}>
                      {new Date(inv.issue_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td>{inv.notes || 'Fattura / Addebito'}</td>
                    <td className={styles.right} style={{ fontWeight: 600 }}>
                      € {Number(inv.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td colSpan={2} className={`${styles.right} ${styles.totalLabel}`}>
                    Totale Fatturato da Saldare
                  </td>
                  <td className={`${styles.right} ${styles.totalValue}`} style={{ color: 'var(--color-warning)' }}>
                    € {totalPendingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Paid Invoices Section (Non-Retainer) */}
        {(!project.billing_type?.startsWith('retainer')) && project.time_tracking_enabled === false && paidInvoices.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={`${styles.iconWrapper}`} style={{ background: 'var(--color-success)', color: '#fff' }}>
                <CheckCircle2 size={24} />
              </div>
              Già Saldato / Incassato
            </div>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data Incasso</th>
                  <th>Descrizione</th>
                  <th className={styles.right}>Importo</th>
                </tr>
              </thead>
              <tbody>
                {paidInvoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className={styles.date}>
                      {inv.paid_date ? new Date(inv.paid_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date(inv.issue_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td>{inv.notes || 'Fattura / Addebito'}</td>
                    <td className={styles.right} style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                      € {Number(inv.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td colSpan={2} className={`${styles.right} ${styles.totalLabel}`}>
                    Totale Incassato Storico
                  </td>
                  <td className={`${styles.right} ${styles.totalValue}`} style={{ color: 'var(--color-success)' }}>
                    € {totalPaidAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Active Hours Section */}
        {project.time_tracking_enabled !== false && (
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
                activeHours.map((row: any) => (
                  <tr key={row.id}>
                    <td className={styles.date} style={{ padding: '0.5rem 0', fontSize: '0.9rem' }}>
                      {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.5rem 0', fontSize: '0.9rem' }}>{row.description}</td>
                    <td className={styles.right} style={{ padding: '0.5rem 0', fontSize: '0.9rem' }}>
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
        )}

        {/* Archived Hours Section */}
        {project.time_tracking_enabled !== false && archivedHours.length > 0 && (
          <div className={`${styles.section} ${styles.archivedSection}`}>
            <div className={styles.sectionTitle}>
              <div className={`${styles.iconWrapper} ${styles.archived}`}>
                <Archive size={20} />
              </div>
              Archivio Storico
            </div>
            
            <div>
              {sortedBatches.map(([batchId, data]: [string, any]) => {
                const batchDate = batchId !== 'pregresso' && batchId.length >= 8
                  ? new Date(batchId.slice(0,4) + '-' + batchId.slice(4,6) + '-' + batchId.slice(6,8)).toLocaleDateString('it-IT')
                  : 'Pregresso'
                
                const costDisplay = rate > 0 
                  ? `€ ${((data.totalMinutes / 60) * rate).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : null

                const batchInvoiceId = data.hours.find((h: any) => h.invoice_id)?.invoice_id
                const batchInvoice = batchInvoiceId ? allInvoices.find((i: any) => i.id === batchInvoiceId) : null
                
                const batchCost = rate > 0 ? (data.totalMinutes / 60) * rate : 0
                const isPartiallyPaid = batchInvoice && batchInvoice.status === 'paid' && batchCost > 0 && Number(batchInvoice.amount) < (batchCost - 1)

                return (
                  <details key={batchId} className={styles.accordion}>
                    <summary className={styles.accordionSummary}>
                      <div className={styles.batchIcon}>
                        <Folder size={24} />
                      </div>
                      <div className={styles.batchTitle}>
                        Archiviato il {batchDate}
                      </div>
                      <div className={styles.batchStats} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={styles.batchTime}>({formatTime(data.totalMinutes)})</span>
                        {costDisplay && <span className={styles.batchCost}>— {costDisplay}</span>}
                        {batchInvoice && (
                          <span style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            borderRadius: '12px',
                            background: isPartiallyPaid ? 'rgba(234, 179, 8, 0.15)' : batchInvoice.status === 'paid' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: isPartiallyPaid ? 'var(--color-warning)' : batchInvoice.status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)',
                            fontWeight: 600,
                            border: `1px solid ${isPartiallyPaid ? 'var(--color-warning)' : batchInvoice.status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)'}`
                          }}>
                            {isPartiallyPaid ? `Saldo Parz. (€${batchInvoice.amount})` : batchInvoice.status === 'paid' ? `Pagato (€${batchInvoice.amount})` : 'Da Saldare'}
                          </span>
                        )}
                      </div>
                    </summary>
                    <div className={styles.accordionContent}>
                      <table className={styles.table}>
                        <tbody>
                          {data.hours.map((row: any) => (
                            <tr key={row.id}>
                              <td className={styles.date} style={{ padding: '0.4rem 0', fontSize: '0.9rem' }}>
                                {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '0.4rem 0', fontSize: '0.9rem' }}>{row.description}</td>
                              <td className={styles.right} style={{ color: 'var(--color-text-muted)', padding: '0.4rem 0', fontSize: '0.9rem' }}>
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

        {(project.description || (project.deals && (project.deals.quote_description || project.deals.description))) && (
          <div className={styles.section}>
            <details className={styles.accordion}>
              <summary className={styles.accordionSummary}>
                <div className={styles.batchIcon}>
                  <Folder size={24} />
                </div>
                <div className={styles.batchTitle}>
                  Descrizione del Progetto
                </div>
              </summary>
              <div className={styles.accordionContent} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <div 
                  dangerouslySetInnerHTML={{ __html: project.description || (project.deals && project.deals.quote_description) || (project.deals && project.deals.description) }}
                  className={styles.descriptionContent}
                  style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text)' }}
                />
              </div>
            </details>
          </div>
        )}

      </div>
    </div>
  )
}
