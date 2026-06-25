'use client'

import React, { useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import clsx from 'clsx'
import styles from './AgendaSidebar.module.css'

interface AgendaSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const MOCK_APPOINTMENTS = [
  { id: 'a1', time: '10:00', title: 'Call conoscitiva', deal: 'Sviluppo E-commerce', isToday: true },
  { id: 'a2', time: '14:30', title: 'Demo prodotto', deal: 'Consulenza Marketing', isToday: true },
  { id: 'a3', time: '11:00', title: 'Firma contratto', deal: 'App Mobile iOS', isToday: false },
]

export function AgendaSidebar({ isOpen, onClose }: AgendaSidebarProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const todayAppts = MOCK_APPOINTMENTS.filter(a => a.isToday)
  const upcomingAppts = MOCK_APPOINTMENTS.filter(a => !a.isToday)

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      
      <div className={clsx(styles.sidebar, isOpen && styles.sidebarOpen)}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
            La mia Agenda
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {todayAppts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Oggi</h3>
              {todayAppts.map(appt => (
                <div key={appt.id} className={styles.item}>
                  <div className={styles.itemTime}>{appt.time}</div>
                  <div className={styles.itemTitle}>{appt.title}</div>
                  <div className={styles.itemDeal}>in {appt.deal}</div>
                </div>
              ))}
            </div>
          )}

          {upcomingAppts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Prossimi</h3>
              {upcomingAppts.map(appt => (
                <div key={appt.id} className={styles.item}>
                  <div className={styles.itemTime}>{appt.time}</div>
                  <div className={styles.itemTitle}>{appt.title}</div>
                  <div className={styles.itemDeal}>in {appt.deal}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
