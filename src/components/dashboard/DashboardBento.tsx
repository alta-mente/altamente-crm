
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { TrendingUp, Briefcase, Award, Calendar, Clock, Info } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from '@/app/Dashboard.module.css'
import { CashFlowChart } from './CashFlowChart'
import { ActivityChart } from './ActivityChart'
import { SalesChart } from './SalesChart'
import { Modal } from '@/components/ui/Modal'

interface DashboardBentoProps {
  metrics: {
    activeDealsCount: number
    contactsCount: number
    companiesCount: number
    mrrValue: number
    arrValue: number
    daIncassare: number
    fattureScoperteValue: number
    daFatturareValue: number
    competenzaValue: number
    cassaValue: number
    pipelineValue: number
    wonDealsValue: number
    oreDaFatturareValue: number
    oreDaFatturareText: string
    targetRevenue?: number
    targetMRR?: number
    currentYear: number
  }
  appointments: any[]
  invoices: any[]
  projectsAll: any[]
  services: any[]
  companyHours: any[]
  deals?: any[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

type TabType = 'overview' | 'sales' | 'cash' | 'projects';

export function DashboardBento({ metrics, appointments, invoices, projectsAll, services, companyHours, deals }: DashboardBentoProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('cash')

  const tabs: { id: TabType, label: string }[] = [
    { id: 'cash', label: 'Cassa' },
    { id: 'overview', label: 'Panoramica' },
    { id: 'sales', label: 'Vendite' },
    { id: 'projects', label: 'Progetti' }
  ];

  const [isBacklogModalOpen, setIsBacklogModalOpen] = useState(false)

  // --- REUSABLE WIDGETS ---

  const HeroCard = (
      <motion.div key="hero" variants={itemVariants} className={`bento-card bento-dark ${styles.bentoHero}`} style={{ position: 'relative', overflow: 'hidden' }}>
        <div className={styles.cardContent}>
          <div className={styles.heroTitle} style={{ color: 'white' }}>
            Dashboard<br/><span style={{ background: 'linear-gradient(to right, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>& Analytics</span>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStatBlock}>
              <span className={styles.heroStatValue} style={{ color: 'white' }}>
                <CountUp end={metrics.activeDealsCount} duration={2} />
              </span>
              <span className={styles.heroStatLabel}>Trattative attive</span>
            </div>
            <div className={styles.heroStatBlock}>
              <span className={styles.heroStatValue} style={{ color: 'white' }}>
                <CountUp end={metrics.contactsCount} duration={2} />
              </span>
              <span className={styles.heroStatLabel}>Contatti in DB</span>
            </div>
            <div className={styles.heroStatBlock}>
              <span className={styles.heroStatValue} style={{ color: 'white' }}>
                <CountUp end={metrics.companiesCount} duration={2} />
              </span>
              <span className={styles.heroStatLabel}>Aziende</span>
            </div>
          </div>
        </div>
        {/* Abstract Organic Shape Background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{position:'absolute', top:'-20%', right:'-20%', width:'100%', height:'140%', opacity:0.1, zIndex:0, pointerEvents:'none'}}
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#a855f7" d="M47.7,-57.2C59.5,-45.3,65.3,-26.4,66.8,-7.4C68.4,11.6,65.8,30.6,55.3,44.7C44.7,58.8,26.4,68.1,7.2,69.5C-12,70.9,-31.1,64.4,-44.6,51.8C-58.1,39.2,-66,20.4,-67.2,1.3C-68.4,-17.8,-63,-36.1,-50.7,-48.1C-38.3,-60,-19.1,-65.7,0.3,-66C19.7,-66.4,36,-53.4,47.7,-57.2Z" transform="translate(100 100) scale(1.1)" />
          </svg>
        </motion.div>
      </motion.div>
  )

  const MRRCard = (
      <motion.div key="mrr" variants={itemVariants} className={`bento-card bento-green ${styles.bentoSmall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Valore totale dei contratti ricorrenti mensili attivi (MRR)" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              MRR <Info size={12} opacity={0.6}/>
            </span>
            <TrendingUp size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
              <CountUp end={metrics.mrrValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub}>Retainer in corso</div>
          </div>
        </div>
      </motion.div>
  )

  const ARRCard = (
      <motion.div key="arr" variants={itemVariants} className={`bento-card bento-primary ${styles.bentoSmall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Valore totale dei contratti ricorrenti annuali attivi (ARR)" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              ARR <Info size={12} opacity={0.6}/>
            </span>
            <TrendingUp size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
              <CountUp end={metrics.arrValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub}>Retainer annuali</div>
          </div>
        </div>
      </motion.div>
  )

  const PrevisioniCassaCard = (
      <motion.div key="previsioni" variants={itemVariants} className={`bento-card bento-primary ${styles.bentoSmall}`} style={{ border: '2px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)' }}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Previsione Cassa: Totale Cassa + Da Incassare" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help', fontWeight: 700 }}>
              Previsioni Cassa <Info size={12} opacity={0.9}/>
            </span>
            <TrendingUp size={16} className={styles.cardIcon} />
          </div>
          <div>
            <div className={styles.cardValue} style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              <CountUp end={metrics.cassaValue + metrics.daIncassare} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub} style={{ fontWeight: 600, opacity: 0.9 }}>Attualizzate anno in corso</div>
          </div>
        </div>
      </motion.div>
  )

  const CassaCard = (
      <motion.div key="cassa" variants={itemVariants} className={`bento-card bento-green ${styles.bentoSmall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Cassa Reale: Totale Incassato (fatture saldate)" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              Cassa (Incassato) <Info size={12} opacity={0.6}/>
            </span>
            <Award size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
              <CountUp end={metrics.cassaValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub}>Entrate effettive</div>
          </div>
        </div>
      </motion.div>
  )

  const pendingInvoicesList = invoices
    .filter(i => i.status === 'pending' || i.status === 'late')
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)

  const allUnbilledProjects = projectsAll
    .filter(p => p.billing_type === 'one-off' && (p.billing_status === 'to_invoice' || p.billing_status === 'late'))
    .map(p => {
      const projectTotal = Number(p.billing_amount) || 0
      const totalInvoiced = invoices
        .filter(i => i.project_id === p.id)
        .reduce((invSum, i) => invSum + (Number(i.amount) || 0), 0)
      
      const remaining = projectTotal - totalInvoiced
      return { ...p, remaining }
    })
    .filter(p => p.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining)
    
  const unbilledProjectsListTop5 = allUnbilledProjects.slice(0, 5)

  const DaIncassareCard = (
      <motion.div key="daincassare" variants={itemVariants} className={`bento-card bento-orange ${styles.bentoWide}`} style={{ gridRow: 'span 2' }}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Somma di Fatture Scoperte e Lavoro da Fatturare" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              Totale Da Incassare <Info size={12} opacity={0.6}/>
            </span>
            <Award size={16} className={styles.cardIcon}/>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <div className={styles.cardValue}>
              <CountUp end={metrics.daIncassare} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
              
              {/* Colonna Sinistra: Fatture Scoperte */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-warning)', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  <span>Fatture Scoperte (Crediti)</span>
                  <span>€ {metrics.fattureScoperteValue.toLocaleString('it-IT')}</span>
                </div>
                {pendingInvoicesList.length > 0 ? (
                  pendingInvoicesList.map((i, idx) => {
                    const proj = projectsAll.find(p => p.id === i.project_id)
                    return (
                      <Link href={proj ? `/projects?project=${proj.id}` : '#'} key={i.id || idx} className={styles.listItem}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className={styles.itemTitle}>{i.invoice_number ? `Fatt. ${i.invoice_number}` : 'Fattura'} {proj ? `- ${proj.title}` : ''}</span>
                            <span className={styles.itemMeta} style={{ color: i.status === 'late' ? 'var(--color-danger)' : 'var(--color-warning)' }}>{i.status === 'late' ? 'In Ritardo' : 'In Attesa'}</span>
                          </div>
                          <span style={{ fontWeight: 600 }}>€ {Number(i.amount).toLocaleString('it-IT')}</span>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Nessuna fattura scoperta.</span>
                )}
              </div>

              {/* Colonna Destra: Da Fatturare */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  <span>Da Fatturare (Backlog)</span>
                  <span>€ {metrics.daFatturareValue.toLocaleString('it-IT')}</span>
                </div>
                {unbilledProjectsListTop5.length > 0 ? (
                  <>
                    {unbilledProjectsListTop5.map((p, idx) => (
                    <Link href={`/projects?project=${p.id}`} key={p.id} className={styles.listItem}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles.itemTitle}>{p.title}</span>
                          <span className={styles.itemMeta}>Residuo Progetto</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>€ {p.remaining.toLocaleString('it-IT')}</span>
                      </div>
                    </Link>
                    ))}
                    {allUnbilledProjects.length > 5 && (
                      <button onClick={() => setIsBacklogModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', textAlign: 'center', marginTop: '1rem', cursor: 'pointer' }}>
                        Vedi tutti i progetti &rarr;
                      </button>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Nessun backlog da fatturare.</span>
                )}
              </div>

            </div>
          </div>
        </div>
      </motion.div>
  )

  const PipelineCard = (
      <motion.div key="pipeline" variants={itemVariants} className={`bento-card bento-blue ${styles.bentoSmall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Valore totale stimato di tutti i Deal attualmente aperti (non persi, non vinti, non archiviati)." style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              Valore Pipeline <Info size={12} opacity={0.6}/>
            </span>
            <Briefcase size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
               <CountUp end={metrics.pipelineValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub}>In trattativa</div>
          </div>
        </div>
      </motion.div>
  )

  const VendutoCard = (
      <motion.div key="venduto" variants={itemVariants} className={`bento-card bento-purple ${styles.bentoSmall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Valore totale dei Deal vinti nell'anno corrente." style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              Venduto YTD <Info size={12} opacity={0.6}/>
            </span>
            <Award size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
               <CountUp end={metrics.wonDealsValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub}>Deal vinti nell'anno</div>
          </div>
        </div>
      </motion.div>
  )

  const OreCard = (
      <motion.div key="ore" variants={itemVariants} className={`bento-card bento-dark ${styles.bentoSmall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Valore delle ore lavorate a consuntivo non ancora fatturate (esclude le ore in pre-pagato)." style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              Ore (Da fatturare) <Info size={12} opacity={0.6}/>
            </span>
            <Clock size={16} className={styles.cardIcon} style={{ color: 'rgba(59, 130, 246, 0.9)' }}/>
          </div>
          <div>
            <div className={styles.cardValue}>
               <CountUp end={metrics.oreDaFatturareValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub}>{metrics.oreDaFatturareText} accumulate</div>
          </div>
        </div>
      </motion.div>
  )
  
  const AgendaCard = (
      <motion.div key="agenda" variants={itemVariants} className={`bento-card bento-purple ${styles.bentoWide}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Prossimi Appuntamenti</span>
            <Calendar size={16} className={styles.cardIcon}/>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            {appointments.length === 0 ? (
              <div style={{ fontSize: '13px', opacity: 0.5, fontStyle: 'italic' }}>Nessun appuntamento in vista.</div>
            ) : (
              appointments.slice(0, 3).map((appt, i) => (
                <motion.div 
                  key={appt.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + (i * 0.1) }}
                >
                  <Link href="/board" className={styles.listItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '11px', opacity: 0.8, letterSpacing: '0.5px' }}>
                        {new Date(appt.scheduled_at).toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'})}
                      </span>
                      <span className={styles.itemTitle}>{appt.title}</span>
                    </div>
                    <span className={styles.itemMeta}>{appt.deals?.title}</span>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
  )
  
  const targetRevenue = metrics.targetRevenue || 300000;
  const targetMRR = metrics.targetMRR || 10000;
  const revenuePercent = Math.min(100, Math.round((metrics.wonDealsValue / targetRevenue) * 100));
  const mrrPercent = Math.min(100, Math.round((metrics.mrrValue / targetMRR) * 100));

  const GoalsCard = (
      <motion.div key="goals" variants={itemVariants} className={`bento-card bento-dark ${styles.bentoWide}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Valori target impostati a livello aziendale" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>Obiettivi Aziendali <Info size={12} opacity={0.6}/></span>
            <Award size={16} className={styles.cardIcon} style={{ color: 'var(--color-warning)' }}/>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Obiettivo Fatturato */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Target Venduto YTD</span>
                <span style={{ fontWeight: 600 }}>€ {metrics.wonDealsValue.toLocaleString('it-IT')} / {targetRevenue.toLocaleString('it-IT')}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${revenuePercent}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 1s ease-out' }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--color-primary)', marginTop: '4px', fontWeight: 700 }}>
                {revenuePercent}%
              </div>
            </div>

            {/* Obiettivo MRR */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Target MRR</span>
                <span style={{ fontWeight: 600 }}>€ {metrics.mrrValue.toLocaleString('it-IT')} / {targetMRR.toLocaleString('it-IT')}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${mrrPercent}%`, height: '100%', background: 'var(--color-success)', transition: 'width 1s ease-out' }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--color-success)', marginTop: '4px', fontWeight: 700 }}>
                {mrrPercent}%
              </div>
            </div>

          </div>
        </div>
      </motion.div>
  )
  
  const ActivityChartCard = (
      <motion.div key="activity-chart" variants={itemVariants} className={`bento-card bento-dark ${styles.bentoFull}`} style={{ padding: 0 }}>
        <div className={styles.cardTop} style={{ padding: '1.5rem 1.5rem 0' }}>
          <span className={styles.cardLabel}>Attività & Previsioni</span>
        </div>
        <ActivityChart 
          invoices={invoices} 
          projects={projectsAll} 
          services={services}
          companyHours={companyHours}
          currentYear={metrics.currentYear}
        />
      </motion.div>
  )

  const CashChartCard = (
      <motion.div key="cash-chart" variants={itemVariants} className={`bento-card bento-dark ${styles.bentoFull}`} style={{ padding: 0 }}>
        <div className={styles.cardTop} style={{ padding: '1.5rem 1.5rem 0' }}>
          <span className={styles.cardLabel}>Flusso di Cassa</span>
        </div>
        <CashFlowChart 
          invoices={invoices} 
          projects={projectsAll} 
          services={services}
          companyHours={companyHours}
          currentYear={metrics.currentYear}
        />
      </motion.div>
  )

  const SalesChartCard = (
      <motion.div key="sales-chart" variants={itemVariants} className={`bento-card bento-dark ${styles.bentoFull}`} style={{ padding: 0 }}>
        <div className={styles.cardTop} style={{ padding: '1.5rem 1.5rem 0' }}>
          <span className={styles.cardLabel}>Andamento Vendite</span>
        </div>
        <SalesChart deals={deals || []} currentYear={metrics.currentYear} />
      </motion.div>
  )

  // --- RENDERING BASED ON ACTIVE TAB ---

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return [
          HeroCard,
          GoalsCard,
          MRRCard,
          ARRCard,
          PrevisioniCassaCard,
          CassaCard,
          ActivityChartCard
        ]
      case 'sales':
        return [
          HeroCard,
          PipelineCard,
          VendutoCard,
          MRRCard,
          ARRCard,
          SalesChartCard
        ]
      case 'cash':
        return [
          CassaCard,
          PrevisioniCassaCard,
          DaIncassareCard,
          MRRCard,
          ARRCard,
          CashChartCard
        ]
      case 'projects':
        return [
          HeroCard,
          OreCard,
          MRRCard,
          ARRCard,
          ActivityChartCard
        ]
      default:
        return []
    }
  }

  return (
    <>
      <Modal isOpen={isBacklogModalOpen} onClose={() => setIsBacklogModalOpen(false)} title="Da Fatturare (Backlog Completo)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {allUnbilledProjects.map((p, idx) => (
            <Link href={`/projects?project=${p.id}`} key={p.id} className={styles.listItem} onClick={() => setIsBacklogModalOpen(false)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.itemTitle}>{p.title}</span>
                  <span className={styles.itemMeta}>{p.companies?.name || 'Cliente Sconosciuto'}</span>
                </div>
                <span style={{ fontWeight: 600 }}>€ {Number(p.remaining).toLocaleString('it-IT')}</span>
              </div>
            </Link>
          ))}
        </div>
      </Modal>

      <div className={styles.tabsContainer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={styles.activeTabBackground}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Global Year Selector */}
        <select 
          value={metrics.currentYear}
          onChange={(e) => {
            router.push(`?year=${e.target.value}`)
          }}
          style={{
            background: 'var(--color-surface-solid)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {[2023, 2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          className={styles.bentoGrid}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
