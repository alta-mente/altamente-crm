'use client'

import React, { useState } from 'react'
import { Building, ArrowRight, Euro, CalendarDays } from 'lucide-react'
import styles from '../Portal.module.css'
import { ProjectDetailView } from '@/components/portal/ProjectDetailView'

interface PortalClientAppProps {
  company: any
  settings: any
  displayProjects: any[]
  globalRetainerAmount: number
  globalPendingAmount: number
  globalPrepaidRemaining: number
}

export function PortalClientApp({ 
  company, 
  settings, 
  displayProjects, 
  globalRetainerAmount, 
  globalPendingAmount, 
  globalPrepaidRemaining 
}: PortalClientAppProps) {
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const selectedProject = displayProjects.find(p => p.id === selectedProjectId)

  const formatTime = (totalMin: number) => {
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${h}h ${m.toString().padStart(2, '0')}m`
  }

  // If a project is selected, render the detail view
  if (selectedProject) {
    return (
      <ProjectDetailView 
        project={selectedProject} 
        settings={settings} 
        onBack={() => setSelectedProjectId(null)} 
      />
    )
  }
  const archivedProjects = displayProjects.filter(p => p.phase_id && (p.phase_id.toLowerCase().includes('archiv') || p.phase_id.toLowerCase().includes('completat') || p.phase_id.toLowerCase().includes('chius')))
  const activeProjects = displayProjects.filter(p => !archivedProjects.includes(p))

  const renderProjectCard = (project: any, isArchived: boolean) => (
    <div
      key={project.id}
      className={styles.projectCard}
      onClick={() => {
        setSelectedProjectId(project.id)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      style={{ cursor: 'pointer', opacity: isArchived ? 0.6 : 1, transform: isArchived ? 'scale(0.95)' : 'none', transformOrigin: 'top left' }}
    >
      <div className={styles.projectHeader}>
        <div>
          <div className={styles.projectTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {project.title}
            {isArchived && (
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--color-surface-hover)', borderRadius: '4px', color: 'var(--color-text-muted)' }}>
                Archiviato
              </span>
            )}
          </div>
          <div className={styles.projectType}>
            {project.billing_type === 'retainer_monthly' ? 'Canone Mensile' : 
             project.prepaid_minutes > 0 ? 'Monte Ore' : 
             project.time_tracking_enabled ? 'Consuntivo Ore' : 'Progetto'}
          </div>
        </div>
        <div style={{ color: 'var(--color-text-muted)' }}>
          <ArrowRight size={20} />
        </div>
      </div>
      
      <div className={styles.projectStats}>
        {project.billing_type === 'retainer_monthly' && (
          <div className={styles.statRow}>
            <span>Valore Canone</span>
            <span style={{ color: 'var(--color-primary)' }}>€ {(project.billing_amount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        
        {project.billing_type !== 'retainer_monthly' && project.time_tracking_enabled === false && project.billing_amount > 0 && (
          <div className={styles.statRow}>
            <span>Valore Progetto</span>
            <span style={{ color: 'var(--color-primary)' }}>€ {project.billing_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        
        {project.prepaid_minutes > 0 && (
          <div className={styles.statRow}>
            <span>Credito Residuo</span>
            <span style={{ color: project.remainingMin > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {formatTime(project.remainingMin)}
            </span>
          </div>
        )}
        
        {project.pendingAmount > 0 && (
          <div className={styles.statRow}>
            <span>Da Saldare</span>
            <span style={{ color: 'var(--color-warning)' }}>
              € {project.pendingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {project.pendingAmount === 0 && project.billing_type !== 'retainer_monthly' && project.prepaid_minutes === 0 && (
          <div className={styles.statRow}>
            <span>Stato Pagamenti</span>
            <span style={{ color: 'var(--color-success)' }}>Regolare</span>
          </div>
        )}
      </div>
    </div>
  )

  // Otherwise, render the dashboard grid
  return (
    <div className={styles.container}>
      <div className={styles.reportCard}>
        
        {/* Header / Company Info */}
        <div className={styles.header}>
          <div className={styles.companyInfo}>
            {settings?.logo_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '50px', marginBottom: '1.5rem', display: 'block' }} />
            )}
            <h1 style={{ fontSize: '2.5rem' }}>Area Riservata</h1>
            <p style={{ marginTop: '0.5rem' }}><Building size={24} /> {company.name}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {/* Global Retainers */}
            {globalRetainerAmount > 0 && (
              <div className={styles.statBlock} style={{ minWidth: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <div className={styles.statLabel}><CalendarDays size={16} /> Canoni Attivi</div>
                <div className={styles.statValue} style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                  € {globalRetainerAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
            
            {/* Global Pending */}
            <div className={styles.statBlock} style={{ minWidth: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div className={styles.statLabel}><Euro size={16} /> Totale da Saldare</div>
              <div className={styles.statValue} style={{ fontSize: '2rem', color: globalPendingAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                € {globalPendingAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects Grid */}
        <div className={styles.projectsGrid}>
          {activeProjects.map(project => renderProjectCard(project, false))}
        </div>
        
        {activeProjects.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            Nessun progetto attivo al momento.
          </div>
        )}

        {/* Archived Projects Section */}
        {archivedProjects.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ padding: '0 3rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Storico Progetti Archiviati</h3>
            </div>
            <div className={styles.projectsGrid}>
              {archivedProjects.map(project => renderProjectCard(project, true))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
