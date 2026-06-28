'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import styles from '../companies/CompanyModal.module.css' // We can reuse the same CSS

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  contact?: any | null
}

export function ContactModal({ isOpen, onClose, onSaved, contact }: ContactModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [companies, setCompanies] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Fetch companies for dropdown
    const fetchCompanies = async () => {
      const { data } = await supabase.from('companies').select('id, name').order('name')
      if (data) setCompanies(data)
    }
    if (isOpen) fetchCompanies()
  }, [isOpen, supabase])

  useEffect(() => {
    if (contact) {
      setFirstName(contact.first_name || '')
      setLastName(contact.last_name || '')
      setEmail(contact.email || '')
      setPhone(contact.phone || '')
      setCompanyId(contact.company_id || '')
    } else {
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setCompanyId('')
    }
  }, [contact, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      company_id: companyId || null
    }

    let error;

    if (contact) {
      const res = await supabase.from('contacts').update(payload).eq('id', contact.id)
      error = res.error
    } else {
      const res = await supabase.from('contacts').insert([payload])
      error = res.error
    }

    setIsSubmitting(false)

    if (error) {
      console.error(error)
      toast.error('Errore durante il salvataggio')
    } else {
      toast.success(contact ? 'Contatto aggiornato' : 'Contatto creato con successo')
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
              <h2 className={styles.title}>{contact ? 'Modifica Contatto' : 'Nuovo Contatto'}</h2>
              <button className={styles.closeBtn} onClick={onClose} type="button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Nome *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Cognome</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label>Telefono</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label>Azienda</label>
                <select 
                  value={companyId} 
                  onChange={e => setCompanyId(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)', padding: '0.75rem', color: 'var(--color-text)' }}
                >
                  <option value="">-- Nessuna Azienda --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.footer}>
                <Button variant="ghost" onClick={onClose} type="button">Annulla</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting || !firstName}>
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
