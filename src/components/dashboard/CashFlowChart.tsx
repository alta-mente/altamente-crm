import React from 'react'
import { Euro } from 'lucide-react'
import styles from '@/app/Dashboard.module.css'
import type { Project } from './projects/ProjectBoard'

interface Invoice {
  id: string
  amount: number
  status: 'pending' | 'paid' | 'late'
  issue_date: string
  paid_date: string | null
}

export function CashFlowChart({ invoices, projects, services, companyHours }: { invoices: Invoice[], projects?: any[], services?: any[], companyHours?: any[] }) {
  // Generate 12 months window: 6 past, current, 5 future
  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (6 - i))
    return {
      monthStr: d.toLocaleString('it-IT', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      paid: 0,
      expected: 0,
      retainer: 0,
      renewals: 0,
      hoursBilled: 0
    }
  })

  // Aggregate data
  invoices.forEach(inv => {
    // If paid, use paid_date, else use issue_date
    const targetDateStr = inv.status === 'paid' ? (inv.paid_date || inv.issue_date) : inv.issue_date
    if (!targetDateStr) return
    
    const d = new Date(targetDateStr)
    const mIndex = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth())
    
    if (mIndex !== -1) {
      if (inv.status === 'paid') {
        months[mIndex].paid += Number(inv.amount)
      } else {
        months[mIndex].expected += Number(inv.amount)
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
          m.retainer += Number(p.billing_amount) || 0
        }
      })
    }
  })

  // Aggregate services renewals
  services?.forEach(s => {
    if (s.expiry_date && (s.status === 'active' || s.status === 'expired')) {
      const expDate = new Date(s.expiry_date)
      const mIndex = months.findIndex(m => m.year === expDate.getFullYear() && m.month === expDate.getMonth())
      
      if (mIndex !== -1) {
        months[mIndex].renewals += Number(s.cost) || 0
      }
    }
  })

  // Aggregate company hours
  companyHours?.forEach(h => {
    if (h.billed) {
      // Use batch_id date if possible, else h.date
      let dStr = h.date
      if (h.batch_id && h.batch_id.length >= 8) {
        dStr = `${h.batch_id.slice(0,4)}-${h.batch_id.slice(4,6)}-${h.batch_id.slice(6,8)}`
      }
      const d = new Date(dStr)
      const mIndex = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth())
      
      if (mIndex !== -1 && h.companies?.hourly_rate) {
        const cost = (h.minutes / 60) * h.companies.hourly_rate
        months[mIndex].hoursBilled += cost
      }
    }
  })

  // Find max for scaling
  const maxAmount = Math.max(...months.map(m => m.paid + m.expected + m.retainer + m.renewals + m.hoursBilled), 1000)
  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <div className={`bento-card bento-glass ${styles.bentoFull}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          <span className={styles.cardLabel} style={{ fontSize: '12px' }}>Previsione di Cassa (12 Mesi)</span>
          <Euro size={20} className={styles.cardIcon}/>
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
            const expectedHeight = (m.expected / maxAmount) * 100
            const retainerHeight = (m.retainer / maxAmount) * 100
            const renewalsHeight = (m.renewals / maxAmount) * 100
            const hoursHeight = (m.hoursBilled / maxAmount) * 100
            
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', zIndex: 1 }}>
                
                {/* Expected Bar */}
                {expectedHeight > 0 && (
                  <div 
                    title={`Da Incassare: ${formatter.format(m.expected)}`}
                    style={{ 
                      width: '35px', 
                      height: `${expectedHeight}%`, 
                      background: 'rgba(255,150,0,0.3)', 
                      border: '2px dashed rgba(255,150,0,0.5)',
                      borderBottom: 'none',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px'
                    }} 
                  />
                )}
                
                {/* Hours Billed Bar */}
                {hoursHeight > 0 && (
                  <div 
                    title={`Ore Fatturabili: ${formatter.format(m.hoursBilled)}`}
                    style={{ 
                      width: '35px', 
                      height: `${hoursHeight}%`, 
                      background: 'rgba(59, 130, 246, 0.6)', 
                      borderBottom: 'none',
                      borderTopLeftRadius: expectedHeight === 0 ? '4px' : '0',
                      borderTopRightRadius: expectedHeight === 0 ? '4px' : '0'
                    }} 
                  />
                )}
                
                {/* Retainer Bar */}
                {retainerHeight > 0 && (
                  <div 
                    title={`Retainer (Automatico): ${formatter.format(m.retainer)}`}
                    style={{ 
                      width: '35px', 
                      height: `${retainerHeight}%`, 
                      background: 'rgba(16, 185, 129, 0.6)', 
                      borderBottom: 'none',
                      borderTopLeftRadius: (expectedHeight === 0 && hoursHeight === 0) ? '4px' : '0',
                      borderTopRightRadius: (expectedHeight === 0 && hoursHeight === 0) ? '4px' : '0'
                    }} 
                  />
                )}

                {/* Renewals Bar */}
                {renewalsHeight > 0 && (
                  <div 
                    title={`Rinnovi (Scadenze): ${formatter.format(m.renewals)}`}
                    style={{ 
                      width: '35px', 
                      height: `${renewalsHeight}%`, 
                      background: 'rgba(168, 85, 247, 0.6)', 
                      borderBottom: 'none',
                      borderTopLeftRadius: (expectedHeight === 0 && hoursHeight === 0 && retainerHeight === 0) ? '4px' : '0',
                      borderTopRightRadius: (expectedHeight === 0 && hoursHeight === 0 && retainerHeight === 0) ? '4px' : '0'
                    }} 
                  />
                )}
                
                {/* Paid Bar */}
                <div 
                  title={`Incassato: ${formatter.format(m.paid)}`}
                  style={{ 
                    width: '35px', 
                    height: `${paidHeight}%`, 
                    background: 'var(--color-primary)', 
                    borderTopLeftRadius: (expectedHeight === 0 && hoursHeight === 0 && retainerHeight === 0 && renewalsHeight === 0) ? '4px' : '0',
                    borderTopRightRadius: (expectedHeight === 0 && hoursHeight === 0 && retainerHeight === 0 && renewalsHeight === 0) ? '4px' : '0',
                    transition: 'height 0.3s ease'
                  }} 
                />
              </div>
            )
          })}
        </div>
        
        {/* Totals Row */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          {months.map((m, i) => {
             return (
               <div key={`tot-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <span style={{ fontSize: '13px', textTransform: 'capitalize', color: m.month === new Date().getMonth() && m.year === new Date().getFullYear() ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                   {m.monthStr}
                 </span>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px', gap: '2px' }}>
                   {/* Incassato */}
                   {m.paid > 0 ? (
                     <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }} title="Incassato">
                       {m.paid > 1000 ? `${(m.paid/1000).toFixed(1)}k` : m.paid}
                     </span>
                   ) : <span style={{ fontSize: '12px', opacity: 0 }}>0</span>}
                   
                   {/* Retainer */}
                   {m.retainer > 0 ? (
                     <span style={{ fontSize: '11px', color: 'rgba(16, 185, 129, 0.9)', fontWeight: 600 }} title="Retainer (Auto)">
                       +{m.retainer > 1000 ? `${(m.retainer/1000).toFixed(1)}k` : m.retainer}
                     </span>
                   ) : null}

                   {/* Rinnovi */}
                   {m.renewals > 0 ? (
                     <span style={{ fontSize: '11px', color: 'rgba(168, 85, 247, 0.9)', fontWeight: 600 }} title="Scadenze / Rinnovi">
                       +{m.renewals > 1000 ? `${(m.renewals/1000).toFixed(1)}k` : m.renewals}
                     </span>
                   ) : null}

                   {/* Ore Fatturabili */}
                   {m.hoursBilled > 0 ? (
                     <span style={{ fontSize: '11px', color: 'rgba(59, 130, 246, 0.9)', fontWeight: 600 }} title="Ore Fatturabili">
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
             <div style={{ width: '14px', height: '14px', background: 'rgba(168, 85, 247, 0.8)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Scadenze / Rinnovi</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'rgba(255,150,0,0.3)', border: '2px dashed rgba(255,150,0,0.5)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Da Incassare</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'rgba(59, 130, 246, 0.8)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Ore Fatturabili</span>
           </div>
        </div>
        
      </div>
    </div>
  )
}
