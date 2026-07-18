'use client'

import React, { useState } from 'react'
import { Briefcase } from 'lucide-react'
import styles from '@/app/Dashboard.module.css'

interface TooltipItem {
  name: string
  amount: number
}

export function SalesChart({ deals }: { deals: any[] }) {
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
      wonAmount: 0,
      wonItems: [] as TooltipItem[]
    }
  })

  // Aggregate won deals
  deals?.forEach(d => {
    if (d.phase_id === 'won') {
      const targetDateStr = d.updated_at || d.created_at
      if (!targetDateStr) return
      
      const dt = new Date(targetDateStr)
      const mIndex = months.findIndex(m => m.year === dt.getFullYear() && m.month === dt.getMonth())
      
      if (mIndex !== -1) {
        const amt = Number(d.value) || 0
        if (amt > 0) {
          months[mIndex].wonAmount += amt
          months[mIndex].wonItems.push({
            name: d.title || 'Deal',
            amount: amt
          })
        }
      }
    }
  })

  // Find max for scaling
  const maxAmount = Math.max(...months.map(m => m.wonAmount), 1000)
  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  let currentProgress = 0
  const enrichedMonths = months.map(m => {
    currentProgress += m.wonAmount
    const avg = currentProgress / (m.month + 1)
    return { ...m, currentProgress, avg }
  })

  return (
    <div className={`bento-card bento-glass ${styles.bentoFull}`} style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
      <div className={styles.cardContent}>
        <div className={styles.cardTop} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.cardLabel} style={{ fontSize: '13px', fontWeight: 600 }}>Vendite Chiuse (Won)</span>
            <Briefcase size={18} className={styles.cardIcon} style={{ color: '#a855f7' }}/>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setSelectedYear(selectedYear - 1)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              &lt;
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#a855f7' }}>{selectedYear}</span>
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
            const height = (m.wonAmount / maxAmount) * 100
            
            return (
              <div 
                key={i} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', zIndex: 1, cursor: 'pointer' }}
                onMouseEnter={() => setHoveredMonthIdx(i)}
                onMouseLeave={() => setHoveredMonthIdx(null)}
              >
                
                {height > 0 && (
                  <div 
                    style={{ 
                      width: '35px', 
                      height: `${height}%`, 
                      background: 'linear-gradient(to top, rgba(168, 85, 247, 0.5), #a855f7)', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease, opacity 0.2s',
                      opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1,
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
                    }} 
                  />
                )}
                
                {/* Custom Tooltip */}
                {hoveredMonthIdx === i && m.wonAmount > 0 && (
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
                        <span style={{ opacity: 0.8, fontWeight: 600 }}>Venduto:</span>
                        <span style={{ fontWeight: 700, color: '#a855f7' }}>{formatter.format(m.wonAmount)}</span>
                      </div>
                      {m.wonItems.length > 0 && (
                        <div style={{ paddingLeft: '8px', borderLeft: '2px solid rgba(168, 85, 247, 0.3)', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', opacity: 0.7 }}>
                          {m.wonItems.map((item, idx) => (
                            <div key={`won-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
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
             return (
               <div key={`tot-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <span style={{ fontSize: '13px', textTransform: 'capitalize', color: m.month === new Date().getMonth() && m.year === new Date().getFullYear() ? '#a855f7' : 'var(--color-text-muted)', fontWeight: 600 }}>
                   {m.monthStr}
                 </span>
                 
                 {m.wonAmount > 0 ? (
                   <span style={{ fontSize: '12px', fontWeight: 800, color: '#a855f7', marginTop: '4px', marginBottom: '2px' }} title="Venduto">
                     {m.wonAmount >= 1000 ? `€ ${(m.wonAmount/1000).toFixed(1)}k` : formatter.format(m.wonAmount)}
                   </span>
                 ) : (
                   <span style={{ fontSize: '12px', opacity: 0, marginTop: '4px', marginBottom: '2px' }}>0</span>
                 )}
               </div>
             )
          })}
        </div>
        
        {/* Analisi Andamento */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Analisi Andamento</h4>
          <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 500 }}></th>
                  {enrichedMonths.map((m, i) => (
                    <th key={i} style={{ padding: '0.5rem', color: m.month === new Date().getMonth() && m.year === new Date().getFullYear() ? '#a855f7' : 'var(--color-text-muted)', fontWeight: 600, textTransform: 'capitalize' }}>{m.monthStr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Venduto Mese</td>
                  {enrichedMonths.map((m, i) => (
                    <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: m.wonAmount > 0 ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {m.wonAmount > 0 ? formatter.format(m.wonAmount) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Progressivo YTD</td>
                  {enrichedMonths.map((m, i) => (
                    <td key={i} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a855f7', fontWeight: 600 }}>
                      {m.currentProgress > 0 ? formatter.format(m.currentProgress) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--color-text-muted)' }}>Media Mensile</td>
                  {enrichedMonths.map((m, i) => (
                    <td key={i} style={{ padding: '0.5rem', color: m.avg > 0 ? 'rgba(168, 85, 247, 0.9)' : 'var(--color-text-muted)' }}>
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
