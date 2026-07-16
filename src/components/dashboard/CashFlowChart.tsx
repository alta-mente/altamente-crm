
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
      paidItems: [] as TooltipItem[]
    }
  })

  // Aggregate data (ONLY PAID INVOICES)
  invoices.forEach(inv => {
    if (inv.status !== 'paid') return; // Solo incassato

    const targetDateStr = inv.paid_date || inv.issue_date
    if (!targetDateStr) return
    
    const d = new Date(targetDateStr)
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

      if (type === 'retainer') months[mIndex].paidRetainer += Number(inv.amount)
      else if (type === 'hours') months[mIndex].paidHours += Number(inv.amount)
      else months[mIndex].paidProjects += Number(inv.amount)
      
      months[mIndex].paid += Number(inv.amount)
      months[mIndex].paidItems.push({
        name: labelName,
        amount: Number(inv.amount)
      })
    }
  })

  // Find max for scaling
  const maxAmount = Math.max(...months.map(m => m.paid), 1000)
  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  // Compute stats for Analisi Andamento
  let currentProgress = 0
  const enrichedMonths = months.map(m => {
    const totalM = m.paid
    currentProgress += totalM
    const avg = currentProgress / (m.month + 1)
    return { ...m, totalM, currentProgress, avg }
  })

  return (
    <div className={`bento-card bento-glass ${styles.bentoFull}`}>
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
                
                {/* Paid Projects Bar */}
                <div 
                  style={{ 
                    width: '35px', 
                    height: `${(m.paidProjects / maxAmount) * 100}%`, 
                    background: 'var(--color-primary)', 
                    borderTopLeftRadius: m.paidHours === 0 && m.paidRetainer === 0 ? '4px' : '0',
                    borderTopRightRadius: m.paidHours === 0 && m.paidRetainer === 0 ? '4px' : '0',
                    transition: 'height 0.3s ease, opacity 0.2s',
                    opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1
                  }} 
                />
                
                {/* Paid Hours Bar */}
                <div 
                  style={{ 
                    width: '35px', 
                    height: `${(m.paidHours / maxAmount) * 100}%`, 
                    background: 'var(--color-warning)', 
                    borderTopLeftRadius: m.paidRetainer === 0 ? '4px' : '0',
                    borderTopRightRadius: m.paidRetainer === 0 ? '4px' : '0',
                    transition: 'height 0.3s ease, opacity 0.2s',
                    opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1
                  }} 
                />

                {/* Paid Retainer Bar */}
                <div 
                  style={{ 
                    width: '35px', 
                    height: `${(m.paidRetainer / maxAmount) * 100}%`, 
                    background: 'var(--color-success)', 
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                    transition: 'height 0.3s ease, opacity 0.2s',
                    opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1
                  }} 
                />

                {/* Custom Tooltip */}
                {hoveredMonthIdx === i && m.paid > 0 && (
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
                 </div>
               </div>
             )
          })}
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', fontSize: '13px', justifyContent: 'center', flexWrap: 'wrap' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'var(--color-primary)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Progetti (One-off)</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'var(--color-warning)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Ore Consuntivate</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'var(--color-success)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Canoni Mensili/Annuali</span>
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
