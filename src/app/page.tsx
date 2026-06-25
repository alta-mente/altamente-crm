import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardCharts } from './DashboardCharts'
import { redirect } from 'next/navigation'
import styles from './Dashboard.module.css'
import { TrendingUp, Users, Briefcase, Award } from 'lucide-react'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch metrics
  const { data: deals } = await supabase.from('deals').select('*')
  const { count: contactsCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true })
  const { count: companiesCount } = await supabase.from('companies').select('*', { count: 'exact', head: true })

  const safeDeals = deals || []
  
  // Computations
  const totalValue = safeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  const wonDeals = safeDeals.filter(d => d.phase_id === 'won')
  const wonValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  const activeDeals = safeDeals.filter(d => d.phase_id !== 'won' && d.phase_id !== 'lost')
  
  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <DashboardLayout title="Dashboard Analytics">
      <div className={styles.container}>
        
        <div className={styles.welcome}>
          <h1>Bentornato, {session.user.email?.split('@')[0]} 👋</h1>
          <p>Ecco l'andamento generale del tuo business oggi.</p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.card} glass`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                <TrendingUp size={24} />
              </div>
              <span className={styles.cardTitle}>Valore Totale Pipeline</span>
            </div>
            <div className={styles.cardValue}>{formatter.format(totalValue)}</div>
            <div className={styles.cardFooter}>Tutti i deal attivi e chiusi</div>
          </div>

          <div className={`${styles.card} glass`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                <Award size={24} />
              </div>
              <span className={styles.cardTitle}>Valore Vinto</span>
            </div>
            <div className={styles.cardValue}>{formatter.format(wonValue)}</div>
            <div className={styles.cardFooter}>{wonDeals.length} Deal chiusi con successo</div>
          </div>

          <div className={`${styles.card} glass`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper} style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                <Briefcase size={24} />
              </div>
              <span className={styles.cardTitle}>Deal Attivi</span>
            </div>
            <div className={styles.cardValue}>{activeDeals.length}</div>
            <div className={styles.cardFooter}>In corso di negoziazione</div>
          </div>

          <div className={`${styles.card} glass`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper} style={{ background: 'rgba(147, 51, 234, 0.2)', color: '#a855f7' }}>
                <Users size={24} />
              </div>
              <span className={styles.cardTitle}>Contatti in Rubrica</span>
            </div>
            <div className={styles.cardValue}>{contactsCount || 0}</div>
            <div className={styles.cardFooter}>{companiesCount || 0} Aziende registrate</div>
          </div>
        </div>

        <div className={styles.chartsRow}>
          <div className={`${styles.chartCard} glass`}>
            <h3>Distribuzione Fasi</h3>
            <DashboardCharts deals={safeDeals} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
