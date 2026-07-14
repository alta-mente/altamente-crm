'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building, BookOpen, Euro, Calendar as CalendarIcon, Trash2, Link as LinkIcon, FileText, Code } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import styles from './ProjectDrawer.module.css'
import type { Project, ProjectPhase, ProjectType } from './ProjectBoard'
import { ActivityLog } from '@/components/ActivityLog'
import { ProjectInvoices } from './ProjectInvoices'
import { TimeTrackingTab } from '@/components/time-tracking/TimeTrackingTab'
import { notifyClientAboutReport } from '@/app/actions/time-tracking'
import { Send, LayoutDashboard } from 'lucide-react'

interface ProjectDrawerProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onSaved: () => void
}

export function ProjectDrawer({ isOpen, onClose, project, onSaved }: ProjectDrawerProps) {
  const [activeTab, setActiveTab] = useState<'diary' | 'admin' | 'links' | 'deal' | 'invoices' | 'time_tracking'>('diary')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [associatedDeal, setAssociatedDeal] = useState<any>(null)
  
  const [companies, setCompanies] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [phases, setPhases] = useState<ProjectPhase[]>([])
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      fetchOptions()
      setActiveTab('diary') // Reset tab on open
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        company_id: project.company_id || '',
        deal_id: project.deal_id || '',
        type_id: project.type_id || 'web',
        phase_id: project.phase_id || '',
        drive_url: project.drive_url || '',
        figma_url: project.figma_url || '',
        github_url: project.github_url || '',
        billing_type: project.billing_type || 'one-off',
        billing_amount: project.billing_amount || 0,
        billing_status: project.billing_status || 'to_invoice',
        billing_start_date: project.billing_start_date || new Date().toISOString().split('T')[0],
        time_tracking_enabled: project.time_tracking_enabled || false,
        always_send_report: project.always_send_report || false,
        prepaid_minutes: project.prepaid_minutes || 0,
        hourly_rate: project.hourly_rate || 0,
        collaborator_email: project.collaborator_email || '',
        commission_rate: project.commission_rate || 0,
      })
      
      if (project.deal_id) {
        fetchAssociatedDeal(project.deal_id)
      } else {
        setAssociatedDeal(null)
      }
    }
  }, [project])

  const fetchAssociatedDeal = async (dealId: string) => {
    const { data } = await supabase.from('deals').select('description, quote_description').eq('id', dealId).maybeSingle()
    if (data) setAssociatedDeal(data)
  }

  const fetchOptions = async () => {
    const [compRes, dealRes, phaseRes, typeRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('deals').select('id, title').order('title'),
      supabase.from('project_phases').select('*').order('sort_order'),
      supabase.from('project_types').select('*').order('sort_order')
    ])
    if (compRes.data) setCompanies(compRes.data)
    if (dealRes.data) setDeals(dealRes.data)
    if (phaseRes.data) setPhases(phaseRes.data)
    if (typeRes.data) setProjectTypes(typeRes.data)
  }

  const handleDelete = async () => {
    if (window.confirm(`Sei sicuro di voler eliminare il progetto "${project?.title}"?`)) {
      const { error } = await supabase.from('projects').delete().eq('id', project?.id)
      if (error) {
        toast.error('Errore durante l\'eliminazione del progetto')
      } else {
        toast.success('Progetto eliminato')
        onSaved()
        onClose()
      }
    }
  }

  const handleSave = async () => {
    if (!project) return
    setIsSubmitting(true)
    const { error } = await supabase.from('projects').update({
      title: formData.title,
      company_id: formData.company_id || null,
      deal_id: formData.deal_id || null,
      type_id: formData.type_id,
      phase_id: formData.phase_id,
      drive_url: formData.drive_url,
      figma_url: formData.figma_url,
      github_url: formData.github_url,
      billing_type: formData.billing_type,
      billing_amount: formData.billing_amount,
      billing_status: formData.billing_status,
      billing_start_date: formData.billing_start_date,
      time_tracking_enabled: formData.time_tracking_enabled,
      always_send_report: formData.always_send_report,
      prepaid_minutes: formData.prepaid_minutes,
      hourly_rate: formData.hourly_rate,
      collaborator_email: formData.collaborator_email || null,
      commission_rate: formData.commission_rate || 0
    }).eq('id', project.id)
    
    setIsSubmitting(false)
    if (error) {
      toast.error('Errore durante il salvataggio')
    } else {
      toast.success('Progetto aggiornato con successo')
      onSaved()
    }
  }

  const handleSendReportNow = async () => {
    if (!project) return
    if (!window.confirm('Vuoi inviare ora il report mensile al cliente via email?')) return
    setIsSendingEmail(true)
    try {
      const monthName = new Date().toLocaleString('it-IT', { month: 'long', year: 'numeric' })
      const res = await notifyClientAboutReport(project.id, monthName)
      if (res && !res.success) {
        toast.error(res.error || "Errore durante l'invio dell'email")
      } else {
        toast.success('Email inviata con successo!')
      }
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'invio dell'email")
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && project && (
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
                  placeholder="Titolo Progetto"
                />
                
                <div className={styles.badges}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select 
                      className={styles.editSelectBadge}
                      value={formData.type_id}
                      onChange={e => {
                        const newType = e.target.value;
                        const defaultPhase = phases.find(p => p.project_type_id === newType)?.id || '';
                        setFormData({...formData, type_id: newType, phase_id: defaultPhase});
                      }}
                    >
                      {projectTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    <select 
                      className={styles.editSelectBadge}
                      value={formData.phase_id}
                      onChange={e => setFormData({...formData, phase_id: e.target.value})}
                    >
                      {phases.filter(p => p.project_type_id === formData.type_id).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'diary' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('diary')}
                >
                  Diario di Bordo
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'admin' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  Dettagli & Amministrazione
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'links' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('links')}
                >
                  Risorse & Link
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'deal' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('deal')}
                >
                  Storico Deal Originario
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'invoices' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('invoices')}
                >
                  Fatture & Incassi
                </button>
                {formData.time_tracking_enabled && (
                  <button 
                    className={`${styles.tab} ${activeTab === 'time_tracking' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('time_tracking')}
                    style={{ color: 'var(--color-primary)', fontWeight: 600 }}
                  >
                    Ore & Consuntivi
                  </button>
                )}
              </div>

              {activeTab === 'diary' && (
                <div className={styles.section} style={{ flex: 1, borderBottom: 'none' }}>
                  <h3 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>Diario di Bordo (Timeline)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Aggiungi aggiornamenti. Le note del Deal originario vengono ereditate automaticamente.</p>
                  
                  <div style={{ flex: 1 }}>
                    <ActivityLog projectId={project.id} dealId={project.deal_id} />
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Amministrazione</h3>
                    <div className={styles.detailRow}>
                      <Euro size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Valore & Fatturazione</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <select 
                            className={styles.editSelect}
                            value={formData.billing_type}
                            onChange={e => setFormData({...formData, billing_type: e.target.value})}
                          >
                            <option value="one-off">Una Tantum</option>
                            <option value="retainer_monthly">Retainer Mensile</option>
                            <option value="retainer_yearly">Retainer Annuale</option>
                          </select>
                          <input 
                            type="number"
                            className={styles.editInput}
                            value={formData.billing_amount}
                            onChange={e => setFormData({...formData, billing_amount: Number(e.target.value)})}
                            style={{ width: '120px' }}
                          />
                        </div>
                        {formData.billing_type.startsWith('retainer') && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span className={styles.detailLabel} style={{ fontSize: '0.75rem' }}>Data di Partenza Retainer</span>
                            <input 
                              type="date"
                              className={styles.editInput}
                              value={formData.billing_start_date}
                              onChange={e => setFormData({...formData, billing_start_date: e.target.value})}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <FileText size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Stato Fatturazione</span>
                        <select 
                          className={styles.editSelect}
                          value={formData.billing_status}
                          onChange={e => setFormData({...formData, billing_status: e.target.value})}
                        >
                          <option value="to_invoice">Da Fatturare</option>
                          <option value="invoiced">Fatturato</option>
                          <option value="paid">Saldato</option>
                          <option value="late">In Ritardo</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <FileText size={16} className={styles.detailIcon} />
                      <div className={styles.detailText} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox"
                              checked={formData.always_send_report}
                              onChange={e => setFormData({...formData, always_send_report: e.target.checked})}
                            />
                            <span className={styles.detailLabel} style={{ marginBottom: 0 }}>Invia sempre report mensile via email (anche senza ore a consuntivo / canoni da fatturare)</span>
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {project?.company_id && (
                              <Button
                                variant="secondary"
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.open(`/portal/${project.company_id}`, '_blank');
                                }}
                                style={{ padding: '4px 8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                title="Visualizza la Dashboard Aziendale del cliente"
                              >
                                <LayoutDashboard size={14} style={{ marginRight: '4px' }} /> Dashboard
                              </Button>
                            )}
                            <Button 
                              variant="primary" 
                              onClick={handleSendReportNow} 
                              disabled={isSendingEmail} 
                              style={{ padding: '4px 8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                              title="Invia subito il report aggiornato via email"
                            >
                              <Send size={14} style={{ marginRight: '4px' }} /> {isSendingEmail ? 'Invio...' : 'Invia Ora'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Time Tracking & Consuntivi</h3>
                    <div className={styles.detailRow}>
                      <div className={styles.detailText} style={{ width: '100%' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                          <input 
                            type="checkbox"
                            checked={formData.time_tracking_enabled}
                            onChange={e => setFormData({...formData, time_tracking_enabled: e.target.checked})}
                          />
                          <span className={styles.detailLabel} style={{ marginBottom: 0 }}>Abilita Time Tracking (Ore e Consuntivi) per questo progetto</span>
                        </label>
                        
                        {formData.time_tracking_enabled && (
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <div>
                              <span className={styles.detailLabel} style={{ fontSize: '0.75rem' }}>Monte Ore Prepagato (Minuti)</span>
                              <input 
                                type="number"
                                className={styles.editInput}
                                value={formData.prepaid_minutes}
                                onChange={e => setFormData({...formData, prepaid_minutes: Number(e.target.value)})}
                                style={{ width: '150px' }}
                              />
                            </div>
                            <div>
                              <span className={styles.detailLabel} style={{ fontSize: '0.75rem' }}>Tariffa Oraria (A Consuntivo €)</span>
                              <input 
                                type="number"
                                className={styles.editInput}
                                value={formData.hourly_rate}
                                onChange={e => setFormData({...formData, hourly_rate: Number(e.target.value)})}
                                style={{ width: '150px' }}
                              />
                            </div>
                          </div>
                        )}
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
                      <BookOpen size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Deal Originario</span>
                        <select 
                          className={styles.editSelect}
                          value={formData.deal_id}
                          onChange={e => setFormData({...formData, deal_id: e.target.value})}
                        >
                          <option value="">Nessun Deal</option>
                          {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <CalendarIcon size={16} className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Data Creazione</span>
                        {new Date(project.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Collaboratore / Venditore</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Imposta le provvigioni spettanti a un venditore/collaboratore su questo progetto.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '0.5rem', alignItems: 'end' }}>
                      <div>
                        <span className={styles.detailLabel} style={{ fontSize: '0.75rem' }}>Email Collaboratore</span>
                        <input 
                          type="email"
                          className={styles.editInput}
                          placeholder="es. marco@azienda.it"
                          value={formData.collaborator_email || ''}
                          onChange={e => setFormData({...formData, collaborator_email: e.target.value})}
                        />
                      </div>
                      <div>
                        <span className={styles.detailLabel} style={{ fontSize: '0.75rem' }}>Commissione (%)</span>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          className={styles.editInput}
                          value={formData.commission_rate || 0}
                          onChange={e => setFormData({...formData, commission_rate: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'links' && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Risorse e Link</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Salva qui i link di accesso rapidi agli asset del progetto.</p>
                  
                  <div className={styles.detailRow}>
                    <LinkIcon size={16} className={styles.detailIcon} />
                    <div className={styles.detailText} style={{ width: '100%' }}>
                      <span className={styles.detailLabel}>Google Drive</span>
                      <input 
                        className={styles.editInput}
                        value={formData.drive_url}
                        onChange={e => setFormData({...formData, drive_url: e.target.value})}
                        placeholder="https://drive.google.com/..."
                      />
                      {formData.drive_url && <a href={formData.drive_url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--color-primary)', fontSize: '0.8rem', marginTop: '0.25rem'}}>Apri Link ↗</a>}
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailIcon} style={{ display: 'flex', justifyContent: 'center', width: '16px' }}>F</div>
                    <div className={styles.detailText} style={{ width: '100%' }}>
                      <span className={styles.detailLabel}>Figma</span>
                      <input 
                        className={styles.editInput}
                        value={formData.figma_url}
                        onChange={e => setFormData({...formData, figma_url: e.target.value})}
                        placeholder="https://figma.com/..."
                      />
                      {formData.figma_url && <a href={formData.figma_url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--color-primary)', fontSize: '0.8rem', marginTop: '0.25rem'}}>Apri Link ↗</a>}
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <Code size={16} className={styles.detailIcon} />
                    <div className={styles.detailText} style={{ width: '100%' }}>
                      <span className={styles.detailLabel}>Repository (GitHub/Vercel)</span>
                      <input 
                        className={styles.editInput}
                        value={formData.github_url}
                        onChange={e => setFormData({...formData, github_url: e.target.value})}
                        placeholder="https://github.com/..."
                      />
                      {formData.github_url && <a href={formData.github_url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--color-primary)', fontSize: '0.8rem', marginTop: '0.25rem'}}>Apri Link ↗</a>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'deal' && (
                <>
                  {!associatedDeal ? (
                    <div className={styles.section} style={{ flex: 1, borderBottom: 'none' }}>
                       <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Non c'è nessun Deal associato a questo progetto.</p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Lettera di Preventivo</h3>
                        <div className={styles.descriptionText}>
                          {associatedDeal.quote_description ? (
                            <div dangerouslySetInnerHTML={{ __html: associatedDeal.quote_description }} className={styles.quillContent} />
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Nessun preventivo associato al deal.</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Note Esecutive / Briefing originario</h3>
                        <div className={styles.descriptionText}>
                          {associatedDeal.description ? (
                            <div dangerouslySetInnerHTML={{ __html: associatedDeal.description }} className={styles.quillContent} />
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Nessuna nota originaria.</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'invoices' && (
                <div className={styles.section} style={{ flex: 1, borderBottom: 'none' }}>
                  <ProjectInvoices project={project} />
                </div>
              )}

              {activeTab === 'time_tracking' && (
                <div className={styles.section} style={{ flex: 1, borderBottom: 'none' }}>
                  <TimeTrackingTab project={project} />
                </div>
              )}

            </div>

            <div className={styles.footer}>
              <button className={styles.deleteBtn} onClick={handleDelete} title="Elimina Progetto">
                <Trash2 size={16} />
              </button>
              <div style={{flex: 1}}></div>
              
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
