import React, { useState } from 'react'
import { Euro } from 'lucide-react'
import styles from '@/app/Dashboard.module.css'


interface Invoice {
  id: string
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

export function ActivityChart({ invoices, projects, services, companyHours }: { invoices: Invoice[], projects?: any[], services?: any[], companyHours?: any[] }) {
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
      paidItems: [] as TooltipItem[],
      expected: 0,
      expectedItems: [] as TooltipItem[],
      retainer: 0,
      retainerItems: [] as TooltipItem[],
      hoursBilled: 0,
      hoursItems: [] as TooltipItem[]
    }
  })

  // Aggregate data
  invoices.forEach(inv => {
    const targetDateStr = inv.status === 'paid' ? (inv.paid_date || inv.issue_date) : inv.issue_date
    if (!targetDateStr) return
    
    const d = new Date(targetDateStr)
    const mIndex = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth())
    
    if (mIndex !== -1) {
      if (inv.status === 'paid') {
        months[mIndex].paid += Number(inv.amount)
        months[mIndex].paidItems.push({
          name: inv.invoice_number ? `Fatt. ${inv.invoice_number}` : `Fattura ${inv.id.slice(0, 4)}`,
          amount: Number(inv.amount)
        })
      } else {
        months[mIndex].expected += Number(inv.amount)
        months[mIndex].expectedItems.push({
          name: inv.invoice_number ? `Fatt. ${inv.invoice_number}` : `Fattura (Da Incassare)`,
          amount: Number(inv.amount)
        })
      }
    }
  })

  // Aggregate retainers
  projects?.forEach(p => {
    if (p.billing_type === 'retainer_monthly') {
      const createdDate = new Date(p.billing_start_date || p.created_at)
      const createdMonth = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1)
      
      months.forEach(m => {
        const monthDate = new Date(m.year, m.month, 1)
        if (monthDate.getTime() >= createdMonth.getTime()) {
          const amt = Number(p.billing_amount) || 0
          m.retainer += amt
          if (amt > 0) {
             m.retainerItems.push({ name: p.name || 'Progetto', amount: amt })
          }
        }
      })
    }
  })

  // Aggregate company hours (Grouped by Project/Client)
  const hourGroups: Record<string, { total: number, dateStr: string, name: string }> = {}
  companyHours?.forEach(h => {
    if (h.billed) {
      let dStr = h.date
      if (h.batch_id && h.batch_id.length >= 8) {
        dStr = `${h.batch_id.slice(0,4)}-${h.batch_id.slice(4,6)}-${h.batch_id.slice(6,8)}`
      }
      
      if (h.projects?.hourly_rate) {
        const cost = (h.minutes / 60) * h.projects.hourly_rate
        const groupKey = `${dStr}-${h.project_id || 'no-proj'}`
        
        if (!hourGroups[groupKey]) {
          const clientName = h.projects?.companies?.name ? h.projects.companies.name : 'Cliente'
          const projName = h.projects?.title ? ` (${h.projects.title})` : ''
          hourGroups[groupKey] = {
            total: 0,
            dateStr: dStr,
            name: `${clientName}${projName}`
          }
        }
        hourGroups[groupKey].total += cost
      }
    }
  })

  // Push grouped hours to months
  Object.values(hourGroups).forEach(group => {
     const d = new Date(group.dateStr)
     const mIndex = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth())
     if (mIndex !== -1 && group.total > 0) {
       months[mIndex].hoursBilled += group.total
       months[mIndex].hoursItems.push({ name: group.name, amount: group.total })
     }
  })

  // Find max for scaling
  const maxAmount = Math.max(...months.map(m => m.paid + m.expected + m.retainer + m.hoursBilled), 1000)
  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  // Compute stats for Analisi Andamento
  let currentProgress = 0
  const enrichedMonths = months.map(m => {
    const totalM = m.paid + m.retainer + m.hoursBilled
    currentProgress += totalM
    const avg = currentProgress / (m.month + 1)
    return { ...m, totalM, currentProgress, avg }
  })

  return (
    <div className={`bento-card bento-glass ${styles.bentoFull}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardTop} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.cardLabel} style={{ fontSize: '13px', fontWeight: 600 }}>Attività e Previsioni</span>
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
            const isFuture = m.year > new Date().getFullYear() || (m.year === new Date().getFullYear() && m.month > new Date().getMonth())
            const paidHeight = (m.paid / maxAmount) * 100
            const expectedHeight = (m.expected / maxAmount) * 100
            const retainerHeight = (m.retainer / maxAmount) * 100
            const hoursHeight = (m.hoursBilled / maxAmount) * 100
            
            return (
              <div 
                key={i} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', zIndex: 1, cursor: 'pointer' }}
                onMouseEnter={() => setHoveredMonthIdx(i)}
                onMouseLeave={() => setHoveredMonthIdx(null)}
              >
                
                {/* Expected Bar */}
                {expectedHeight > 0 && (
                  <div 
                    style={{ 
                      width: '35px', 
                      height: `${expectedHeight}%`, 
                      background: 'rgba(255,150,0,0.3)', 
                      border: '2px dashed rgba(255,150,0,0.5)',
                      borderBottom: 'none',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                      transition: 'height 0.3s ease, opacity 0.2s',
                      opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1
                    }} 
                  />
                )}
                
                {/* Hours Billed Bar */}
                {hoursHeight > 0 && (
                  <div 
                    style={{ 
                      width: '35px', 
                      height: `${hoursHeight}%`, 
                      background: isFuture ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.6)',
                      border: isFuture ? '2px dashed rgba(59, 130, 246, 0.5)' : 'none',
                      borderBottom: 'none',
                      borderTopLeftRadius: expectedHeight === 0 ? '4px' : '0',
                      borderTopRightRadius: expectedHeight === 0 ? '4px' : '0',
                      transition: 'height 0.3s ease, opacity 0.2s',
                      opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1
                    }} 
                  />
                )}
                
                {/* Retainer Bar */}
                {retainerHeight > 0 && (
                  <div 
                    style={{ 
                      width: '35px', 
                      height: `${retainerHeight}%`, 
                      background: isFuture ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.6)',
                      border: isFuture ? '2px dashed rgba(16, 185, 129, 0.5)' : 'none',
                      borderBottom: 'none',
                      borderTopLeftRadius: (expectedHeight === 0 && hoursHeight === 0) ? '4px' : '0',
                      borderTopRightRadius: (expectedHeight === 0 && hoursHeight === 0) ? '4px' : '0',
                      transition: 'height 0.3s ease, opacity 0.2s',
                      opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1
                    }} 
                  />
                )}
                
                {/* Paid Bar */}
                <div 
                  style={{ 
                    width: '35px', 
                    height: `${paidHeight}%`, 
                    background: 'var(--color-primary)', 
                    borderTopLeftRadius: (expectedHeight === 0 && hoursHeight === 0 && retainerHeight === 0) ? '4px' : '0',
                    borderTopRightRadius: (expectedHeight === 0 && hoursHeight === 0 && retainerHeight === 0) ? '4px' : '0',
                    transition: 'height 0.3s ease, opacity 0.2s',
                    opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1
                  }} 
                />

                {/* Custom Tooltip */}
                {hoveredMonthIdx === i && (m.paid > 0 || m.retainer > 0 || m.hoursBilled > 0 || m.expected > 0) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
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
                    
                    {m.paid > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ opacity: 0.8, fontWeight: 600 }}>Incassato:</span>
                          <span style={{ fontWeight: 700 }}>{formatter.format(m.paid)}</span>
                        </div>
                        {m.paidItems.length > 0 && (
                          <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', opacity: 0.7 }}>
                            {m.paidItems.map((item, idx) => (
                              <div key={`paid-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                <span>{formatter.format(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {m.retainer > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ opacity: 0.8, fontWeight: 600 }}>Retainer:</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{formatter.format(m.retainer)}</span>
                        </div>
                      </div>
                    )}

                    {m.hoursBilled > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ opacity: 0.8, fontWeight: 600 }}>Ore Archiviate:</span>
                          <span style={{ fontWeight: 700, color: '#3b82f6' }}>{formatter.format(m.hoursBilled)}</span>
                        </div>
                        {m.hoursItems.length > 0 && (
                          <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', opacity: 0.7 }}>
                            {m.hoursItems.map((item, idx) => (
                              <div key={`hours-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                <span>{formatter.format(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {m.expected > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ opacity: 0.8, fontWeight: 600 }}>Da Incassare:</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>{formatter.format(m.expected)}</span>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Totals Row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          {months.map((m, i) => {
             const monthTotal = m.paid + m.retainer + m.hoursBilled + m.expected;
             return (
               <div key={`tot-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <span style={{ fontSize: '13px', textTransform: 'capitalize', color: m.month === new Date().getMonth() && m.year === new Date().getFullYear() ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                   {m.monthStr}
                 </span>
                 
                 {/* Totale Mese */}
                 {monthTotal > 0 ? (
                   <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', marginTop: '4px', marginBottom: '2px' }} title="Totale">
                     {monthTotal >= 1000 ? `€ ${(monthTotal/1000).toFixed(1)}k` : formatter.format(monthTotal)}
                   </span>
                 ) : (
                   <span style={{ fontSize: '12px', opacity: 0, marginTop: '4px', marginBottom: '2px' }}>0</span>
                 )}

                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px', gap: '2px', borderTop: monthTotal > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingTop: monthTotal > 0 ? '4px' : '0' }}>
                   {/* Incassato */}
                   {m.paid > 0 ? (
                     <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)' }} title="Incassato">
                       {m.paid >= 1000 ? `${(m.paid/1000).toFixed(1)}k` : formatter.format(m.paid)}
                     </span>
                   ) : <span style={{ fontSize: '12px', opacity: 0 }}>0</span>}
                   
                   {/* Retainer */}
                   {m.retainer > 0 ? (
                     <span style={{ fontSize: '11px', color: 'rgba(16, 185, 129, 0.9)', fontWeight: 600 }} title="Retainer (Auto)">
                       +{m.retainer > 1000 ? `${(m.retainer/1000).toFixed(1)}k` : m.retainer}
                     </span>
                   ) : null}

                   {/* Ore Fatturabili */}
                   {m.hoursBilled > 0 ? (
                     <span style={{ fontSize: '11px', color: 'rgba(59, 130, 246, 0.9)', fontWeight: 600 }} title="Ore Archiviate">
                       +{m.hoursBilled > 1000 ? `${(m.hoursBilled/1000).toFixed(1)}k` : m.hoursBilled}
                     </span>
                   ) : null}

                   {/* Da Incassare (Expected) */}
                   {m.expected > 0 ? (
                     <span style={{ fontSize: '11px', color: 'var(--color-warning)', fontWeight: 600 }} title="Da Incassare">
                       +{m.expected > 1000 ? `${(m.expected/1000).toFixed(1)}k` : m.expected}
                     </span>
                   ) : null}
                 </div>
               </div>
             )
          })}
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', fontSize: '13px', justifyContent: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'var(--color-primary)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Incassato</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'rgba(16, 185, 129, 0.8)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Retainer (Auto)</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'rgba(59, 130, 246, 0.8)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Ore Archiviate</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'rgba(255,150,0,0.3)', border: '2px dashed rgba(255,150,0,0.5)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Da Incassare</span>
           </div>
        </div>

        {/* Analisi Andamento (Google Sheet style) */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Analisi Andamento</h4>
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
                  <td style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Progressivo YTD</td>
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
