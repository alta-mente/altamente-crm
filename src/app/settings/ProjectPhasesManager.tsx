'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectPhase {
  id: string
  title: string
  sort_order: number
  project_type_id: string
}

interface ProjectType {
  id: string
  name: string
}

export function ProjectPhasesManager() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [activeType, setActiveType] = useState<string>('')
  const [phases, setPhases] = useState<ProjectPhase[]>([])
  const [loading, setLoading] = useState(true)
  const [newPhaseTitle, setNewPhaseTitle] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchTypes()
  }, [])

  useEffect(() => {
    if (activeType) {
      fetchPhases()
    }
  }, [activeType])

  const fetchTypes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('project_types')
      .select('*')
      .order('sort_order', { ascending: true })
      
    if (error) {
      toast.error('Errore nel caricamento dei tipi di progetto')
    } else if (data && data.length > 0) {
      setProjectTypes(data)
      setActiveType(data[0].id)
    } else {
      setLoading(false)
    }
  }

  const fetchPhases = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('project_phases')
      .select('*')
      .eq('project_type_id', activeType)
      .order('sort_order', { ascending: true })
    
    if (error) {
      toast.error('Errore nel caricamento delle fasi dei progetti')
    } else if (data) {
      setPhases(data)
    }
    setLoading(false)
  }

  const handleAddPhase = async () => {
    if (!newPhaseTitle.trim() || !activeType) return

    const newId = newPhaseTitle.trim().toLowerCase().replace(/\s+/g, '-') + '-' + activeType
    const nextOrder = phases.length > 0 ? Math.max(...phases.map(p => p.sort_order)) + 1 : 1

    const { error } = await supabase
      .from('project_phases')
      .insert([{ id: newId, title: newPhaseTitle.trim(), sort_order: nextOrder, project_type_id: activeType }])

    if (error) {
      if (error.code === '23505') {
        toast.error('Esiste già una fase con questo nome/id per questo tipo')
      } else {
        toast.error('Errore durante la creazione della fase')
      }
    } else {
      toast.success('Fase aggiunta con successo')
      setNewPhaseTitle('')
      fetchPhases()
    }
  }

  const handleDeletePhase = async (phaseId: string) => {
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('phase_id', phaseId)

    if (countError) {
      toast.error('Errore di validazione')
      return
    }

    if (count && count > 0) {
      toast.error(`Impossibile eliminare: ci sono ${count} progetti in questa fase.`)
      return
    }

    const { error } = await supabase
      .from('project_phases')
      .delete()
      .eq('id', phaseId)

    if (error) {
      toast.error("Errore durante l'eliminazione")
    } else {
      toast.success('Fase eliminata')
      fetchPhases()
    }
  }

  const handleUpdateTitle = async (phaseId: string, newTitle: string) => {
    const { error } = await supabase
      .from('project_phases')
      .update({ title: newTitle })
      .eq('id', phaseId)

    if (error) {
      toast.error("Errore durante l'aggiornamento del titolo")
    } else {
      toast.success('Titolo aggiornato')
      fetchPhases()
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === phases.length - 1) return

    const newPhases = [...phases]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newPhases[index]
    newPhases[index] = newPhases[swapIndex]
    newPhases[swapIndex] = temp

    const updates = newPhases.map((p, i) => ({
      id: p.id,
      title: p.title,
      sort_order: i + 1
    }))

    setPhases(updates as any)

    const promises = updates.map(update => 
      supabase.from('project_phases').update({ sort_order: update.sort_order }).eq('id', update.id)
    )

    await Promise.all(promises)
    toast.success('Ordine salvato')
  }

  if (loading && projectTypes.length === 0) return <div>Caricamento in corso...</div>

  if (!loading && projectTypes.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255, 150, 0, 0.1)', color: '#b26b00', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,150,0,0.3)' }}>
        Devi prima creare un <strong>Tipo di Progetto</strong> (nel riquadro qui sopra 👆) per poterne gestire le fasi.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Tabs per Tipo Progetto */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface-solid)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
        {projectTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeType === type.id ? 'var(--color-primary)' : 'transparent',
              color: activeType === type.id ? 'white' : 'var(--color-text-muted)',
              fontWeight: activeType === type.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {type.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {phases.map((phase, index) => (
          <div key={phase.id} style={{ 
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
                disabled={index === phases.length - 1}
                onClick={() => handleMove(index, 'down')}
                style={{ background: 'none', border: 'none', cursor: index === phases.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--color-text-muted)' }}
              >
                <ArrowDown size={16} />
              </button>
            </div>
            
            <div style={{ flex: 1 }}>
              <Input 
                value={phase.title} 
                onChange={(e) => {
                  const newPhases = [...phases]
                  newPhases[index].title = e.target.value
                  setPhases(newPhases)
                }}
                onBlur={(e) => handleUpdateTitle(phase.id, e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', width: '100px' }}>
              ID: {phase.id}
            </div>
            <Button variant="danger" onClick={() => handleDeletePhase(phase.id)} title="Elimina fase">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        {phases.length === 0 && !loading && (
          <div style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
            Nessuna fase definita per questo tipo di progetto.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-base)' }}>
        <div style={{ flex: 1 }}>
          <Input 
            label="Nuova Fase" 
            placeholder="es. Da Fatturare" 
            value={newPhaseTitle}
            onChange={(e) => setNewPhaseTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
          />
        </div>
        <Button variant="primary" onClick={handleAddPhase}>
          <Plus size={20} /> Aggiungi
        </Button>
      </div>
    </div>
  )
}
