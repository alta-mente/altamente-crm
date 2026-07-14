'use client'

import React from 'react'
import { Briefcase, ArrowRight, CheckCircle2, TrendingUp, Package } from 'lucide-react'
import styles from '../../portal/Portal.module.css'

interface CollaboratorClientAppProps {
  displayProjects: any[]
  globalTotalValue: number
  globalTotalCommission: number
  email: string
}

export default function CollaboratorClientApp({ 
  displayProjects, 
  globalTotalValue, 
  globalTotalCommission,
  email
}: CollaboratorClientAppProps) {
  
  const archivedProjects = displayProjects.filter(p => p.phase_id && (p.phase_id.toLowerCase().includes('archiv') || p.phase_id.toLowerCase().includes('completat') || p.phase_id.toLowerCase().includes('chius')))
  const activeProjects = displayProjects.filter(p => !archivedProjects.includes(p))

  const renderProjectCard = (project: any, isArchived: boolean) => {
    return (
    <div
      key={project.id}
      className={styles.projectCard}
      style={{ opacity: isArchived ? 0.6 : 1, transform: isArchived ? 'scale(0.95)' : 'none', transformOrigin: 'top left' }}
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
            {project.companies?.name || 'Azienda non specificata'}
          </div>
        </div>
      </div>
      
      <div className={styles.projectStats}>
        <div className={styles.statRow}>
          <span>Valore Progetto</span>
          <span>€ {project.totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
        </div>
        
        <div className={styles.statRow}>
          <span>Commissione ({project.commissionRate}%)</span>
          <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
            € {project.commissionValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className={styles.container} style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className={styles.reportCard}>
        <div className={styles.header} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
            <div className={styles.iconWrapper} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <TrendingUp size={28} />
            </div>
            <div>
              <h2 className={styles.title} style={{ fontSize: '1.5rem' }}>Riepilogo Commissioni</h2>
              <p className={styles.subtitle}>Statistiche complessive dei progetti assegnati</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Global Value */}
            <div className={styles.statBlock} style={{ minWidth: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div className={styles.statLabel}>Valore Totale Progetti</div>
              <div className={styles.statValue} style={{ fontSize: '2rem' }}>
                € {globalTotalValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Global Commission */}
            <div className={styles.statBlock} style={{ minWidth: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div className={styles.statLabel} style={{ color: 'var(--color-success)' }}>Totale Commissioni Maturate</div>
              <div className={styles.statValue} style={{ fontSize: '2rem', color: 'var(--color-success)' }}>
                € {globalTotalCommission.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects Grid */}
        <div style={{ padding: '0 3rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Progetti Attivi</h3>
        </div>
        <div className={styles.projectsGrid}>
          {activeProjects.map(project => renderProjectCard(project, false))}
        </div>
        
        {activeProjects.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', margin: '0 3rem' }}>
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
