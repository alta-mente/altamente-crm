'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Building, BookOpen, Clock, Minimize2, Maximize2, ZoomIn, ZoomOut, Briefcase, User } from 'lucide-react'
import clsx from 'clsx'
import { toast } from 'sonner'
import styles from './Board.module.css'
import { QuickAddDealModal } from './QuickAddDealModal'
import { DealDrawer } from './DealDrawer'

import { createClient } from '@/utils/supabase/client'

// Data Types based on DB
type Source = 'corsidia' | 'web' | 'piuitalia'

interface Deal {
  id: string
  title: string
  company_id: string | null
  contact_id: string | null
  value: number
  source: Source
  phase_id: string
  created_at: string
  projects?: { id: string }[]
  companies?: { name: string } | null
  contacts?: { first_name: string; last_name: string } | null
}

interface Phase {
  id: string
  title: string
  sort_order: number
}

interface BoardProps {
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
}

export function Board({ isModalOpen, setIsModalOpen }: BoardProps) {
  const [isBrowser, setIsBrowser] = useState(false)
  const [deals, setDeals] = useState<Deal[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({})
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDown = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const supabase = createClient()

  useEffect(() => {
    setIsBrowser(true)
    fetchData()

    // Load collapsed states
    const savedCollapsed = localStorage.getItem('altamente_collapsed_phases')
    if (savedCollapsed) {
      try {
        setCollapsedPhases(JSON.parse(savedCollapsed))
      } catch (e) {
        console.error('Error parsing collapsed phases', e)
      }
    }
    // Load zoom level
    const savedZoom = localStorage.getItem('altamente_board_zoom')
    if (savedZoom) {
      setZoomLevel(parseFloat(savedZoom))
    }
  }, [])

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setZoomLevel(val)
    localStorage.setItem('altamente_board_zoom', val.toString())
  }

  const togglePhaseCollapse = (phaseId: string) => {
    setCollapsedPhases(prev => {
      const newState = { ...prev, [phaseId]: !prev[phaseId] }
      localStorage.setItem('altamente_collapsed_phases', JSON.stringify(newState))
      return newState
    })
  }

  const fetchData = async () => {
    // Fetch phases
    const { data: phasesData } = await supabase
      .from('phases')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (phasesData) setPhases(phasesData)

    // Fetch deals
    const { data: dealsData } = await supabase
      .from('deals')
      .select('*, projects(id), companies(name), contacts(first_name, last_name)')
      .order('created_at', { ascending: false })
      
    if (dealsData) setDeals(dealsData as Deal[])
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Optimistic UI update
    const previousDeals = [...deals]
    setDeals(prevDeals => {
      const newDeals = [...prevDeals]
      const dealIndex = newDeals.findIndex(d => d.id === draggableId)
      if (dealIndex > -1) {
        newDeals[dealIndex] = { ...newDeals[dealIndex], phase_id: destination.droppableId }
      }
      return newDeals
    })

    // DB Update
    const { error } = await supabase
      .from('deals')
      .update({ phase_id: destination.droppableId })
      .eq('id', draggableId)

    if (error) {
      console.error('Error updating deal phase:', error)
      toast.error('Errore durante lo spostamento del deal')
      // Revert optimistic update on error
      setDeals(previousDeals)
    } else {
      const phaseTitle = phases.find(p => p.id === destination.droppableId)?.title || destination.droppableId
      toast.success(`Deal spostato in ${phaseTitle}`, {
        description: 'La dashboard è stata aggiornata.',
      })
    }
  }

  const getSourceBadgeClass = (source: Source) => {
    switch (source) {
      case 'corsidia': return styles.sourceCorsidiaBadge
      case 'piuitalia': return styles.sourcePiuitaliaBadge
      case 'web': return styles.sourceWebBadge
    }
  }

  const getCardSourceClass = (source: Source) => {
    switch (source) {
      case 'corsidia': return styles.cardSourceCorsidia
      case 'piuitalia': return styles.cardSourcePiuitalia
      case 'web': return styles.cardSourceWeb
    }
  }

  if (!isBrowser) return null // Prevent hydration errors with drag and drop

  const handleAddDeal = (newDeal: Deal) => {
    setDeals(prev => [newDeal, ...prev])
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Non avviare lo scroll se si sta cliccando su una card (lascia fare a DnD)
    if ((e.target as HTMLElement).closest(`.${styles.card}`)) return
    
    isDown.current = true
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grabbing'
      startX.current = e.pageX - scrollRef.current.offsetLeft
      scrollLeft.current = scrollRef.current.scrollLeft
    }
  }

  const handleMouseLeave = () => {
    isDown.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }

  const handleMouseUp = () => {
    isDown.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5 // Velocità di scroll
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  return (
    <>
      <QuickAddDealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddDeal} 
      />
      <DealDrawer
        isOpen={selectedDeal !== null}
        onClose={() => setSelectedDeal(null)}
        deal={selectedDeal}
        onSaved={fetchData}
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface-solid)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
          <ZoomOut size={16} color="var(--color-text-muted)" />
          <input 
            type="range" 
            min="0.6" 
            max="1.2" 
            step="0.05" 
            value={zoomLevel} 
            onChange={handleZoomChange}
            style={{ width: '100px' }}
          />
          <ZoomIn size={16} color="var(--color-text-muted)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)', minWidth: '40px', textAlign: 'right' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
      <div 
        className={styles.boardContainer}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: 'grab', '--zoom-factor': zoomLevel } as React.CSSProperties}
      >
        {phases.map(phase => {
          const columnDeals = deals.filter(d => d.phase_id === phase.id)
          const isCollapsed = collapsedPhases[phase.id]

          return (
            <div key={phase.id} className={clsx(styles.column, isCollapsed && styles.columnCollapsed)}>
              <div className={clsx(styles.columnHeader, isCollapsed && styles.columnHeaderCollapsed)}>
                <div className={clsx(styles.columnTitle, isCollapsed && styles.columnTitleCollapsed)}>
                  {phase.title}
                  {!isCollapsed && <span className={styles.countBadge}>{columnDeals.length}</span>}
                </div>
                <button 
                  className={styles.collapseButton} 
                  onClick={() => togglePhaseCollapse(phase.id)}
                  title={isCollapsed ? "Espandi" : "Comprimi"}
                >
                  {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
              </div>

              {!isCollapsed && (
                <Droppable droppableId={phase.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={clsx(styles.cardList, snapshot.isDraggingOver && styles.cardListDraggingOver)}
                    >
                    {columnDeals.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style as React.CSSProperties}
                            className={clsx(
                              styles.card,
                              getCardSourceClass(deal.source),
                              snapshot.isDragging && styles.cardDragging
                            )}
                            onClick={() => setSelectedDeal(deal)}
                          >
                            <div className={styles.cardHeader}>
                              <div className={styles.cardTitle}>{deal.title}</div>
                              <span className={clsx(styles.sourceBadge, getSourceBadgeClass(deal.source))}>
                                {deal.source}
                              </span>
                            </div>

                            {(deal.companies || deal.contacts) && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {deal.companies && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Building size={12} /> {deal.companies.name}
                                  </div>
                                )}
                                {deal.contacts && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <User size={12} /> {deal.contacts.first_name} {deal.contacts.last_name}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className={styles.cardFooter}>
                              <div className={styles.cardValue}>
                                €{deal.value.toLocaleString('it-IT')}
                              </div>
                              {deal.phase_id === 'won' && deal.projects && deal.projects.length > 0 && (
                                <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }} title="Progetto Associato">
                                  <Briefcase size={14} />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              )}
            </div>
          )
        })}
      </div>
    </DragDropContext>
    </>
  )
}
