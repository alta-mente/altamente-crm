'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import styles from './CompanyModal.module.css'

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  company?: any | null
}

export function CompanyModal({ isOpen, onClose, onSaved, company }: CompanyModalProps) {
  const [name, setName] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [address, setAddress] = useState('')
  const [timeTrackingEnabled, setTimeTrackingEnabled] = useState(false)
  const [contactEmail, setContactEmail] = useState('')
  const [isPrepaid, setIsPrepaid] = useState(false)
  const [prepaidHours, setPrepaidHours] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (company) {
      setName(company.name || '')
      setVatNumber(company.vat_number || '')
      setAddress(company.address || '')
      setTimeTrackingEnabled(company.time_tracking_enabled || false)
      setContactEmail(company.contact_email || '')
      setIsPrepaid((company.prepaid_minutes || 0) > 0)
      setPrepaidHours(company.prepaid_minutes ? String(company.prepaid_minutes / 60).replace('.', ',') : '')
      setHourlyRate(company.hourly_rate ? String(company.hourly_rate).replace('.', ',') : '')
    } else {
      setName('')
      setVatNumber('')
      setAddress('')
      setTimeTrackingEnabled(false)
      setContactEmail('')
      setIsPrepaid(false)
      setPrepaidHours('')
      setHourlyRate('')
    }
  }, [company, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      name,
      vat_number: vatNumber,
      address,
      contact_email: contactEmail,
    }

    let error;

    if (company) {
      // Update
      const res = await supabase.from('companies').update(payload).eq('id', company.id)
      error = res.error
    } else {
      // Insert
      const res = await supabase.from('companies').insert([payload])
      error = res.error
    }

    setIsSubmitting(false)

    if (error) {
      console.error(error)
      toast.error('Errore durante il salvataggio')
    } else {
      toast.success(company ? 'Azienda aggiornata' : 'Azienda creata con successo')
      onSaved()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
              <h2 className={styles.title}>{company ? 'Modifica Azienda' : 'Nuova Azienda'}</h2>
              <button className={styles.closeBtn} onClick={onClose} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nome Azienda *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="Es. ACME Corp."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Partita IVA</label>
                <input 
                  type="text" 
                  value={vatNumber} 
                  onChange={e => setVatNumber(e.target.value)} 
                  placeholder="Es. IT12345678901"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Indirizzo</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="Via Roma 1, Milano"
                />
              </div>


              <div className={styles.formGroup}>
                <label>Email di Contatto (Per fatturazione e reportistica)</label>
                <input 
                  type="email" 
                  value={contactEmail} 
                  onChange={e => setContactEmail(e.target.value)} 
                  placeholder="amministrazione@azienda.com"
                />
              </div>

              <div className={styles.footer}>
                <Button variant="ghost" onClick={onClose} type="button">Annulla</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting || !name}>
                  {isSubmitting ? 'Salvataggio...' : 'Salva'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
