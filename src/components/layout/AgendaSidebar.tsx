'use client'

import React, { useEffect, useState } from 'react'
import { X, Calendar } from 'lucide-react'
import clsx from 'clsx'
import styles from './AgendaSidebar.module.css'
import { createClient } from '@/utils/supabase/client'

interface AgendaSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AgendaSidebar({ isOpen, onClose }: AgendaSidebarProps) {
  const [appointments, setAppointments] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      fetchAppointments()
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, deals(title)')
      .order('scheduled_at', { ascending: true })
    if (data) setAppointments(data)
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const pastAppts = appointments.filter(a => new Date(a.scheduled_at) < todayStart)
  const todayAppts = appointments.filter(a => {
    const d = new Date(a.scheduled_at)
    return d >= todayStart && d < tomorrowStart
  })
  const upcomingAppts = appointments.filter(a => new Date(a.scheduled_at) >= tomorrowStart)

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
          {appointments.length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
              Nessuna attività in programma.
            </div>
          )}

          {pastAppts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle} style={{ color: 'var(--color-danger)' }}>Scadute</h3>
              {pastAppts.map(appt => {
                const d = new Date(appt.scheduled_at)
                return (
                  <div key={appt.id} className={styles.item}>
                    <div className={styles.itemTime} style={{ color: 'var(--color-danger)' }}>
                      {d.toLocaleDateString('it-IT')} {d.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className={styles.itemTitle}>{appt.title}</div>
                    {appt.deals && <div className={styles.itemDeal}>in {appt.deals.title}</div>}
                  </div>
                )
              })}
            </div>
          )}

          {todayAppts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Oggi</h3>
              {todayAppts.map(appt => {
                const d = new Date(appt.scheduled_at)
                return (
                  <div key={appt.id} className={styles.item}>
                    <div className={styles.itemTime}>{d.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className={styles.itemTitle}>{appt.title}</div>
                    {appt.deals && <div className={styles.itemDeal}>in {appt.deals.title}</div>}
                  </div>
                )
              })}
            </div>
          )}

          {upcomingAppts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Prossime</h3>
              {upcomingAppts.map(appt => {
                const d = new Date(appt.scheduled_at)
                return (
                  <div key={appt.id} className={styles.item}>
                    <div className={styles.itemTime}>
                      {d.toLocaleDateString('it-IT')} {d.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className={styles.itemTitle}>{appt.title}</div>
                    {appt.deals && <div className={styles.itemDeal}>in {appt.deals.title}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
