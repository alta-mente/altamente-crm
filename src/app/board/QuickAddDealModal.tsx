import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import styles from './QuickAddDeal.module.css'

interface QuickAddDealModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (deal: any) => void
}

export function QuickAddDealModal({ isOpen, onClose, onAdd }: QuickAddDealModalProps) {
  const [title, setTitle] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [contactId, setContactId] = useState('')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [companies, setCompanies] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  const fetchOptions = async () => {
    const [compRes, contRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('contacts').select('id, first_name, last_name').order('first_name')
    ])
    if (compRes.data) setCompanies(compRes.data)
    if (contRes.data) setContacts(contRes.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Create new deal in DB
    const dealData = {
      title,
      company_id: companyId || null,
      contact_id: contactId || null,
      value: Number(value) || 0,
      source: 'web', // Default
      phase_id: 'unassigned'
    }

    const { data, error } = await supabase
      .from('deals')
      .insert([dealData])
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error("Errore salvataggio deal:", error)
      alert("Errore nel salvataggio del deal")
      return
    }

    onAdd(data)
    onClose()
    
    // Reset form
    setTitle('')
    setCompanyId('')
    setContactId('')
    setValue('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuovo Deal">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input 
          label="Titolo Deal" 
          placeholder="es. Sviluppo App iOS" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          required 
        />
        
        <div className={styles.row}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Azienda</label>
            <select 
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
              <option value="">-- Seleziona Azienda --</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Contatto</label>
            <select 
              value={contactId}
              onChange={e => setContactId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
              <option value="">-- Seleziona Contatto --</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>
        </div>
        
        <div className={styles.row}>
          <Input 
            label="Valore (€)" 
            type="number" 
            placeholder="es. 5000" 
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Aggiungi Deal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
