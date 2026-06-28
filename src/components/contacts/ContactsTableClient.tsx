'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Edit2, Trash2, Building, Mail, Phone } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ContactModal } from './ContactModal'
import { toast } from 'sonner'

export function ContactsTableClient() {
  const [contacts, setContacts] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchContacts = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('contacts')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })
    
    if (data) setContacts(data)
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare il contatto "${name}"? I deal associati non verranno persi, ma sganciati.`)) {
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) {
        toast.error('Errore durante l\'eliminazione')
      } else {
        toast.success('Contatto eliminato')
        fetchContacts()
      }
    }
  }

  const handleEdit = (contact: any) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleNew = () => {
    setSelectedContact(null)
    setIsModalOpen(true)
  }

  const columns = [
    { key: 'name', title: 'Nome', render: (c: any) => <strong>{c.first_name} {c.last_name}</strong> },
    { key: 'company', title: 'Azienda', render: (c: any) => c.companies ? <span style={{display: 'flex', gap: '4px', alignItems: 'center'}}><Building size={14}/> {c.companies.name}</span> : '-' },
    { key: 'contact_info', title: 'Recapiti', render: (c: any) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
        {c.email && <span style={{display: 'flex', gap: '4px', alignItems: 'center'}}><Mail size={12}/> {c.email}</span>}
        {c.phone && <span style={{display: 'flex', gap: '4px', alignItems: 'center'}}><Phone size={12}/> {c.phone}</span>}
      </div>
    )},
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
            onClick={() => handleDelete(c.id, `${c.first_name} ${c.last_name || ''}`)}
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
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Rubrica Contatti</h2>
        <Button variant="primary" onClick={handleNew}>+ Nuovo Contatto</Button>
      </div>

      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchContacts}
        contact={selectedContact}
      />

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Caricamento...</div>
      ) : (
        <Table columns={columns} data={contacts} />
      )}
    </>
  )
}
