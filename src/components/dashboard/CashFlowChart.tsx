
import React, { useState } from 'react'
import { Euro } from 'lucide-react'
import styles from '@/app/Dashboard.module.css'

interface Invoice {
  id: string
  project_id?: string
  amount: number
  status: 'pending' | 'paid' | 'late'
  issue_date: string
  paid_date: string | null
  invoice_number?: string
}

interface TooltipItem {
  name: string
  amount: number
}

export function CashFlowChart({ invoices, projects, services, companyHours }: { invoices: Invoice[], projects?: any[], services?: any[], companyHours?: any[] }) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null)

  // Generate 12 months for the selected year
  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(selectedYear, i, 1)
    return {
      monthStr: d.toLocaleString('it-IT', { month: 'short' }),
      year: selectedYear,
      month: i,
      paid: 0,
      paidRetainer: 0,
      paidHours: 0,
      paidProjects: 0,
      expected: 0,
      paidItems: [] as TooltipItem[],
      expectedItems: [] as TooltipItem[]
    }
  })

  // Aggregate data (PAID and PENDING INVOICES)
  invoices.forEach(inv => {
    // Determine the target date for the chart:
    // If paid, use paid_date or issue_date.
    // If pending/late, project payment to next month or current month if issue_date is old.
    let targetDateStr = inv.paid_date || inv.issue_date
    if (!targetDateStr) return

    let d = new Date(targetDateStr)
    
    if (inv.status !== 'paid') {
      // For forecasting, assume payment will happen in the current month or next month
      const now = new Date()
      if (d < now) {
         // If it's already overdue or issued in the past, project it to this month
         d = new Date(now.getFullYear(), now.getMonth(), 1)
      } else {
         // Otherwise project it 30 days after issue
         d.setDate(d.getDate() + 30)
      }
    }
    const mIndex = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth())
    
    if (mIndex !== -1) {
      const proj = projects?.find(p => p.id === inv.project_id)
      const projName = proj?.title || proj?.name || 'Progetto Generico'
      const labelName = inv.invoice_number ? `Fatt. ${inv.invoice_number} - ${projName}` : `Fatt. ${projName}`

      let type = 'projects'
      if (proj?.billing_type === 'retainer_monthly' || proj?.billing_type === 'retainer_yearly') {
        type = 'retainer'
      } else if (proj?.time_tracking_enabled) {
        type = 'hours'
      }

      if (inv.status === 'paid') {
        if (type === 'retainer') months[mIndex].paidRetainer += Number(inv.amount)
        else if (type === 'hours') months[mIndex].paidHours += Number(inv.amount)
        else months[mIndex].paidProjects += Number(inv.amount)
        
        months[mIndex].paid += Number(inv.amount)
        months[mIndex].paidItems.push({
          name: labelName,
          amount: Number(inv.amount)
        })
      } else {
        months[mIndex].expected += Number(inv.amount)
        months[mIndex].expectedItems.push({
          name: `${labelName} (Previsione)`,
          amount: Number(inv.amount)
        })
      }
    }
  })

  // Aggregate future retainers for forecasting
  projects?.forEach(p => {
    if ((p.billing_type === 'retainer_monthly' || p.billing_type === 'retainer_yearly') && p.phase_id !== 'archiviato' && p.phase_id !== 'archived' && p.phase_id !== 'lost') {
      const createdDate = new Date(p.billing_start_date || p.created_at)
      const createdMonth = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1)
      
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      months.forEach(m => {
        const monthDate = new Date(m.year, m.month, 1)
        // Project retainers into future months
        if (monthDate.getTime() >= createdMonth.getTime() && monthDate.getTime() > currentMonth.getTime()) {
          const amt = Number(p.billing_amount) || 0
          m.expected += amt
          if (amt > 0) {
             m.expectedItems.push({ name: `${p.name || p.title || 'Progetto'} (Retainer Futuro)`, amount: amt })
          }
        }
      })
    }
  })

  // Find max for scaling
  const maxAmount = Math.max(...months.map(m => m.paid + m.expected), 1000)
  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  // Compute stats for Analisi Andamento
  let currentProgress = 0
  let currentExpectedProgress = 0
  const enrichedMonths = months.map(m => {
    const totalM = m.paid
    const expectedM = m.expected
    currentProgress += totalM
    currentExpectedProgress += totalM + expectedM
    const avg = currentProgress / (m.month + 1)
    return { ...m, totalM, expectedM, currentProgress, currentExpectedProgress, avg }
  })

  return (
    <div className={`bento-card bento-glass ${styles.bentoFull}`} style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
      <div className={styles.cardContent}>
        <div className={styles.cardTop} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.cardLabel} style={{ fontSize: '13px', fontWeight: 600 }}>Cassa Effettiva</span>
            <Euro size={18} className={styles.cardIcon}/>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setSelectedYear(selectedYear - 1)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              &lt;
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>{selectedYear}</span>
            <button 
              onClick={() => setSelectedYear(selectedYear + 1)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              &gt;
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'flex-end', height: '240px', gap: '16px', paddingBottom: '30px', position: 'relative' }}>
          
          {/* Background Grid Lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, opacity: 0.1, pointerEvents: 'none' }}>
            <div style={{ borderBottom: '1px dashed #fff', width: '100%' }}></div>
            <div style={{ borderBottom: '1px dashed #fff', width: '100%' }}></div>
            <div style={{ borderBottom: '1px dashed #fff', width: '100%' }}></div>
            <div style={{ borderBottom: '1px solid #fff', width: '100%' }}></div>
          </div>
          
          {months.map((m, i) => {
            const paidHeight = (m.paid / maxAmount) * 100
            
            return (
              <div 
                key={i} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', zIndex: 1, cursor: 'pointer' }}
                onMouseEnter={() => setHoveredMonthIdx(i)}
                onMouseLeave={() => setHoveredMonthIdx(null)}
              >
                
                {/* Expected Bar */}
                {m.expected > 0 && (
                  <div 
                    style={{ 
                      width: '35px', 
                      height: `${(m.expected / maxAmount) * 100}%`, 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      border: '2px dashed rgba(255, 255, 255, 0.3)',
                      borderBottom: 'none',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                      transition: 'height 0.3s ease, opacity 0.2s',
                      opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1
                    }} 
                  />
                )}
                
                {/* Paid Projects Bar */}
                <div 
                  style={{ 
                    width: '35px', 
                    height: `${(m.paidProjects / maxAmount) * 100}%`, 
                    background: 'linear-gradient(to top, rgba(59, 130, 246, 0.5), #3b82f6)', 
                    borderTopLeftRadius: m.paidHours === 0 && m.paidRetainer === 0 && m.expected === 0 ? '4px' : '0',
                    borderTopRightRadius: m.paidHours === 0 && m.paidRetainer === 0 && m.expected === 0 ? '4px' : '0',
                    transition: 'height 0.3s ease, opacity 0.2s',
                    opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1,
                    boxShadow: (hoveredMonthIdx === null || hoveredMonthIdx === i) && m.paidProjects > 0 ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none'
                  }} 
                />
                
                {/* Paid Hours Bar */}
                <div 
                  style={{ 
                    width: '35px', 
                    height: `${(m.paidHours / maxAmount) * 100}%`, 
                    background: 'linear-gradient(to top, rgba(245, 158, 11, 0.5), #f59e0b)', 
                    borderTopLeftRadius: m.paidRetainer === 0 && m.expected === 0 ? '4px' : '0',
                    borderTopRightRadius: m.paidRetainer === 0 && m.expected === 0 ? '4px' : '0',
                    transition: 'height 0.3s ease, opacity 0.2s',
                    opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1,
                    boxShadow: (hoveredMonthIdx === null || hoveredMonthIdx === i) && m.paidHours > 0 ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none'
                  }} 
                />

                {/* Paid Retainer Bar */}
                <div 
                  style={{ 
                    width: '35px', 
                    height: `${(m.paidRetainer / maxAmount) * 100}%`, 
                    background: 'linear-gradient(to top, rgba(16, 185, 129, 0.5), #10b981)', 
                    borderTopLeftRadius: m.expected === 0 ? '4px' : '0',
                    borderTopRightRadius: m.expected === 0 ? '4px' : '0',
                    transition: 'height 0.3s ease, opacity 0.2s',
                    opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1,
                    boxShadow: (hoveredMonthIdx === null || hoveredMonthIdx === i) && m.paidRetainer > 0 ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                  }} 
                />

                {/* Custom Tooltip */}
                {hoveredMonthIdx === i && m.paid > 0 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: i === 0 ? '0' : (i === months.length - 1 ? 'auto' : '50%'),
                    right: i === months.length - 1 ? '0' : 'auto',
                    transform: i === 0 ? 'translateX(0)' : (i === months.length - 1 ? 'translateX(0)' : 'translateX(-50%)'),
                    background: 'var(--color-surface-solid)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    minWidth: '220px',
                    maxWidth: '280px',
                    zIndex: 50,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    lineHeight: 1.2
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', textTransform: 'capitalize', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                      {m.monthStr} {m.year}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.8, fontWeight: 600 }}>Incassato Totale:</span>
                        <span style={{ fontWeight: 700 }}>{formatter.format(m.paid)}</span>
                      </div>
                      
                      {(m.paidProjects > 0 || m.paidHours > 0 || m.paidRetainer > 0) && (
                        <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', marginTop: '4px', marginBottom: '4px' }}>
                          {m.paidProjects > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)' }}>
                              <span>Progetti:</span>
                              <span style={{ fontWeight: 600 }}>{formatter.format(m.paidProjects)}</span>
                            </div>
                          )}
                          {m.paidHours > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-warning)' }}>
                              <span>Ore Consuntivate:</span>
                              <span style={{ fontWeight: 600 }}>{formatter.format(m.paidHours)}</span>
                            </div>
                          )}
                          {m.paidRetainer > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                              <span>Canoni:</span>
                              <span style={{ fontWeight: 600 }}>{formatter.format(m.paidRetainer)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {m.paidItems.length > 0 && (
                        <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                          {m.paidItems.map((item, idx) => (
                            <div key={`paid-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                              <span>{formatter.format(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {m.expected > 0 && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ opacity: 0.8, fontWeight: 600 }}>Entrate Previste:</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>{formatter.format(m.expected)}</span>
                          </div>
                          {m.expectedItems.length > 0 && (
                            <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                              {m.expectedItems.map((item, idx) => (
                                <div key={`exp-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                  <span>{formatter.format(item.amount)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Totals Row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          {months.map((m, i) => {
             const monthTotal = m.paid;
             return (
               <div key={`tot-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <span style={{ fontSize: '13px', textTransform: 'capitalize', color: m.month === new Date().getMonth() && m.year === new Date().getFullYear() ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                   {m.monthStr}
                 </span>
                 
                 {/* Totale Mese */}
                 {monthTotal > 0 ? (
                   <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', marginTop: '4px', marginBottom: '2px' }} title="Totale Incassato">
                     {formatter.format(monthTotal)}
                   </span>
                 ) : (
                   <span style={{ fontSize: '12px', opacity: 0, marginTop: '4px', marginBottom: '2px' }}>0</span>
                 )}
                 {m.expected > 0 && (
                   <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }} title="Entrate Previste">
                     +{m.expected >= 1000 ? `${(m.expected/1000).toFixed(1)}k` : m.expected}
                   </span>
                 )}
               </div>
             )
          })}
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', fontSize: '13px', justifyContent: 'center', flexWrap: 'wrap' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'linear-gradient(to top, rgba(59, 130, 246, 0.5), #3b82f6)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Progetti (One-off)</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'linear-gradient(to top, rgba(245, 158, 11, 0.5), #f59e0b)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Ore Consuntivate</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'linear-gradient(to top, rgba(16, 185, 129, 0.5), #10b981)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Canoni Mensili/Annuali</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'rgba(255, 255, 255, 0.1)', border: '2px dashed rgba(255, 255, 255, 0.3)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Previsione Incassi</span>
           </div>
        </div>

        {/* Analisi Andamento (Google Sheet style) */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Analisi Andamento (Solo Cassa)</h4>
          <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}></th>
                  {enrichedMonths.map((m, i) => (
                    <th key={i} style={{ padding: '0.5rem', color: m.month === new Date().getMonth() && m.year === new Date().getFullYear() ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>{m.monthStr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Entrate Mese</td>
                  {enrichedMonths.map((m, i) => (
                    <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: m.totalM > 0 ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {m.totalM > 0 ? formatter.format(m.totalM) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Previsione Mese</td>
                  {enrichedMonths.map((m, i) => (
                    <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: m.expectedM > 0 ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.1)' }}>
                      {m.expectedM > 0 ? formatter.format(m.expectedM) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Progressivo YTD (Incassato)</td>
                  {enrichedMonths.map((m, i) => (
                    <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {m.currentProgress > 0 ? formatter.format(m.currentProgress) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)' }}>Media Mensile</td>
                  {enrichedMonths.map((m, i) => (
                    <td key={i} style={{ padding: '0.5rem', color: m.avg > 0 ? 'rgba(59, 130, 246, 0.9)' : 'var(--color-text-muted)' }}>
                      {m.avg > 0 ? formatter.format(m.avg) : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  )
}
