import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import styles from '../board/QuickAddDeal.module.css'

interface QuickAddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: any) => void
  activeTab: string
  phases: any[]
}

export function QuickAddProjectModal({ isOpen, onClose, onAdd, activeTab, phases }: QuickAddProjectModalProps) {
  const [title, setTitle] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [companies, setCompanies] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  const fetchOptions = async () => {
    const { data: compRes } = await supabase.from('companies').select('id, name').order('name')
    if (compRes) setCompanies(compRes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Find first phase for active type
    const tabPhases = phases.filter(p => p.project_type_id === activeTab).sort((a,b) => a.sort_order - b.sort_order)
    const firstPhase = tabPhases.length > 0 ? tabPhases[0].id : 'new'

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create new project in DB
    const projectData = {
      title,
      company_id: companyId || null,
      type_id: activeTab,
      phase_id: firstPhase,
      billing_type: 'one-off',
      billing_amount: 0,
      time_tracking_enabled: false,
      report_token: token
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select('*, companies(name)')
      .single()

    setLoading(false)

    if (error) {
      console.error("Errore salvataggio progetto:", error)
      alert("Errore nel salvataggio del progetto")
      return
    }

    onAdd(data)
    onClose()
    
    // Reset form
    setTitle('')
    setCompanyId('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuovo Progetto">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input 
          label="Titolo Progetto" 
          placeholder="es. Restyling Sito Web" 
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
              <option value="">-- Nessuna Azienda --</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Crea Progetto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
