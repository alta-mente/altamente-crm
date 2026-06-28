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
      time_tracking_enabled: timeTrackingEnabled,
      contact_email: contactEmail,
      prepaid_minutes: isPrepaid ? (Math.round(parseFloat(prepaidHours.replace(',','.')) * 60) || 0) : 0,
      hourly_rate: parseFloat(hourlyRate.replace(',','.')) || 0
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

              <div style={{ marginTop: '1.5rem', marginBottom: '1rem', borderTop: '1px solid var(--color-border-dark)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Gestione Ore (Time Tracking)</h3>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    checked={timeTrackingEnabled} 
                    onChange={e => setTimeTrackingEnabled(e.target.checked)} 
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  Abilita tracciamento ore per questa azienda
                </label>

                {timeTrackingEnabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border-dark)' }}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                      <label>Email Referente (per notifiche)</label>
                      <input 
                        type="email" 
                        value={contactEmail} 
                        onChange={e => setContactEmail(e.target.value)} 
                        placeholder="cliente@email.com"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Tariffa Oraria (€)</label>
                      <input 
                        type="text" 
                        value={hourlyRate} 
                        onChange={e => setHourlyRate(e.target.value)} 
                        placeholder="Es. 50"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tipologia</label>
                      <select 
                        value={isPrepaid ? 'prepaid' : 'postpaid'} 
                        onChange={e => setIsPrepaid(e.target.value === 'prepaid')}
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-dark)', background: '#fff', fontSize: '0.9rem' }}
                      >
                        <option value="postpaid">Consuntivo (Paga a fine mese)</option>
                        <option value="prepaid">Monte Ore (Prepagato)</option>
                      </select>
                    </div>

                    {isPrepaid && (
                      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label>Ore Prepagate (Residuo Attuale)</label>
                        <input 
                          type="text" 
                          value={prepaidHours} 
                          onChange={e => setPrepaidHours(e.target.value)} 
                          placeholder="Es. 20"
                        />
                        <span style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Inserisci le ore totali acquistate dal cliente (es. 20). Verranno scalate inserendo nuove attività.</span>
                      </div>
                    )}
                  </div>
                )}
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
