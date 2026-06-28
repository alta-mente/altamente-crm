'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Clock, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import styles from './ActivityLog.module.css'

interface ActivityLogProps {
  dealId?: string
  projectId?: string
}

export function ActivityLog({ dealId, projectId }: ActivityLogProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [newLog, setNewLog] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchLogs()
  }, [dealId, projectId])

  const fetchLogs = async () => {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectId && dealId) {
      query = query.or(`project_id.eq.${projectId},deal_id.eq.${dealId}`)
    } else if (projectId) {
      query = query.eq('project_id', projectId)
    } else if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    const { data, error } = await query
    if (data) setLogs(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLog.trim()) return
    if (!dealId && !projectId) return

    setIsSubmitting(true)
    const { error } = await supabase.from('activity_logs').insert([{
      content: newLog.trim(),
      deal_id: projectId ? null : dealId,
      project_id: projectId || null
    }])

    setIsSubmitting(false)
    if (error) {
      toast.error("Errore durante il salvataggio della nota")
    } else {
      toast.success("Nota aggiunta al diario")
      setNewLog('')
      fetchLogs()
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Eliminare definitivamente questa nota?")) return
    const { error } = await supabase.from('activity_logs').delete().eq('id', id)
    if (!error) {
      fetchLogs()
    } else {
      toast.error("Errore durante l'eliminazione")
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <textarea
          className={styles.textarea}
          placeholder="Aggiungi una nota al diario... (es. 'Ho appena chiamato il cliente...')"
          value={newLog}
          onChange={e => setNewLog(e.target.value)}
          rows={3}
        />
        <div className={styles.formFooter}>
          <Button variant="primary" type="submit" disabled={isSubmitting || !newLog.trim()}>
            <Send size={16} style={{ marginRight: '8px' }} />
            {isSubmitting ? 'Salvataggio...' : 'Aggiungi Nota'}
          </Button>
        </div>
      </form>

      <div className={styles.timeline}>
        {logs.length === 0 ? (
          <div className={styles.emptyState}>Nessuna nota nel diario.</div>
        ) : (
          logs.map(log => {
            const date = new Date(log.created_at)
            const isFromDeal = log.deal_id && projectId
            
            return (
              <div key={log.id} className={`${styles.logEntry} ${isFromDeal ? styles.inheritedLog : ''}`}>
                <div className={styles.logHeader}>
                  <div className={styles.logMeta}>
                    <Clock size={14} className={styles.metaIcon} />
                    <span>{date.toLocaleDateString('it-IT')} alle {date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isFromDeal && <span className={styles.badgeInherited}>Ereditato da Deal</span>}
                  </div>
                  <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(log.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className={styles.logContent}>
                  {log.content.split('\\n').map((line: string, i: number) => (
                    <p key={i} style={{ minHeight: line === '' ? '1em' : 'auto' }}>{line}</p>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
