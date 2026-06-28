'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building, User, Euro, Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import styles from './DealDrawer.module.css'
import { ActivityLog } from '@/components/ActivityLog'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface DealDrawerProps {
  isOpen: boolean
  onClose: () => void
  deal: any | null
  onSaved: () => void
}

export function DealDrawer({ isOpen, onClose, deal, onSaved }: DealDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'quote' | 'notes' | 'diary'>('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [associatedProject, setAssociatedProject] = useState<any>(null)
  
  const [companies, setCompanies] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [phases, setPhases] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [newApptTitle, setNewApptTitle] = useState('')
  const [newApptDate, setNewApptDate] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      fetchOptions()
      setActiveTab('details')
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        value: deal.value || 0,
        description: deal.description || '',
        quote_description: deal.quote_description || '',
        company_id: deal.company_id || '',
        contact_id: deal.contact_id || '',
        phase_id: deal.phase_id || ''
      })
      fetchAppointments(deal.id)
      fetchAssociatedProject(deal.id)
    }
  }, [deal])

  const fetchAssociatedProject = async (dealId: string) => {
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('deal_id', dealId)
      .maybeSingle()
    setAssociatedProject(data)
  }

  const handleConvertToProject = async () => {
    if (!deal) return
    setIsSubmitting(true)
    
    const { data: project, error } = await supabase.from('projects').insert([{
      title: deal.title,
      company_id: deal.company_id,
      deal_id: deal.id,
      type_id: 'web',
      phase_id: 'briefing',
      billing_type: 'one-off',
      billing_amount: deal.value,
      billing_status: 'to_invoice'
    }]).select().single()
    
    setIsSubmitting(false)
    
    if (error) {
      toast.error('Errore durante la conversione in progetto')
    } else {
      toast.success('Progetto creato con successo!')
      setAssociatedProject(project)
      router.push('/projects')
    }
  }

  const fetchAppointments = async (dealId: string) => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('deal_id', dealId)
      .order('scheduled_at', { ascending: true })
    if (data) setAppointments(data)
  }

  const handleAddAppointment = async () => {
    if (!newApptTitle || !newApptDate || !deal) return
    const scheduledAt = new Date(newApptDate).toISOString()
    const { error } = await supabase.from('appointments').insert([{
      deal_id: deal.id,
      title: newApptTitle,
      scheduled_at: scheduledAt
    }])
    if (!error) {
      toast.success('Attività aggiunta')
      setNewApptTitle('')
      setNewApptDate('')
      fetchAppointments(deal.id)
    } else {
      toast.error("Errore durante l'aggiunta dell'attività")
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (!error) {
      toast.success('Attività completata')
      fetchAppointments(deal.id)
    }
  }

  const fetchOptions = async () => {
    const [compRes, contRes, phaseRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('contacts').select('id, first_name, last_name, company_id').order('first_name'),
      supabase.from('phases').select('id, title').order('sort_order')
    ])
    if (compRes.data) setCompanies(compRes.data)
    if (contRes.data) setContacts(contRes.data)
    if (phaseRes.data) setPhases(phaseRes.data)
  }

  const handleDelete = async () => {
    if (window.confirm(`Sei sicuro di voler eliminare il deal "${deal.title}"?`)) {
      const { error } = await supabase.from('deals').delete().eq('id', deal.id)
      if (error) {
        toast.error("Errore durante l'eliminazione del deal")
      } else {
        toast.success('Deal eliminato')
        onSaved()
        onClose()
      }
    }
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    const { error } = await supabase.from('deals').update({
      title: formData.title,
      value: formData.value,
      description: formData.description,
      quote_description: formData.quote_description,
      company_id: formData.company_id || null,
      contact_id: formData.contact_id || null,
      phase_id: formData.phase_id
    }).eq('id', deal.id)
    
    setIsSubmitting(false)
    if (error) {
      toast.error('Errore durante il salvataggio')
    } else {
      toast.success('Modifiche salvate!')
      onSaved()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && deal && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={styles.drawer}
          >
            <div className={styles.header}>
              <div className={styles.titleSection}>
                <input 
                  className={styles.editInputTitle}
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Titolo Deal"
                />
                
                <div className={styles.badges}>
                  <span className={styles.badge} data-source={deal.source}>
                    {deal.source}
                  </span>
                  
                  <select 
                    className={styles.editSelectBadge}
                    value={formData.phase_id}
                    onChange={e => setFormData({...formData, phase_id: e.target.value})}
                  >
                    {phases.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Dettagli & Contatti
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'quote' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('quote')}
                >
                  Preventivo (PDF)
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'notes' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  Note Esecutive / Briefing
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'diary' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('diary')}
                >
                  Diario di Bordo
                </button>
              </div>

              {activeTab === 'details' && (
                <>
                  <div className={styles.cardGroup}>
                    <div className={styles.statCard}>
                      <Euro className={styles.statIcon} />
                      <div>
                        <span className={styles.statLabel}>Valore Deal (€)</span>
                        <input 
                          type="number"
                          className={styles.editInput}
                          value={formData.value}
                          onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Dettagli Relazione</h3>
                    
                    <div className={styles.detailRow}>
                      <Building size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Azienda</span>
                        <select 
                          className={styles.editSelect}
                          value={formData.company_id}
                          onChange={e => setFormData({...formData, company_id: e.target.value})}
                        >
                          <option value="">Nessuna Azienda</option>
                          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <User size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Referente</span>
                        <select 
                          className={styles.editSelect}
                          value={formData.contact_id}
                          onChange={e => setFormData({...formData, contact_id: e.target.value})}
                        >
                          <option value="">Nessun Contatto</option>
                          {contacts
                            .filter(c => !formData.company_id || c.company_id === formData.company_id)
                            .map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)
                          }
                        </select>
                      </div>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <CalendarIcon size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Data Creazione</span>
                        {new Date(deal.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Attività Programmate</h3>
                    
                    <div className={styles.addAppointmentForm}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          placeholder="Es. Richiamare Mario..." 
                          className={styles.apptInputTitle}
                          value={newApptTitle}
                          onChange={e => setNewApptTitle(e.target.value)}
                        />
                        <input 
                          type="datetime-local" 
                          className={styles.apptInputDate} 
                          value={newApptDate}
                          onChange={e => setNewApptDate(e.target.value)}
                        />
                        <button 
                          className={styles.addApptBtn} 
                          onClick={handleAddAppointment} 
                          disabled={!newApptTitle || !newApptDate}
                          title="Aggiungi"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className={styles.appointmentsList}>
                      {appointments.length === 0 ? (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>Nessuna attività programmata</span>
                      ) : (
                        appointments.map(appt => {
                          const dateObj = new Date(appt.scheduled_at)
                          return (
                            <div key={appt.id} className={styles.appointmentCard}>
                              <div className={styles.appointmentInfo}>
                                <div className={styles.appointmentTitle}>{appt.title}</div>
                                <div className={styles.appointmentTime}>
                                  {dateObj.toLocaleDateString('it-IT')} - {dateObj.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                                </div>
                              </div>
                              <button className={styles.deleteApptBtn} onClick={() => handleDeleteAppointment(appt.id)} title="Segna come completato">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'quote' && (
                <div className={styles.section} style={{ flex: 1, borderBottom: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>Lettera di Preventivo</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Il testo scritto qui comparirà nel PDF del preventivo.</p>
                    </div>
                    <Button variant="ghost" onClick={() => window.open(`/deals/${deal.id}/quote`, '_blank')} style={{ color: 'var(--color-primary)' }}>
                      Genera PDF ↗
                    </Button>
                  </div>
                  
                  <div style={{ flex: 1, minHeight: '400px' }}>
                    <ReactQuill 
                      theme="snow"
                      value={formData.quote_description}
                      onChange={val => setFormData({...formData, quote_description: val})}
                      style={{ backgroundColor: 'white', color: 'black', borderRadius: '4px', height: '100%' }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className={styles.section} style={{ flex: 1, borderBottom: 'none' }}>
                  <h3 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>Note Esecutive / Briefing</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Appunti interni per il team di sviluppo. Non verranno stampati.</p>
                  
                  <div style={{ flex: 1, minHeight: '400px' }}>
                    <ReactQuill 
                      theme="snow"
                      value={formData.description}
                      onChange={val => setFormData({...formData, description: val})}
                      style={{ backgroundColor: 'white', color: 'black', borderRadius: '4px', height: '100%' }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'diary' && (
                <div className={styles.section} style={{ flex: 1, borderBottom: 'none' }}>
                  <h3 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>Diario di Bordo</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Aggiungi aggiornamenti, chiamate o note rapide cronologiche.</p>
                  
                  <div style={{ flex: 1 }}>
                    <ActivityLog dealId={deal.id} />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button className={styles.deleteBtn} onClick={handleDelete} title="Elimina Deal">
                <Trash2 size={16} />
              </button>
              <div style={{flex: 1}}></div>
              
              {deal.phase_id === 'won' && !associatedProject && (
                <Button variant="ghost" onClick={handleConvertToProject} disabled={isSubmitting} style={{ color: 'var(--color-primary)' }}>
                  ⚡ Converti in Progetto
                </Button>
              )}
              {associatedProject && (
                <Button variant="ghost" onClick={() => router.push('/projects')} style={{ color: 'var(--color-success)' }}>
                  Vai al Progetto
                </Button>
              )}

              <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
