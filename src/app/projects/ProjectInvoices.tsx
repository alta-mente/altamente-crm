'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle2, Clock } from 'lucide-react'

export interface Invoice {
  id: string
  project_id: string
  amount: number
  status: 'pending' | 'paid' | 'late'
  issue_date: string
  paid_date: string | null
  notes: string | null
  created_at: string
}
import type { Project } from './ProjectBoard'

export function ProjectInvoices({ project }: { project: Project }) {
  const projectId = project.id
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  
  const [amount, setAmount] = useState<number | ''>('')
  const [status, setStatus] = useState<'pending' | 'paid' | 'late'>('pending')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [paidDate, setPaidDate] = useState('')
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchInvoices()
  }, [projectId])

  const fetchInvoices = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('project_id', projectId)
      .order('issue_date', { ascending: false })
      
    if (!error && data) {
      setInvoices(data)
    }
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!amount) {
      toast.error('Inserisci un importo valido')
      return
    }

    const { data, error } = await supabase.from('invoices').insert([{
      project_id: projectId,
      amount: Number(amount),
      status,
      issue_date: issueDate,
      paid_date: status === 'paid' ? (paidDate || issueDate) : null,
      notes: notes || null
    }]).select()

    if (error) {
      console.error(error)
      toast.error(`Errore: ${error.message}`)
    } else if (data) {
      toast.success('Incasso/Fattura registrato')
      setInvoices([data[0], ...invoices])
      setIsAdding(false)
      // Reset form
      setAmount('')
      setStatus('pending')
      setNotes('')
      setPaidDate('')
    }
  }

  const startEdit = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id)
    setAmount(invoice.amount)
    setStatus(invoice.status)
    setIssueDate(invoice.issue_date)
    setPaidDate(invoice.paid_date || '')
    setNotes(invoice.notes || '')
    setIsAdding(false) // chiudi pannello add se aperto
  }

  const handleEditSave = async () => {
    if (!editingInvoiceId || !amount) {
      toast.error('Inserisci un importo valido')
      return
    }

    const { error } = await supabase.from('invoices').update({
      amount: Number(amount),
      status,
      issue_date: issueDate,
      paid_date: status === 'paid' ? (paidDate || issueDate) : null,
      notes: notes || null
    }).eq('id', editingInvoiceId)

    if (error) {
      console.error(error)
      toast.error(`Errore: ${error.message}`)
    } else {
      toast.success('Aggiornato con successo')
      setEditingInvoiceId(null)
      fetchInvoices()
      // Reset form
      setAmount('')
      setStatus('pending')
      setNotes('')
      setPaidDate('')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa registrazione?')) {
      const { error } = await supabase.from('invoices').delete().eq('id', id)
      if (error) {
        toast.error('Errore durante l\'eliminazione')
      } else {
        setInvoices(invoices.filter(i => i.id !== id))
        toast.success('Eliminato')
      }
    }
  }

  const handleToggleStatus = async (invoice: Invoice) => {
    const newStatus = invoice.status === 'paid' ? 'pending' : 'paid'
    const newPaidDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
    
    const { error } = await supabase.from('invoices').update({
      status: newStatus,
      paid_date: newPaidDate
    }).eq('id', invoice.id)

    if (error) {
      toast.error('Errore aggiornamento stato')
    } else {
      fetchInvoices()
    }
  }

  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

  if (loading) {
    return <div style={{ opacity: 0.5 }}>Caricamento...</div>
  }

  const totalAmount = project.billing_amount || 0
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const discountAmount = invoices.filter(i => i.status === 'discount').reduce((sum, i) => sum + i.amount, 0)
  const remainingAmount = totalAmount - paidAmount - discountAmount

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Financial Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Valore Progetto</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatter.format(totalAmount)}</span>
        </div>
        <div style={{ background: 'rgba(0, 255, 0, 0.05)', border: '1px solid rgba(0, 255, 0, 0.1)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>Incassato</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-success)' }}>{formatter.format(paidAmount)}</span>
        </div>
        <div style={{ background: 'rgba(255, 150, 0, 0.05)', border: '1px solid rgba(255, 150, 0, 0.1)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-warning)' }}>Rimanenza</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-warning)' }}>{formatter.format(remainingAmount)}</span>
        </div>
        {discountAmount > 0 && (
          <div style={{ background: 'rgba(128, 128, 128, 0.05)', border: '1px solid rgba(128, 128, 128, 0.1)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Abbuoni</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{formatter.format(discountAmount)}</span>
          </div>
        )}
      </div>
      
      {/* Header and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Registro Incassi & Fatture</h3>
        {!isAdding && !editingInvoiceId && (
          <Button variant="secondary" onClick={() => {
            setIsAdding(true)
            setAmount('')
            setStatus('pending')
            setIssueDate(new Date().toISOString().split('T')[0])
            setPaidDate('')
            setNotes('')
          }}>
            <Plus size={16} /> Nuovo Incasso
          </Button>
        )}
      </div>

      {/* Form Condiviso (Aggiunta / Modifica) */}
      {(isAdding || editingInvoiceId) && (
        <div style={{ background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-border)' }}>
          <h4 style={{ margin: 0, fontSize: '1rem' }}>{editingInvoiceId ? 'Modifica Registrazione' : 'Nuova Registrazione'}</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Importo (€)</label>
              <input 
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                placeholder="0.00"
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',  }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Stato</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',  }}
              >
                <option value="pending">Da Incassare / Fatturata</option>
                <option value="paid">Pagato / Incassato</option>
                <option value="late">In Ritardo</option>
                <option value="discount">Abbuono / Sconto</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Data Emissione/Registrazione</label>
              <input 
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',  }}
              />
            </div>
            {status === 'paid' && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Data Incasso Reale</label>
                <input 
                  type="date"
                  value={paidDate}
                  onChange={e => setPaidDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',  }}
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Note (Opzionale)</label>
            <input 
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="es. Acconto 30% o Saldo finale"
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',  }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => {
              setIsAdding(false)
              setEditingInvoiceId(null)
            }}>Annulla</Button>
            <Button variant="primary" onClick={editingInvoiceId ? handleEditSave : handleAdd}>
              {editingInvoiceId ? 'Salva Modifiche' : 'Salva Registrazione'}
            </Button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {invoices.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            Nessun incasso registrato per questo progetto.
          </div>
        ) : (
          invoices.map(invoice => (
            <div key={invoice.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={() => handleToggleStatus(invoice)}
                  style={{ 
                    background: invoice.status === 'paid' ? 'rgba(0,255,0,0.1)' : invoice.status === 'discount' ? 'rgba(128,128,128,0.1)' : 'var(--color-bg-primary)', 
                    border: `1px solid ${invoice.status === 'paid' ? 'var(--color-success)' : invoice.status === 'discount' ? 'var(--color-text-muted)' : 'var(--color-border)'}`, 
                    cursor: 'pointer', 
                    color: invoice.status === 'paid' ? 'var(--color-success)' : invoice.status === 'discount' ? 'var(--color-text-muted)' : 'var(--color-text)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}
                  title="Clicca per segnare come pagato/non pagato"
                >
                  {invoice.status === 'paid' ? (
                    <><CheckCircle2 size={16} /> Pagato</>
                  ) : invoice.status === 'discount' ? (
                    <><CheckCircle2 size={16} color="var(--color-text-muted)" /> Abbuono</>
                  ) : (
                    <><Clock size={16} color="var(--color-text-muted)" /> Segna Pagato</>
                  )}
                </button>
                
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatter.format(invoice.amount)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.5rem' }}>
                    <span>{new Date(invoice.issue_date).toLocaleDateString('it-IT')}</span>
                    {invoice.notes && <span>• {invoice.notes}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {invoice.status === 'paid' && invoice.paid_date && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(0,255,0,0.1)', color: 'var(--color-success)', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>
                    Incassato il {new Date(invoice.paid_date).toLocaleDateString('it-IT')}
                  </span>
                )}
                <button 
                  onClick={() => startEdit(invoice)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s', padding: '0.25rem' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                  title="Modifica"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                </button>
                <button 
                  onClick={() => handleDelete(invoice.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s', padding: '0.25rem' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                  title="Elimina"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  )
}
