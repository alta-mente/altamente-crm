'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Building, BookOpen, Clock } from 'lucide-react'
import styles from './DealDetail.module.css'

interface DealDetailModalProps {
  isOpen: boolean
  onClose: () => void
  deal: any | null
}

export function DealDetailModal({ isOpen, onClose, deal }: DealDetailModalProps) {
  if (!deal) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dettaglio Deal">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{deal.title}</h3>
            <div className={styles.company}>
              <Building size={16} /> {deal.company}
            </div>
          </div>
          <span className={styles.badge} style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            {deal.source}
          </span>
        </div>

        <div className={styles.grid}>
          <div className={styles.section}>
            <span className={styles.label}>Valore</span>
            <span className={styles.valueSuccess}>€{deal.value.toLocaleString('it-IT')}</span>
          </div>
          <div className={styles.section}>
            <span className={styles.label}>Corso / Servizio</span>
            <span className={styles.value}>{deal.course || 'N/A'}</span>
          </div>
          <div className={styles.section}>
            <span className={styles.label}>Data Creazione</span>
            <span className={styles.value}>{new Date(deal.createdAt).toLocaleDateString('it-IT')}</span>
          </div>
          <div className={styles.section}>
            <span className={styles.label}>Fase Attuale</span>
            <span className={styles.value} style={{ textTransform: 'capitalize' }}>{deal.phaseId}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>Chiudi</Button>
          <Button variant="primary">Modifica Deal</Button>
        </div>
      </div>
    </Modal>
  )
}
