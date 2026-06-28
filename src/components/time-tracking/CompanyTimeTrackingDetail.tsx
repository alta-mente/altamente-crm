'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Download, FileText, Send, Archive, Trash2, Edit2, Undo2 } from 'lucide-react'
import { addCompanyHours, editCompanyHours, deleteCompanyHours, archiveCompanyHours, unarchiveCompanyHourRow, generateReportToken } from '@/app/actions/time-tracking'

interface Company {
  id: string
  name: string
  report_token?: string
  hourly_rate?: number
}

interface CompanyHour {
  id: string
  company_id: string
  date: string
  description: string
  minutes: number
  billed: boolean
  batch_id: string
}

interface Props {
  company: Company
  initialHours: CompanyHour[]
}

export function CompanyTimeTrackingDetail({ company, initialHours }: Props) {
  const router = useRouter()
  const [showArchived, setShowArchived] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    hoursStr: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  const activeHours = initialHours.filter(h => !h.billed)
  const archivedHours = initialHours.filter(h => h.billed)
  const displayHours = showArchived ? initialHours : activeHours

  const totalActiveMinutes = activeHours.reduce((acc, curr) => acc + curr.minutes, 0)
  const rate = company.hourly_rate || 0

  const formatTime = (minutes: number) => {
    const h = Math.floor(Math.abs(minutes) / 60)
    const m = Math.abs(minutes) % 60
    return `${minutes < 0 ? '-' : ''}${h}h ${m.toString().padStart(2, '0')}m`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const minutes = Math.round(parseFloat(formData.hoursStr.replace(',', '.')) * 60)
      if (isNaN(minutes)) {
        alert('Inserisci un numero di ore valido')
        return
      }

      if (isEditing) {
        await editCompanyHours(editId, {
          company_id: company.id,
          date: formData.date,
          description: formData.description,
          minutes
        })
      } else {
        await addCompanyHours({
          company_id: company.id,
          date: formData.date,
          description: formData.description,
          minutes
        })
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        hoursStr: ''
      })
      setIsEditing(false)
      setEditId('')
      
    } catch (err) {
      alert('Errore durante il salvataggio')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: CompanyHour) => {
    setIsEditing(true)
    setEditId(item.id)
    setFormData({
      date: item.date,
      description: item.description,
      hoursStr: (item.minutes / 60).toString().replace('.', ',')
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questa attività?')) return
    try {
      await deleteCompanyHours(id, company.id)
    } catch (err) {
      alert('Errore durante l\'eliminazione')
    }
  }

  const handleArchive = async () => {
    if (!confirm('Archiviare tutte le ore aperte come fatturate?')) return
    setIsArchiving(true)
    try {
      await archiveCompanyHours(company.id)
    } catch (err) {
      alert('Errore durante l\'archiviazione')
    } finally {
      setIsArchiving(false)
    }
  }

  const handleUnarchive = async (id: string) => {
    if (!confirm('Riportare questa singola riga tra le ore aperte?')) return
    try {
      await unarchiveCompanyHourRow(id, company.id)
    } catch (err) {
      alert('Errore durante de-archiviazione')
    }
  }

  const handleGenerateReportUrl = async () => {
    try {
      const token = await generateReportToken(company.id)
      const url = `${window.location.origin}/report/${token}`
      window.open(url, '_blank')
    } catch (err) {
      alert('Errore durante la generazione del link report')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/time-tracking')} className="gap-2">
          <ArrowLeft size={16} /> Torna alla lista
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b border-gray-100 pb-4">
          <CardTitle className="text-xl">{company.name}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateReportUrl} className="gap-2" title="Genera Link Report Pubblico">
              <FileText size={16} /> Report
            </Button>
            <Link href={`/api/export-hours?cid=${company.id}`}>
              <Button variant="outline" className="gap-2" title="Scarica CSV delle ore non archiviate">
                <Download size={16} /> CSV
              </Button>
            </Link>
            {activeHours.length > 0 && (
              <Button variant="destructive" onClick={handleArchive} disabled={isArchiving} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                <Archive size={16} /> Archivia
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className={`p-4 rounded-lg border mb-8 transition-colors ${isEditing ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-40">
                <label className="block text-xs font-semibold text-gray-600 mb-1">DATA</label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">DESCRIZIONE ATTIVITÀ</label>
                <Input type="text" placeholder="Es. Aggiornamento plugin..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div className="w-24">
                <label className="block text-xs font-semibold text-gray-600 mb-1">ORE</label>
                <Input type="text" placeholder="1,5" value={formData.hoursStr} onChange={e => setFormData({...formData, hoursStr: e.target.value})} required className="text-center" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>{isEditing ? 'Aggiorna' : 'Salva'}</Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditId(''); setFormData({ date: new Date().toISOString().split('T')[0], description: '', hoursStr: '' })}}>
                    Annulla
                  </Button>
                )}
              </div>
            </div>
          </form>

          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h4 className="font-semibold text-gray-800">📝 Storico Attività</h4>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} className="rounded text-blue-600" />
              Mostra anche archiviati
            </label>
          </div>

          <table className="w-full text-sm">
            <tbody>
              {displayHours.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">Nessuna attività trovata.</td>
                </tr>
              )}
              {displayHours.map(row => {
                const isArchived = row.billed
                
                let costDisplay = null
                if (isArchived && rate > 0) {
                  const cost = (row.minutes / 60) * rate
                  costDisplay = <div className="text-xs text-green-700 font-medium mt-0.5">€ {cost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                }

                return (
                  <tr key={row.id} className={`border-b border-gray-100 ${isArchived ? 'text-gray-400 bg-gray-50/50' : 'text-gray-800'}`}>
                    <td className="py-3 px-2 w-20">
                      {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="py-3 px-2">
                      {isArchived && (
                        <span 
                          onClick={() => handleUnarchive(row.id)}
                          className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded mr-2 cursor-pointer hover:bg-gray-300"
                          title="Clicca per de-archiviare SOLO questa riga"
                        >
                          📦 {row.batch_id ? new Date(row.batch_id.slice(0,4) + '-' + row.batch_id.slice(4,6) + '-' + row.batch_id.slice(6,8)).toLocaleDateString('it-IT') : 'Pregresso'}
                        </span>
                      )}
                      {row.description}
                    </td>
                    <td className="py-3 px-2 text-right w-32 font-mono">
                      {formatTime(row.minutes)}
                      {costDisplay}
                    </td>
                    <td className="py-3 px-2 text-right w-24">
                      {!isArchived && (
                        <>
                          <button onClick={() => handleEdit(row)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Modifica">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Elimina">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!showArchived && totalActiveMinutes > 0 && (
                <tr className="bg-green-50 border-t-2 border-green-200 text-green-800 font-semibold">
                  <td colSpan={2} className="py-3 px-4 text-right">TOTALE SELEZIONATO:</td>
                  <td className="py-3 px-2 text-right font-mono text-base">{formatTime(totalActiveMinutes)}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
