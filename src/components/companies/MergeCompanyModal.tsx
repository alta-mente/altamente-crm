'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { mergeCompanies } from '@/app/actions/companies'
import { toast } from 'sonner'
import styles from './CompanyModal.module.css'

interface MergeCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  sourceCompany: any | null
  allCompanies: any[]
}

export function MergeCompanyModal({ isOpen, onClose, onSaved, sourceCompany, allCompanies }: MergeCompanyModalProps) {
  const [targetCompanyId, setTargetCompanyId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceCompany || !targetCompanyId) return

    if (window.confirm(`ATTENZIONE: Questa azione sposterà tutti i dati da "${sourceCompany.name}" all'azienda selezionata e quindi ELIMINERÀ in modo irreversibile "${sourceCompany.name}". Sei sicuro di voler procedere?`)) {
      setIsSubmitting(true)
      try {
        const res = await mergeCompanies(sourceCompany.id, targetCompanyId)
        if (res && !res.success) {
          toast.error(res.error || 'Errore durante l\\'unione delle aziende')
          return
        }
        toast.success('Aziende unite con successo')
        onSaved()
        onClose()
      } catch (error: any) {
        toast.error(error.message || 'Errore durante l\'unione delle aziende')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Filter out the source company from the target list
  const targetOptions = allCompanies.filter(c => c.id !== sourceCompany?.id).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <AnimatePresence>
      {isOpen && sourceCompany && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={styles.modal}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Unisci Azienda (Merge)</h2>
              <button className={styles.closeBtn} onClick={onClose} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Operazione Irreversibile</strong>
                  <span style={{ fontSize: '0.9rem' }}>
                    Stai per spostare tutti i contatti, progetti, servizi, scadenze e ore lavorate dall'azienda <strong>{sourceCompany.name}</strong> a un'altra azienda. L'azienda di origine verrà <strong>eliminata</strong>.
                  </span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Azienda da eliminare (Origine)</label>
                <input 
                  type="text" 
                  value={sourceCompany.name} 
                  disabled
                  style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Riversa i dati in (Destinazione) *</label>
                <select 
                  value={targetCompanyId} 
                  onChange={e => setTargetCompanyId(e.target.value)} 
                  required 
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-dark)', background: '#fff', fontSize: '1rem' }}
                >
                  <option value="">-- Seleziona Azienda --</option>
                  {targetOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.footer}>
                <Button variant="ghost" onClick={onClose} type="button">Annulla</Button>
                <Button variant="danger" type="submit" disabled={isSubmitting || !targetCompanyId}>
                  {isSubmitting ? 'Unione in corso...' : 'Unisci ed Elimina'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
