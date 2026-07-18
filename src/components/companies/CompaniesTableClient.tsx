'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Edit2, Trash2, Link, ExternalLink, Search } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { CompanyModal } from './CompanyModal'
import { MergeCompanyModal } from './MergeCompanyModal'
import { toast } from 'sonner'

export function CompaniesTableClient() {
  const [companies, setCompanies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
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

  const handleMerge = (company: any) => {
    setSelectedCompany(company)
    setIsMergeModalOpen(true)
  }

  const handleNew = () => {
    setSelectedCompany(null)
    setIsModalOpen(true)
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getFilteredAndSortedCompanies = () => {
    let result = [...companies]

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      result = result.filter(c => 
        c.name?.toLowerCase().includes(lowerSearch) ||
        c.vat_number?.toLowerCase().includes(lowerSearch) ||
        c.contacts?.some((contact: any) => 
          contact.first_name?.toLowerCase().includes(lowerSearch) || 
          contact.last_name?.toLowerCase().includes(lowerSearch)
        )
      )
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }

  const processedCompanies = getFilteredAndSortedCompanies()

  const columns = [
    { key: 'name', title: 'Nome Azienda', sortable: true, render: (c: any) => <strong>{c.name}</strong> },
    { key: 'vat_number', title: 'Partita IVA', sortable: true, render: (c: any) => c.vat_number || '-' },
    { key: 'address', title: 'Indirizzo', render: (c: any) => c.address || '-' },
    { 
      key: 'contacts', 
      title: 'Contatti', 
      render: (c: any) => c.contacts && c.contacts.length > 0 
        ? <div style={{ fontSize: '0.85rem' }}>{c.contacts.map((contact: any) => `${contact.first_name} ${contact.last_name}`).join(', ')}</div>
        : <span style={{color: 'var(--color-text-muted)'}}>-</span> 
    },
    { key: 'created_at', title: 'Creato il', sortable: true, render: (c: any) => new Date(c.created_at).toLocaleDateString('it-IT') },
    { 
      key: 'actions', 
      title: 'Azioni', 
      render: (c: any) => (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a 
            title="Apri Dashboard Cliente"
            href={`/portal/${c.id}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ExternalLink size={16} />
          </a>
          <button 
            title="Modifica Azienda"
            onClick={() => handleEdit(c)}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
          >
            <Edit2 size={16} />
          </button>
          <button 
            title="Unisci ad un'altra Azienda"
            onClick={() => handleMerge(c)}
            style={{ background: 'none', border: 'none', color: 'var(--color-warning)', cursor: 'pointer' }}
          >
            <Link size={16} />
          </button>
          <button 
            title="Elimina"
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
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>Anagrafica Aziende</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <Input 
              placeholder="Cerca azienda, P.IVA o contatto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '35px', width: '100%' }}
            />
          </div>
          <Button variant="primary" onClick={handleNew} style={{ whiteSpace: 'nowrap' }}>+ Nuova Azienda</Button>
        </div>
      </div>

      <CompanyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchCompanies}
        company={selectedCompany}
      />

      <MergeCompanyModal 
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        onSaved={fetchCompanies}
        sourceCompany={selectedCompany}
        allCompanies={companies}
      />

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Caricamento...</div>
      ) : (
        <Table columns={columns} data={processedCompanies} sortConfig={sortConfig} onSort={handleSort} />
      )}
    </>
  )
}
