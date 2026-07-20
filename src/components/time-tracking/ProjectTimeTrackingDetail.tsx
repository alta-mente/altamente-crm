'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Download, FileText, Send, Archive, Trash2, Edit2, Undo2, Clock, LayoutDashboard } from 'lucide-react'
import { addCompanyHours, editCompanyHours, deleteCompanyHours, archiveCompanyHours, unarchiveCompanyHourRow, unarchiveBatch, generateReportToken, notifyClientAboutReport } from '@/app/actions/time-tracking'
import styles from './TimeTrackingDetail.module.css'

interface Project {
  id: string
  title: string
  report_token?: string
  hourly_rate?: number
  company_id: string
  companies?: {
    name: string
    contact_email?: string
  }
}

interface CompanyHour {
  id: string
  project_id: string
  company_id: string
  date: string
  description: string
  minutes: number
  billed: boolean
  batch_id: string
  invoice_id?: string
  invoices?: {
    status: string
  }
}

interface Props {
  project: Project
  initialHours: CompanyHour[]
  isEmbedded?: boolean
  onHoursUpdated?: () => void
}

export function ProjectTimeTrackingDetail({ project, initialHours, isEmbedded, onHoursUpdated }: Props) {
  const router = useRouter()
  const [showArchived, setShowArchived] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    hoursStr: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const activeHours = initialHours.filter(h => !h.billed)
  const archivedHours = initialHours.filter(h => h.billed)
  const displayHours = showArchived ? initialHours : activeHours

  const totalActiveMinutes = activeHours.reduce((acc, curr) => acc + curr.minutes, 0)
  const rate = project.hourly_rate || 0

  const formatTime = (minutes: number) => {
    const h = Math.floor(Math.abs(minutes) / 60)
    const m = Math.abs(minutes) % 60
    return `${minutes < 0 ? '-' : ''}${h}h ${m.toString().padStart(2, '0')}m`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const minutes = Math.round(parseFloat(formData.hoursStr.replace(',', '.')) * 60)
      if (isNaN(minutes)) {
        alert('Inserisci un numero di ore valido')
        return
      }

      if (isEditing) {
        await editCompanyHours(editId, {
          project_id: project.id,
          date: formData.date,
          description: formData.description,
          minutes
        })
      } else {
        await addCompanyHours({
          project_id: project.id,
          company_id: project.company_id, // keep it for backward compatibility if needed
          date: formData.date,
          description: formData.description,
          minutes
        })
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        hoursStr: ''
      })
      setIsEditing(false)
      setEditId('')
      
      if (onHoursUpdated) onHoursUpdated()
      
    } catch (err) {
      alert('Errore durante il salvataggio')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: CompanyHour) => {
    setIsEditing(true)
    setEditId(item.id)
    setFormData({
      date: item.date,
      description: item.description,
      hoursStr: (item.minutes / 60).toString().replace('.', ',')
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questa attività?')) return
    try {
      await deleteCompanyHours(id, project.id)
      if (onHoursUpdated) onHoursUpdated()
    } catch (err) {
      alert("Errore durante l'eliminazione")
    }
  }

  const handleArchive = async () => {
    if (!confirm('Archiviare tutte le ore aperte come fatturate?')) return
    setIsArchiving(true)
    try {
      await archiveCompanyHours(project.id)
      
      // Chiedi se inviare notifica
      if (confirm("Archiviazione completata. Vuoi inviare un'email al cliente con il link al report pubblico?")) {
        const monthName = new Date().toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        const res = await notifyClientAboutReport(project.id, monthName);
        if (res && !res.success) {
          alert(res.error || "Errore durante l'invio dell'email");
        } else {
          alert('Email inviata con successo al cliente!');
        }
      }

    } catch (err) {
      alert("Errore durante l'archiviazione o l'invio dell'email")
    } finally {
      setIsArchiving(false)
      if (onHoursUpdated) onHoursUpdated()
    }
  }

  const handleUnarchive = async (id: string, batchId?: string | null) => {
    let unarchiveAll = false;
    if (batchId) {
      const choice = window.prompt('Vuoi de-archiviare SOLO questa riga (scrivi "1") o l\'INTERO blocco (scrivi "2")?', '1');
      if (choice === '2') {
        unarchiveAll = true;
      } else if (choice !== '1') {
        return; // Annulla
      }
    } else {
      if (!confirm('Riportare questa singola riga tra le ore aperte?')) return
    }

    try {
      if (unarchiveAll && batchId) {
        await unarchiveBatch(batchId, project.id)
      } else {
        await unarchiveCompanyHourRow(id, project.id)
      }
      if (onHoursUpdated) onHoursUpdated()
    } catch (err: any) {
      alert('Errore durante de-archiviazione: ' + (err.message || String(err)))
      console.error("Unarchive error:", err);
    }
  }



  const handleGenerateReportUrl = async () => {
    try {
      const token = await generateReportToken(project.id)
      const url = `${window.location.origin}/report/${token}`
      window.open(url, '_blank')
    } catch (err) {
      alert('Errore durante la generazione del link report')
    }
  }

  const handleSendReportEmail = async () => {
    if (!confirm('Vuoi inviare il report aggiornato via email al cliente?')) return
    setIsSendingEmail(true)
    try {
      const monthName = new Date().toLocaleString('it-IT', { month: 'long', year: 'numeric' });
      const res = await notifyClientAboutReport(project.id, monthName);
      if (res && !res.success) {
        alert(res.error || "Errore durante l'invio dell'email");
      } else {
        alert('Email inviata con successo al cliente!');
      }
    } catch (err: any) {
      alert(err.message || "Errore durante l'invio dell'email");
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className={styles.container} style={isEmbedded ? { padding: 0 } : undefined}>
      {!isEmbedded && (
        <div className={styles.headerActions}>
          <Button onClick={() => router.push('/time-tracking')}>
            <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Torna alla lista
          </Button>
        </div>
      )}

      <div className={styles.mainCard} style={isEmbedded ? { border: 'none', boxShadow: 'none' } : undefined}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{project.title} {!isEmbedded && <span style={{fontWeight: 'normal', color: 'var(--color-text-muted)'}}>({project.companies?.name || 'Senza Azienda'})</span>}</h2>
          <div className={styles.headerButtons}>
            {project.company_id && (
              <Button onClick={() => window.open(`/portal/${project.company_id}`, '_blank')} title="Apri la Dashboard Aziendale">
                <LayoutDashboard size={16} style={{ marginRight: '8px' }} /> Dashboard
              </Button>
            )}
            <Button onClick={handleGenerateReportUrl} title="Genera Link Report Pubblico">
              <FileText size={16} style={{ marginRight: '8px' }} /> Visualizza Report
            </Button>
            <Button onClick={handleSendReportEmail} disabled={isSendingEmail} title="Invia Report al Cliente via Email" variant="primary">
              <Send size={16} style={{ marginRight: '8px' }} /> Invia Email
            </Button>
            <Link href={`/api/export-hours?pid=${project.id}`}>
              <Button title="Scarica CSV delle ore non archiviate">
                <Download size={16} style={{ marginRight: '8px' }} /> CSV
              </Button>
            </Link>
            {activeHours.length > 0 && (
              <Button onClick={handleArchive} disabled={isArchiving} variant="danger">
                <Archive size={16} style={{ marginRight: '8px' }} /> Archivia
              </Button>
            )}
          </div>
        </div>
        
        <div className={styles.cardContent}>
          <form onSubmit={handleSubmit} className={`${styles.form} ${isEditing ? styles.formEditing : ''}`}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Data</label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descrizione Attività</label>
                <Input type="text" placeholder="Es. Aggiornamento plugin..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ore</label>
                <Input type="text" placeholder="1,5" value={formData.hoursStr} onChange={e => setFormData({...formData, hoursStr: e.target.value})} required style={{ textAlign: 'center' }} />
              </div>
              <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
                <div className={styles.formButtons}>
                  <Button type="submit" disabled={isSubmitting} variant="primary" style={{ width: '100%' }}>{isEditing ? 'Aggiorna' : 'Salva'}</Button>
                  {isEditing && (
                    <Button type="button" onClick={() => { setIsEditing(false); setEditId(''); setFormData({ date: new Date().toISOString().split('T')[0], description: '', hoursStr: '' })}} variant="danger" style={{ padding: '0 12px' }} title="Annulla Modifica">
                      &times;
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>

          <div className={styles.historyHeader}>
            <div className={styles.historyTitle}>
              <Clock size={20} /> Storico Attività
            </div>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
              Mostra anche archiviati
            </label>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrizione</th>
                <th className={styles.right}>Ore</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayHours.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>Nessuna attività trovata.</td>
                </tr>
              )}
              {displayHours.map(row => {
                const isArchived = row.billed
                
                let costDisplay = null
                if (isArchived && rate > 0) {
                  const cost = (row.minutes / 60) * rate
                  costDisplay = <div className={styles.costDisplay}>€ {cost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                }

                return (
                  <tr key={row.id} className={isArchived ? styles.archivedRow : ''}>
                    <td className={styles.date}>
                      {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td>
                      {isArchived && (
                        <span 
                          onClick={() => handleUnarchive(row.id, row.batch_id)}
                          className={styles.badge}
                          style={{
                            background: row.invoices?.status === 'paid' ? 'rgba(0,255,0,0.1)' : 'rgba(255,150,0,0.1)',
                            color: row.invoices?.status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)'
                          }}
                          title="Clicca per de-archiviare SOLO questa riga"
                        >
                          {row.invoices?.status === 'paid' ? '✅ Incassato' : (row.invoices ? '⏳ Fatturato' : '📦 Archiviato')} ({row.batch_id ? new Date(row.batch_id.slice(0,4) + '-' + row.batch_id.slice(4,6) + '-' + row.batch_id.slice(6,8)).toLocaleDateString('it-IT') : 'Pregresso'})
                        </span>
                      )}
                      {row.description}
                    </td>
                    <td className={styles.right}>
                      {formatTime(row.minutes)}
                      {costDisplay}
                    </td>
                    <td className={styles.actions}>
                      {!isArchived && (
                        <>
                          <button onClick={() => handleEdit(row)} className={`${styles.actionButton} ${styles.editHover}`} title="Modifica">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(row.id)} className={`${styles.actionButton} ${styles.deleteHover}`} title="Elimina">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!showArchived && totalActiveMinutes > 0 && (
                <tr className={styles.totalRow}>
                  <td colSpan={2} style={{ textAlign: 'right' }}>TOTALE SELEZIONATO:</td>
                  <td className={styles.right}>{formatTime(totalActiveMinutes)}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
