'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Minimize2, Maximize2, ZoomIn, ZoomOut, Briefcase } from 'lucide-react'
import clsx from 'clsx'
import { toast } from 'sonner'
import styles from './ProjectBoard.module.css'
import { ProjectDrawer } from './ProjectDrawer'

import { createClient } from '@/utils/supabase/client'

// Data Types based on DB
export type BillingType = 'one-off' | 'retainer_monthly' | 'retainer_yearly'
export type BillingStatus = 'to_invoice' | 'invoiced' | 'paid' | 'late'

export interface Project {
  id: string
  title: string
  company_id: string | null
  deal_id: string | null
  type_id: string
  phase_id: string
  drive_url: string | null
  figma_url: string | null
  github_url: string | null
  billing_type: BillingType
  billing_amount: number
  billing_status: BillingStatus
  created_at: string
}

export interface ProjectPhase {
  id: string
  title: string
  sort_order: number
  project_type_id: string
}

export interface ProjectType {
  id: string
  name: string
  sort_order: number
}

interface ProjectBoardProps {
  // Pass any modal triggers if needed later
}

export function ProjectBoard({}: ProjectBoardProps) {
  const [isBrowser, setIsBrowser] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [phases, setPhases] = useState<ProjectPhase[]>([])
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [activeTab, setActiveTab] = useState<string>('web')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
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
    const savedCollapsed = localStorage.getItem('altamente_project_collapsed_phases')
    if (savedCollapsed) {
      try {
        setCollapsedPhases(JSON.parse(savedCollapsed))
      } catch (e) {
        console.error('Error parsing collapsed phases', e)
      }
    }
    // Load zoom level
    const savedZoom = localStorage.getItem('altamente_project_board_zoom')
    if (savedZoom) {
      setZoomLevel(parseFloat(savedZoom))
    }
  }, [])

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setZoomLevel(val)
    localStorage.setItem('altamente_project_board_zoom', val.toString())
  }

  const togglePhaseCollapse = (phaseId: string) => {
    setCollapsedPhases(prev => {
      const newState = { ...prev, [phaseId]: !prev[phaseId] }
      localStorage.setItem('altamente_project_collapsed_phases', JSON.stringify(newState))
      return newState
    })
  }

  const fetchData = async () => {
    // Fetch project types
    const { data: typesData } = await supabase
      .from('project_types')
      .select('*')
      .order('sort_order', { ascending: true })
      
    if (typesData) {
      setProjectTypes(typesData)
      // Se l'activeTab non esiste tra i tipi caricati, imposta il primo
      if (typesData.length > 0 && !typesData.find(t => t.id === activeTab)) {
        setActiveTab(typesData[0].id)
      }
    }

    // Fetch phases
    const { data: phasesData } = await supabase
      .from('project_phases')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (phasesData) setPhases(phasesData)

    // Fetch projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (projectsData) setProjects(projectsData as Project[])
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Optimistic UI update
    const previousProjects = [...projects]
    setProjects(prevProjects => {
      const newProjects = [...prevProjects]
      const index = newProjects.findIndex(p => p.id === draggableId)
      if (index > -1) {
        newProjects[index] = { ...newProjects[index], phase_id: destination.droppableId }
      }
      return newProjects
    })

    // DB Update
    const { error } = await supabase
      .from('projects')
      .update({ phase_id: destination.droppableId })
      .eq('id', draggableId)

    if (error) {
      console.error('Error updating project phase:', error)
      toast.error('Errore durante lo spostamento del progetto')
      // Revert optimistic update on error
      setProjects(previousProjects)
    } else {
      const phaseTitle = phases.find(p => p.id === destination.droppableId)?.title || destination.droppableId
      toast.success(`Progetto spostato in ${phaseTitle}`)
    }
  }

  if (!isBrowser) return null // Prevent hydration errors with drag and drop

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
      <ProjectDrawer
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        onSaved={fetchData}
      />

      {/* Tabs and Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Project Type Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface-solid)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          {projectTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === type.id ? 'var(--color-primary)' : 'transparent',
                color: activeTab === type.id ? 'white' : 'var(--color-text-muted)',
                fontWeight: activeTab === type.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {type.name}
            </button>
          ))}
        </div>

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
        {phases.filter(p => p.project_type_id === activeTab).map(phase => {
          const columnProjects = projects.filter(p => p.phase_id === phase.id && p.type_id === activeTab)
          const isCollapsed = collapsedPhases[phase.id]

          return (
            <div key={phase.id} className={clsx(styles.column, isCollapsed && styles.columnCollapsed)}>
              <div className={clsx(styles.columnHeader, isCollapsed && styles.columnHeaderCollapsed)}>
                <div className={clsx(styles.columnTitle, isCollapsed && styles.columnTitleCollapsed)}>
                  {phase.title}
                  {!isCollapsed && <span className={styles.countBadge}>{columnProjects.length}</span>}
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
                    {columnProjects.map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style as React.CSSProperties}
                            className={clsx(
                              styles.card,
                              snapshot.isDragging && styles.cardDragging
                            )}
                            onClick={() => setSelectedProject(project)}
                          >
                            <div className={styles.cardHeader}>
                              <div className={styles.cardTitle}>{project.title}</div>
                            </div>

                            <div className={styles.cardFooter}>
                              <div className={styles.cardValue} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                                <Briefcase size={12} />
                                {project.billing_type === 'one-off' ? 'Una Tantum' : 'Retainer'}
                              </div>
                              <div className={styles.cardValue} style={{ fontWeight: 'bold' }}>
                                €{project.billing_amount.toLocaleString('it-IT')}
                              </div>
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
