'use client'

import React, { useEffect, useState } from 'react'
import { X, Bell, Edit2, Trash2, Check, Plus } from 'lucide-react'
import clsx from 'clsx'
import styles from './AgendaSidebar.module.css'
import { createClient } from '@/utils/supabase/client'

interface AgendaSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AgendaSidebar({ isOpen, onClose }: AgendaSidebarProps) {
  const [appointments, setAppointments] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  
  // Quick Add State
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState(() => {
    // Default to tomorrow 09:00
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    const tzoffset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16)
  })

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Sei sicuro di voler eliminare questo task?')) return
    await supabase.from('appointments').delete().eq('id', id)
    fetchAppointments()
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !newTaskDate) return
    
    await supabase.from('appointments').insert({
      title: newTaskTitle.trim(),
      scheduled_at: new Date(newTaskDate).toISOString(),
      deal_id: null
    })
    
    setNewTaskTitle('')
    fetchAppointments()
  }

  const startEdit = (appt: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(appt.id)
    setEditTitle(appt.title)
    
    // Format date for datetime-local
    const d = new Date(appt.scheduled_at)
    const tzoffset = d.getTimezoneOffset() * 60000
    const localISOTime = new Date(d.getTime() - tzoffset).toISOString().slice(0, 16)
    setEditDate(localISOTime)
  }

  const saveEdit = async () => {
    if (!editingId) return
    await supabase.from('appointments').update({
      title: editTitle,
      scheduled_at: new Date(editDate).toISOString()
    }).eq('id', editingId)
    setEditingId(null)
    fetchAppointments()
  }

  const cancelEdit = () => {
    setEditingId(null)
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

  const renderAppt = (appt: any, isPast: boolean) => {
    const d = new Date(appt.scheduled_at)
    const isEditing = editingId === appt.id
    
    if (isEditing) {
      return (
        <div key={appt.id} className={styles.item} style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input 
              type="datetime-local" 
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-solid)', color: 'var(--color-text)', fontSize: '13px' }}
            />
            <input 
              type="text" 
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Cosa devi fare?"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface-solid)', color: 'var(--color-text)', fontSize: '13px' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={saveEdit} style={{ flex: 1, padding: '0.5rem', background: 'var(--color-primary)', color: 'var(--color-bg-base)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Check size={14} /> Salva
              </button>
              <button onClick={cancelEdit} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={appt.id} className={styles.item}>
        <div className={styles.itemHeader}>
          <div className={styles.itemTime} style={{ color: isPast ? 'var(--color-danger)' : 'var(--color-primary)' }}>
            {d.toLocaleDateString('it-IT')} {d.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div className={styles.itemActions}>
            <button className={styles.actionButton} onClick={(e) => startEdit(appt, e)} title="Modifica">
              <Edit2 size={14} />
            </button>
            <button className={`${styles.actionButton} ${styles.danger}`} onClick={(e) => handleDelete(appt.id, e)} title="Elimina">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className={styles.itemTitle}>{appt.title}</div>
        {appt.deals && <div className={styles.itemDeal}>in {appt.deals.title}</div>}
      </div>
    )
  }

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      
      <div className={clsx(styles.sidebar, isOpen && styles.sidebarOpen)}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Bell size={20} style={{ color: 'var(--color-primary)' }} />
            Task & Memo
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <form className={styles.quickAddForm} onSubmit={handleQuickAdd}>
            <input
              type="text"
              placeholder="Nuovo task o memo..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className={styles.quickAddInput}
              required
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="datetime-local"
                value={newTaskDate}
                onChange={e => setNewTaskDate(e.target.value)}
                className={styles.quickAddDate}
                required
              />
              <button type="submit" className={styles.quickAddButton} disabled={!newTaskTitle.trim()}>
                <Plus size={16} />
              </button>
            </div>
          </form>

          {appointments.length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
              Nessun task in programma.
            </div>
          )}

          {pastAppts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle} style={{ color: 'var(--color-danger)' }}>Scadute</h3>
              {pastAppts.map(appt => renderAppt(appt, true))}
            </div>
          )}

          {todayAppts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Oggi</h3>
              {todayAppts.map(appt => renderAppt(appt, false))}
            </div>
          )}

          {upcomingAppts.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Prossime</h3>
              {upcomingAppts.map(appt => renderAppt(appt, false))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
