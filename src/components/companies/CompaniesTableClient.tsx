'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Edit2, Trash2, Link, ExternalLink, Search, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
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
      .select('*, contacts(id, first_name, last_name), projects(id, phase_id, always_send_report, company_hours(id, billed), invoices(id, status))')
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
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'status') {
          const getStatusVal = (c: any) => {
            if (!c.projects || c.projects.length === 0) return 3; // Prospect
            const isArchived = (pid: string) => pid && ['won', 'lost', 'archivia', 'archiv', 'completat', 'chius'].some(t => pid.toLowerCase().includes(t));
            const hasActive = c.projects.some((p: any) => !isArchived(p.phase_id));
            return hasActive ? 1 : 2; // 1 = Attivo, 2 = Storico
          };
          valA = getStatusVal(a);
          valB = getStatusVal(b);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      })
    }

    return result
  }

  const processedCompanies = getFilteredAndSortedCompanies()

  const columns = [
    { key: 'name', title: 'Nome Azienda', sortable: true, render: (c: any) => <strong>{c.name}</strong> },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (c: any) => {
        const isArchived = (phaseId: string) => {
          if (!phaseId) return false;
          const lower = phaseId.toLowerCase();
          return ['won', 'lost', 'archivia', 'archiv', 'completat', 'chius'].some(t => lower.includes(t));
        };
        
        if (!c.projects || c.projects.length === 0) {
          return <span style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>🌱 Prospect</span>;
        }
        
        const hasActive = c.projects.some((p: any) => !isArchived(p.phase_id));
        if (hasActive) {
          return <span style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>🚀 Attivo</span>;
        } else {
          return <span style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(156, 163, 175, 0.1)', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>🗄️ Storico</span>;
        }
      }
    },
    { key: 'vat_number', title: 'Partita IVA', sortable: true, render: (c: any) => c.vat_number || '-' },
    { key: 'address', title: 'Indirizzo', render: (c: any) => c.address || '-' },
    { 
      key: 'contacts', 
      title: 'Contatti', 
      render: (c: any) => c.contacts && c.contacts.length > 0 
        ? <div style={{ fontSize: '0.85rem' }}>{c.contacts.map((contact: any) => `${contact.first_name} ${contact.last_name}`).join(', ')}</div>
        : <span style={{color: 'var(--color-text-muted)'}}>-</span> 
    },
    {
      key: 'report',
      title: 'Report Mensile',
      render: (c: any) => {
        const shouldReceiveReport = c.projects?.some((p: any) => {
          if (p.always_send_report) return true;
          const hasUnbilledHours = p.company_hours?.some((h: any) => !h.billed);
          const hasPendingInvoices = p.invoices?.some((i: any) => i.status === 'pending');
          return hasUnbilledHours || hasPendingInvoices;
        });

        const hasEmail = !!c.contact_email;

        if (shouldReceiveReport) {
          if (hasEmail) {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 500 }}>
                  <CheckCircle2 size={14} /> Riceve
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.contact_email}</span>
              </div>
            );
          } else {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 500 }}>
                  <AlertCircle size={14} /> Manca Email!
                </span>
              </div>
            );
          }
        } else {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                -
              </span>
              {hasEmail && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>{c.contact_email}</span>}
            </div>
          );
        }
      }
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
