'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building, BookOpen, User, Euro, Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import styles from './DealDrawer.module.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface DealDrawerProps {
  isOpen: boolean
  onClose: () => void
  deal: any | null
  onSaved: () => void
}

export function DealDrawer({ isOpen, onClose, deal, onSaved }: DealDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<any>({})
  
  const [companies, setCompanies] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [phases, setPhases] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      fetchOptions()
    } else {
      document.body.style.overflow = 'unset'
      setIsEditing(false)
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        value: deal.value || 0,
        course: deal.course || '',
        description: deal.description || '',
        company_id: deal.company_id || '',
        contact_id: deal.contact_id || '',
        phase_id: deal.phase_id || ''
      })
      setIsEditing(false)
    }
  }, [deal])

  const fetchOptions = async () => {
    const [compRes, contRes, phaseRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('contacts').select('id, first_name, last_name').order('first_name'),
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
        toast.error('Errore durante l\'eliminazione del deal')
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
      course: formData.course,
      description: formData.description,
      company_id: formData.company_id || null,
      contact_id: formData.contact_id || null,
      phase_id: formData.phase_id
    }).eq('id', deal.id)
    
    setIsSubmitting(false)
    if (error) {
      toast.error('Errore durante il salvataggio')
    } else {
      toast.success('Deal aggiornato con successo')
      setIsEditing(false)
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
                {isEditing ? (
                  <input 
                    className={styles.editInputTitle}
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                ) : (
                  <h2 className={styles.title}>{deal.title}</h2>
                )}
                
                <div className={styles.badges}>
                  <span className={styles.badge} data-source={deal.source}>
                    {deal.source}
                  </span>
                  
                  {isEditing ? (
                    <select 
                      className={styles.editSelectBadge}
                      value={formData.phase_id}
                      onChange={e => setFormData({...formData, phase_id: e.target.value})}
                    >
                      {phases.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  ) : (
                    <span className={styles.badgePhase}>{deal.phase_id}</span>
                  )}
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              
              <div className={styles.cardGroup}>
                <div className={styles.statCard}>
                  <Euro className={styles.statIcon} />
                  <div>
                    <span className={styles.statLabel}>Valore Deal</span>
                    {isEditing ? (
                      <input 
                        type="number"
                        className={styles.editInput}
                        value={formData.value}
                        onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                      />
                    ) : (
                      <span className={styles.statValue}>€{Number(deal.value).toLocaleString('it-IT')}</span>
                    )}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <BookOpen className={styles.statIcon} />
                  <div>
                    <span className={styles.statLabel}>Corso/Servizio</span>
                    {isEditing ? (
                      <input 
                        type="text"
                        className={styles.editInput}
                        value={formData.course}
                        onChange={e => setFormData({...formData, course: e.target.value})}
                      />
                    ) : (
                      <span className={styles.statValue}>{deal.course || 'Nessuno'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Descrizione / Progetto</h3>
                {isEditing ? (
                  <ReactQuill 
                    theme="snow"
                    value={formData.description}
                    onChange={val => setFormData({...formData, description: val})}
                    style={{ backgroundColor: 'white', color: 'black', borderRadius: '4px' }}
                  />
                ) : (
                  <div className={styles.descriptionText}>
                    {deal.description ? (
                      <div dangerouslySetInnerHTML={{ __html: deal.description }} className={styles.quillContent} />
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Nessuna descrizione</span>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Dettagli Relazione</h3>
                
                <div className={styles.detailRow}>
                  <Building size={16} className={styles.detailIcon} />
                  <div className={styles.detailText}>
                    <span className={styles.detailLabel}>Azienda</span>
                    {isEditing ? (
                      <select 
                        className={styles.editSelect}
                        value={formData.company_id}
                        onChange={e => setFormData({...formData, company_id: e.target.value})}
                      >
                        <option value="">Nessuna Azienda</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    ) : (
                      <>{companies.find(c => c.id === deal.company_id)?.name || 'Nessuna Azienda'}</>
                    )}
                  </div>
                </div>
                
                <div className={styles.detailRow}>
                  <User size={16} className={styles.detailIcon} />
                  <div className={styles.detailText}>
                    <span className={styles.detailLabel}>Referente</span>
                    {isEditing ? (
                      <select 
                        className={styles.editSelect}
                        value={formData.contact_id}
                        onChange={e => setFormData({...formData, contact_id: e.target.value})}
                      >
                        <option value="">Nessun Contatto</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                      </select>
                    ) : (
                      <>{(() => {
                        const contact = contacts.find(c => c.id === deal.contact_id)
                        return contact ? `${contact.first_name} ${contact.last_name}` : 'Nessun Contatto'
                      })()}</>
                    )}
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

            </div>

            <div className={styles.footer}>
              {isEditing ? (
                <>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Annulla</Button>
                  <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
                  </Button>
                </>
              ) : (
                <>
                  <button className={styles.deleteBtn} onClick={handleDelete}>
                    <Trash2 size={16} /> Elimina Deal
                  </button>
                  <div style={{flex: 1}}></div>
                  <Button variant="ghost" onClick={onClose}>Chiudi</Button>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>Modifica Dettagli</Button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
