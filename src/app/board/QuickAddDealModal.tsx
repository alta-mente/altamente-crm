import React, { useState } from 'react'
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
  const [company, setCompany] = useState('')
  const [course, setCourse] = useState('')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Create new deal in DB
    const dealData = {
      title,
      company_id: null,
      contact_id: null,
      course,
      value: parseFloat(value) || 0,
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
    setCompany('')
    setCourse('')
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
        
        <Input 
          label="Azienda / Contatto" 
          placeholder="es. Acme Corp" 
          value={company}
          onChange={e => setCompany(e.target.value)}
          required 
        />
        
        <div className={styles.row}>
          <Input 
            label="Corso / Servizio" 
            placeholder="es. Mobile Dev" 
            value={course}
            onChange={e => setCourse(e.target.value)}
          />
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
