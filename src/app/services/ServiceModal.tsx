import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service?: any
  onSaved: () => void
}

export function ServiceModal({ isOpen, onClose, service, onSaved }: ServiceModalProps) {
  const [title, setTitle] = useState('')
  const [serviceType, setServiceType] = useState('domain')
  const [companyId, setCompanyId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [cost, setCost] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [status, setStatus] = useState('active')
  const [loading, setLoading] = useState(false)
  
  const [companies, setCompanies] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchOptions()
      if (service) {
        setTitle(service.title)
        setServiceType(service.service_type)
        setCompanyId(service.company_id || '')
        setProjectId(service.project_id || '')
        setCost(service.cost?.toString() || '')
        setExpiryDate(service.expiry_date || '')
        setStatus(service.status || 'active')
      } else {
        setTitle('')
        setServiceType('domain')
        setCompanyId('')
        setProjectId('')
        setCost('')
        setExpiryDate('')
        setStatus('active')
      }
    }
  }, [isOpen, service])

  const fetchOptions = async () => {
    const [compRes, projRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('projects').select('id, title, company_id').order('title')
    ])
    if (compRes.data) setCompanies(compRes.data)
    if (projRes.data) setProjects(projRes.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const serviceData = {
      title,
      service_type: serviceType,
      company_id: companyId || null,
      project_id: projectId || null,
      cost: Number(cost) || 0,
      expiry_date: expiryDate,
      status
    }

    if (service) {
      // Update
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', service.id)

      if (error) toast.error("Errore salvataggio servizio")
      else {
        toast.success("Servizio aggiornato")
        onSaved()
        onClose()
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('services')
        .insert([serviceData])

      if (error) toast.error("Errore salvataggio servizio")
      else {
        toast.success("Servizio aggiunto")
        onSaved()
        onClose()
      }
    }

    setLoading(false)
  }

  // Filter projects by selected company
  const availableProjects = companyId 
    ? projects.filter(p => p.company_id === companyId || !p.company_id)
    : projects

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? "Modifica Servizio" : "Nuovo Servizio"}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <Input 
          label="Nome Servizio" 
          placeholder="es. Dominio altamente.com" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          required 
        />
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Tipo Servizio</label>
            <select 
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
              <option value="domain">Dominio</option>
              <option value="hosting">Hosting / Server</option>
              <option value="tool">Tool / SaaS</option>
              <option value="other">Altro</option>
            </select>
          </div>

          <Input 
            label="Costo Annuale (€)" 
            type="number" 
            placeholder="es. 50" 
            value={cost}
            onChange={e => setCost(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Azienda Cliente</label>
            <select 
              value={companyId}
              onChange={e => {
                setCompanyId(e.target.value)
                setProjectId('')
              }}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
              <option value="">-- Nessuna Azienda --</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Progetto Collegato</label>
            <select 
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
              <option value="">-- Nessun Progetto --</option>
              {availableProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input 
            label="Data di Scadenza / Rinnovo" 
            type="date" 
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            required 
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Stato</label>
            <select 
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
              <option value="active">Attivo</option>
              <option value="expired">Scaduto</option>
              <option value="cancelled">Annullato</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Annulla</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Servizio'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
