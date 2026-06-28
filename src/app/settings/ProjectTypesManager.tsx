'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectType {
  id: string
  name: string
  sort_order: number
}

export function ProjectTypesManager({ onTypesChanged }: { onTypesChanged?: () => void }) {
  const [types, setTypes] = useState<ProjectType[]>([])
  const [loading, setLoading] = useState(true)
  const [newTypeName, setNewTypeName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) {
      toast.error('Errore nel caricamento dei tipi di progetto')
    } else if (data) {
      setTypes(data)
      if (onTypesChanged) onTypesChanged()
    }
    setLoading(false)
  }

  const handleAddType = async () => {
    if (!newTypeName.trim()) return

    const newId = newTypeName.trim().toLowerCase().replace(/\s+/g, '-')
    const nextOrder = types.length > 0 ? Math.max(...types.map(p => p.sort_order)) + 1 : 1

    const { error } = await supabase
      .from('project_types')
      .insert([{ id: newId, name: newTypeName.trim(), sort_order: nextOrder }])

    if (error) {
      console.error('Supabase insert error:', error)
      if (error.code === '23505') {
        toast.error('Esiste già un tipo di progetto con questo nome/id')
      } else {
        toast.error(`Errore: ${error.message || 'impossibile creare il tipo di progetto'}`)
      }
    } else {
      toast.success('Tipo di Progetto aggiunto con successo')
      setNewTypeName('')
      fetchTypes()
    }
  }

  const handleDeleteType = async (typeId: string) => {
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', typeId)

    if (countError) {
      toast.error('Errore di validazione')
      return
    }

    if (count && count > 0) {
      toast.error(`Impossibile eliminare: ci sono ${count} progetti associati a questo tipo.`)
      return
    }

    const { error } = await supabase
      .from('project_types')
      .delete()
      .eq('id', typeId)

    if (error) {
      toast.error("Errore durante l'eliminazione")
    } else {
      toast.success('Tipo di Progetto eliminato')
      fetchTypes()
    }
  }

  const handleUpdateName = async (typeId: string, newName: string) => {
    const { error } = await supabase
      .from('project_types')
      .update({ name: newName })
      .eq('id', typeId)

    if (error) {
      toast.error("Errore durante l'aggiornamento del nome")
    } else {
      toast.success('Nome aggiornato')
      fetchTypes()
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === types.length - 1) return

    const newTypes = [...types]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newTypes[index]
    newTypes[index] = newTypes[swapIndex]
    newTypes[swapIndex] = temp

    const updates = newTypes.map((p, i) => ({
      id: p.id,
      name: p.name,
      sort_order: i + 1
    }))

    setTypes(updates)

    const promises = updates.map(update => 
      supabase.from('project_types').update({ sort_order: update.sort_order }).eq('id', update.id)
    )

    await Promise.all(promises)
    toast.success('Ordine salvato')
  }

  if (loading) return <div>Caricamento in corso...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {types.map((type, index) => (
          <div key={type.id} style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center', 
            background: 'var(--color-surface-solid)',
            padding: '0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-base)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button 
                disabled={index === 0}
                onClick={() => handleMove(index, 'up')}
                style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: 'var(--color-text-muted)' }}
              >
                <ArrowUp size={16} />
              </button>
              <button 
                disabled={index === types.length - 1}
                onClick={() => handleMove(index, 'down')}
                style={{ background: 'none', border: 'none', cursor: index === types.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--color-text-muted)' }}
              >
                <ArrowDown size={16} />
              </button>
            </div>
            
            <div style={{ flex: 1 }}>
              <Input 
                value={type.name} 
                onChange={(e) => {
                  const newTypes = [...types]
                  newTypes[index].name = e.target.value
                  setTypes(newTypes)
                }}
                onBlur={(e) => handleUpdateName(type.id, e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', width: '100px' }}>
              ID: {type.id}
            </div>
            <Button variant="danger" onClick={() => handleDeleteType(type.id)} title="Elimina tipo di progetto">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        {types.length === 0 && !loading && (
          <div style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', fontStyle: 'italic' }}>
            Nessun tipo di progetto definito. Creane uno usando il modulo qui sotto! 👇
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-base)' }}>
        <div style={{ flex: 1 }}>
          <Input 
            label="Nuovo Tipo di Progetto" 
            placeholder="es. Sviluppo Web" 
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
          />
        </div>
        <Button variant="primary" onClick={handleAddType}>
          <Plus size={20} /> Aggiungi
        </Button>
      </div>
    </div>
  )
}
