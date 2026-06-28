'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Edit2, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { CompanyModal } from './CompanyModal'
import { toast } from 'sonner'

export function CompaniesTableClient() {
  const [companies, setCompanies] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('companies')
      .select('*, contacts(id, first_name, last_name)')
      .order('created_at', { ascending: false })
    
    if (data) setCompanies(data)
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare l'azienda "${name}"? I deal associati non verranno persi, ma sganciati.`)) {
      const { error } = await supabase.from('companies').delete().eq('id', id)
      if (error) {
        toast.error('Errore durante l\'eliminazione')
      } else {
        toast.success('Azienda eliminata')
        fetchCompanies()
      }
    }
  }

  const handleEdit = (company: any) => {
    setSelectedCompany(company)
    setIsModalOpen(true)
  }

  const handleNew = () => {
    setSelectedCompany(null)
    setIsModalOpen(true)
  }

  const columns = [
    { key: 'name', title: 'Nome Azienda', render: (c: any) => <strong>{c.name}</strong> },
    { key: 'vat_number', title: 'Partita IVA', render: (c: any) => c.vat_number || '-' },
    { key: 'address', title: 'Indirizzo', render: (c: any) => c.address || '-' },
    { 
      key: 'contacts', 
      title: 'Contatti', 
      render: (c: any) => c.contacts && c.contacts.length > 0 
        ? <div style={{ fontSize: '0.85rem' }}>{c.contacts.map((contact: any) => `${contact.first_name} ${contact.last_name}`).join(', ')}</div>
        : <span style={{color: 'var(--color-text-muted)'}}>-</span> 
    },
    { key: 'created_at', title: 'Creato il', render: (c: any) => new Date(c.created_at).toLocaleDateString('it-IT') },
    { 
      key: 'actions', 
      title: 'Azioni', 
      render: (c: any) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => handleEdit(c)}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDelete(c.id, c.name)}
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Anagrafica Aziende</h2>
        <Button variant="primary" onClick={handleNew}>+ Nuova Azienda</Button>
      </div>

      <CompanyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchCompanies}
        company={selectedCompany}
      />

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Caricamento...</div>
      ) : (
        <Table columns={columns} data={companies} />
      )}
    </>
  )
}
