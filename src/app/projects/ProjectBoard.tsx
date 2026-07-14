'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Minimize2, Maximize2, ZoomIn, ZoomOut, Briefcase, Clock, Plus, Archive, Building, BookOpen, Mail, Info } from 'lucide-react'
import clsx from 'clsx'
import { toast } from 'sonner'
import styles from './ProjectBoard.module.css'
import { ProjectDrawer } from './ProjectDrawer'
import { QuickAddProjectModal } from './QuickAddProjectModal'
import { Modal } from '@/components/ui/Modal'

import { createClient } from '@/utils/supabase/client'

// Data Types based on DB
export type BillingType = 'one-off' | 'retainer_monthly' | 'retainer_yearly'
export type BillingStatus = 'to_invoice' | 'invoiced' | 'paid' | 'late'

export interface Project {
  id: string
  title: string
  company_id: string | null
  companies?: { name: string, contact_email: string } | null
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
  sort_order?: number
  time_tracking_enabled?: boolean
  prepaid_minutes?: number
  hourly_rate?: number
  always_send_report?: boolean
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const tabParam = searchParams.get('tab')
  const projectParam = searchParams.get('project')

  const [isBrowser, setIsBrowser] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [phases, setPhases] = useState<ProjectPhase[]>([])
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [activeTab, setActiveTab] = useState<string>(tabParam || 'web')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({})
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEmailRulesModalOpen, setIsEmailRulesModalOpen] = useState(false)
  const [unbilledHours, setUnbilledHours] = useState<Record<string, number>>({})
  
  const [projectPaidAmounts, setProjectPaidAmounts] = useState<Record<string, number>>({})
  const [projectPendingAmounts, setProjectPendingAmounts] = useState<Record<string, number>>({})
  
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

  // Sync selected project from URL when projects are loaded
  useEffect(() => {
    if (projectParam && projects.length > 0 && !selectedProject) {
      const p = projects.find(p => p.id === projectParam)
      if (p) setSelectedProject(p)
    }
  }, [projectParam, projects, selectedProject])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleProjectClick = (project: Project | null) => {
    setSelectedProject(project)
    const params = new URLSearchParams(searchParams.toString())
    if (project) {
      params.set('project', project.id)
    } else {
      params.delete('project')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

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
        handleTabChange(typesData[0].id)
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
      .select('*, companies(name, contact_email)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      
    if (projectsData) setProjects(projectsData as Project[])

    // Fetch unbilled hours
    const { data: hoursData } = await supabase
      .from('company_hours')
      .select('project_id, minutes')
      .eq('billed', false)
      
    if (hoursData) {
      const map: Record<string, number> = {}
      hoursData.forEach(h => {
        map[h.project_id] = (map[h.project_id] || 0) + h.minutes
      })
      setUnbilledHours(map)
    }

    // Fetch paid invoices
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('project_id, amount, status')
      .in('status', ['paid', 'pending', 'late'])
      
    if (invoicesData) {
      const paidMap: Record<string, number> = {}
      const pendingMap: Record<string, number> = {}
      invoicesData.forEach(inv => {
        if (inv.status === 'paid') {
          paidMap[inv.project_id] = (paidMap[inv.project_id] || 0) + Number(inv.amount)
        } else {
          pendingMap[inv.project_id] = (pendingMap[inv.project_id] || 0) + Number(inv.amount)
        }
      })
      setProjectPaidAmounts(paidMap)
      setProjectPendingAmounts(pendingMap)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Calculate new column projects list
    const destProjects = Array.from(projects.filter(p => p.phase_id === destination.droppableId).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)))
    const movedProject = projects.find(p => p.id === draggableId)
    if (!movedProject) return

    if (source.droppableId === destination.droppableId) {
      destProjects.splice(source.index, 1)
      destProjects.splice(destination.index, 0, movedProject)
    } else {
      destProjects.splice(destination.index, 0, { ...movedProject, phase_id: destination.droppableId })
    }

    // Optimistic UI update
    const previousProjects = [...projects]
    setProjects(prevProjects => {
      let newProjects = [...prevProjects]
      
      // Update the modified projects with new phase and sort_order
      destProjects.forEach((proj, idx) => {
        const projIndex = newProjects.findIndex(p => p.id === proj.id)
        if (projIndex > -1) {
          newProjects[projIndex] = { ...newProjects[projIndex], phase_id: destination.droppableId, sort_order: idx }
        }
      })
      return newProjects
    })

    // DB Update
    try {
      const updates = destProjects.map((proj, idx) => 
        supabase.from('projects').update({ phase_id: destination.droppableId, sort_order: idx }).eq('id', proj.id)
      )
      await Promise.all(updates)

      if (source.droppableId !== destination.droppableId) {
        const phaseTitle = phases.find(p => p.id === destination.droppableId)?.title || destination.droppableId
        toast.success(`Progetto spostato in ${phaseTitle}`, {
          description: 'La dashboard è stata aggiornata.',
        })
      }
    } catch (error) {
      console.error('Error updating project phase:', error)
      toast.error('Errore durante lo spostamento del progetto')
      setProjects(previousProjects)
    }
  }

  const handleArchiveProject = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    if (!confirm(`Sei sicuro di voler archiviare il progetto "${project.title}"?`)) return
    
    const archivePhase = phases.find(p => 
      (p.title.toLowerCase().includes('archiv') || p.title.toLowerCase().includes('completat') || p.title.toLowerCase().includes('chius') || p.id.toLowerCase().includes('archiv')) 
      && p.project_type_id === activeTab
    )
    if (!archivePhase) {
      toast.error('Fase "Archiviato" non trovata per questo tipo di progetto')
      return
    }
    
    try {
      await supabase.from('projects').update({ phase_id: archivePhase.id }).eq('id', project.id)
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, phase_id: archivePhase.id } : p))
      toast.success('Progetto archiviato')
    } catch (error) {
      toast.error("Errore durante l'archiviazione")
    }
  }

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
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
      <QuickAddProjectModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddProject} 
        activeTab={activeTab}
        phases={phases}
      />
      
      <ProjectDrawer
        isOpen={selectedProject !== null}
        onClose={() => handleProjectClick(null)}
        project={selectedProject}
        onSaved={fetchData}
      />

      {/* Tabs and Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Project Type Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface-solid)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            {projectTypes.map(type => (
              <button
                key={type.id}
                onClick={() => handleTabChange(type.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === type.id ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === type.id ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
                  fontWeight: activeTab === type.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {type.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsEmailRulesModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface)', color: 'var(--color-text)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 500 }}
          >
            <Info size={16} /> Regole Email
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary)', color: 'var(--color-bg-base)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <Plus size={16} /> Nuovo Progetto
          </button>
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
          const columnProjects = projects.filter(p => p.phase_id === phase.id && p.type_id === activeTab).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0))
          const isCollapsed = collapsedPhases[phase.id]
          const isTerminalTitle = phase.title.toLowerCase()
          const isTerminal = ['won', 'lost', 'archivia', 'archiv', 'completat', 'chius'].some(t => isTerminalTitle.includes(t) || phase.id.toLowerCase().includes(t))
          const MAX_VISIBLE = 30
          const visibleProjects = isTerminal ? columnProjects.slice(0, MAX_VISIBLE) : columnProjects
          const hiddenCount = columnProjects.length - visibleProjects.length

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
                    {visibleProjects.map((project, index) => {
                      const projectPending = projectPendingAmounts[project.id] || 0
                      const projectUnbilled = unbilledHours[project.id] || 0
                      const projectRate = project.hourly_rate || 0
                      const hasUnbilledAmount = (!project.prepaid_minutes || project.prepaid_minutes === 0) && (projectUnbilled > 0) && (projectRate > 0)
                      const willGenerateRetainer = project.billing_type === 'retainer_monthly' && (project.billing_amount || 0) > 0
                      const totalToBill = projectPending + ((hasUnbilledAmount ? projectUnbilled : 0) / 60 * projectRate) + (willGenerateRetainer ? project.billing_amount : 0)
                      
                      const meetsConditions = totalToBill > 0 || project.always_send_report
                      const hasEmail = Boolean(project.company_id && project.companies?.contact_email)
                      const willSendEmail = Boolean(meetsConditions && hasEmail)
                      const missingEmailWarning = Boolean(meetsConditions && !hasEmail)

                      return (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            className={clsx(
                              styles.card,
                              snapshot.isDragging && styles.cardDragging
                            )}
                            onClick={() => handleProjectClick(project)}
                          >
                            <div className={styles.cardHeader}>
                              <div className={styles.cardTitle} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {project.title}
                                {willSendEmail && (
                                  <Mail size={14} color="var(--color-success)" title="Questo progetto attiverà l'invio dell'email mensile al cliente" />
                                )}
                                {missingEmailWarning && (
                                  <Mail size={14} color="var(--color-danger)" title="ATTENZIONE: Il progetto soddisferebbe i requisiti per l'email, ma l'Azienda non ha un'email di contatto!" />
                                )}
                              </div>
                              {!project.phase_id.toLowerCase().includes('archiv') && !project.phase_id.toLowerCase().includes('completat') && !project.phase_id.toLowerCase().includes('chius') && (
                                <button 
                                  className={styles.archiveButton} 
                                  onClick={(e) => handleArchiveProject(e, project)}
                                  title="Archivia"
                                >
                                  <Archive size={14} />
                                </button>
                              )}
                            </div>

                            {project.companies && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Building size={12} /> {project.companies.name}
                              </div>
                            )}

                            {(project.time_tracking_enabled && (unbilledHours[project.id] > 0 || project.prepaid_minutes! > 0 || project.hourly_rate! > 0)) && (
                              <div style={{ marginTop: '0.5rem', marginBottom: '0.25rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                {project.prepaid_minutes! > 0 && (
                                  <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={10} /> 
                                    Rimaste: {Math.floor((project.prepaid_minutes! - (unbilledHours[project.id] || 0)) / 60)}h {Math.abs((project.prepaid_minutes! - (unbilledHours[project.id] || 0)) % 60)}m
                                  </span>
                                )}
                                {(project.hourly_rate! > 0 && !project.prepaid_minutes) && (
                                  <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={10} /> 
                                    Consuntivo: €{(((unbilledHours[project.id] || 0) / 60) * project.hourly_rate!).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                )}
                                {(!project.hourly_rate && !project.prepaid_minutes && unbilledHours[project.id] > 0) && (
                                  <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={10} /> 
                                    Ore: {Math.floor(unbilledHours[project.id] / 60)}h {unbilledHours[project.id] % 60}m
                                  </span>
                                )}
                              </div>
                            )}

                            <div className={styles.cardFooter}>
                              <div className={styles.cardValue} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                                <Briefcase size={12} />
                                {project.billing_type === 'one-off' ? 'Una Tantum' : 'Retainer'}
                              </div>
                              {project.billing_amount > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                  <div className={styles.cardValue} style={{ fontWeight: 'bold' }}>
                                    €{project.billing_amount.toLocaleString('it-IT')}
                                  </div>
                                  {(projectPaidAmounts[project.id] > 0) && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-success)', opacity: 0.9 }}>
                                      Incassato: €{projectPaidAmounts[project.id].toLocaleString('it-IT')}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                      )
                    })}
                    {provided.placeholder}
                    {hiddenCount > 0 && (
                      <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-solid)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', marginTop: '0.5rem' }}>
                        + altri {hiddenCount} progetti meno recenti
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
              )}
            </div>
          )
        })}
      </div>
    </DragDropContext>

    <Modal isOpen={isEmailRulesModalOpen} onClose={() => setIsEmailRulesModalOpen(false)}>
      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={24} color="var(--color-primary)" /> Regole Invio Email Mensile
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
          <p>
            L'email riassuntiva viene inviata ai clienti <strong>il 1° di ogni mese</strong> (se il cronjob è attivo) in automatico, oppure quando clicchi su "Invia Ora".
          </p>
          <div style={{ background: 'var(--color-surface-solid)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Condizioni per l'invio:</h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Il progetto deve essere <strong>assegnato ad un'azienda</strong> e l'azienda deve avere una <strong>email di contatto</strong> configurata.</li>
              <li>Il progetto deve avere un importo da saldare positivo per il mese corrente (es. <strong>ore extra a consuntivo</strong>, <strong>canoni in sospeso</strong> o <strong>canoni mensili ricorrenti</strong>).</li>
              <li><em>OPPURE</em> deve avere la spunta attiva su <strong>"Invia sempre report mensile via email"</strong> nelle impostazioni del progetto.</li>
            </ul>
          </div>
          <p style={{ marginTop: '0.5rem' }}>
            <Mail size={16} color="var(--color-success)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            L'icona verde della posta appare di fianco al nome del progetto quando soddisfa i requisiti ed è pronto per l'invio.
            <br/><br/>
            <Mail size={16} color="var(--color-danger)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Se vedi un'icona <strong>rossa</strong>, significa che il progetto soddisferebbe i requisiti per l'invio, ma manca l'email di contatto dell'azienda!
          </p>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setIsEmailRulesModalOpen(false)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500 }}>
            Ho Capito
          </button>
        </div>
      </div>
    </Modal>
    </>
  )
}
