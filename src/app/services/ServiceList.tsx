'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Plus, Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react'
import styles from './ServiceList.module.css'
import { ServiceModal } from './ServiceModal'
import { toast } from 'sonner'

export function ServiceList() {
  const [services, setServices] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        companies ( id, name ),
        projects ( id, title )
      `)
      .order('expiry_date', { ascending: true })

    if (data) {
      setServices(data)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo servizio?')) {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) {
        toast.error('Errore durante l\'eliminazione')
      } else {
        toast.success('Servizio eliminato')
        fetchServices()
      }
    }
  }

  const getStatusInfo = (expiryDate: string, status: string) => {
    if (status !== 'active') return { label: status, class: styles.badgeExpired }
    
    const today = new Date()
    const exp = new Date(expiryDate)
    const diffTime = exp.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: 'Scaduto', class: styles.badgeExpired, isExpired: true }
    if (diffDays <= 30) return { label: `Scade tra ${diffDays} gg`, class: styles.badgeExpiring, isExpiring: true }
    
    return { label: 'Attivo', class: styles.badgeActive }
  }

  const formatServiceType = (type: string) => {
    switch (type) {
      case 'domain': return 'Dominio'
      case 'hosting': return 'Hosting / Server'
      case 'tool': return 'Tool / SaaS'
      case 'other': return 'Altro'
      default: return type
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Scadenze & Servizi</h1>
        <Button variant="primary" onClick={() => { setSelectedService(null); setIsModalOpen(true); }}>
          <Plus size={16} /> Aggiungi Servizio
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Servizio</th>
              <th>Azienda / Progetto</th>
              <th>Costo</th>
              <th>Scadenza</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  Nessun servizio registrato.
                </td>
              </tr>
            ) : (
              services.map(service => {
                const statusInfo = getStatusInfo(service.expiry_date, service.status)
                
                return (
                  <tr 
                    key={service.id} 
                    className={
                      statusInfo.isExpired ? styles.rowExpired : 
                      statusInfo.isExpiring ? styles.rowExpiring : ''
                    }
                  >
                    <td>
                      <div style={{ fontWeight: 600 }}>{service.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatServiceType(service.service_type)}</div>
                    </td>
                    <td>
                      <div>{service.companies?.name || '-'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{service.projects?.title || ''}</div>
                    </td>
                    <td>€{Number(service.cost).toLocaleString('it-IT')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: statusInfo.isExpiring || statusInfo.isExpired ? 'var(--color-danger)' : 'inherit' }}>
                        <Calendar size={14} />
                        {new Date(service.expiry_date).toLocaleDateString('it-IT')}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${statusInfo.class}`}>
                        {statusInfo.isExpiring && <AlertCircle size={12} style={{ marginRight: '4px' }} />}
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => { setSelectedService(service); setIsModalOpen(true); }}>
                          <Edit2 size={16} />
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(service.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ServiceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          service={selectedService}
          onSaved={fetchServices}
        />
      )}
    </div>
  )
}
