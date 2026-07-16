const fs = require('fs');

const fileContent = `
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { TrendingUp, Briefcase, Award, Calendar, Clock, Info } from 'lucide-react'
import Link from 'next/link'
import styles from '@/app/Dashboard.module.css'
import { CashFlowChart } from './CashFlowChart'

interface DashboardBentoProps {
  metrics: {
    activeDealsCount: number
    contactsCount: number
    companiesCount: number
    mrrValue: number
    arrValue: number
    daIncassare: number
    competenzaValue: number
    cassaValue: number
    pipelineValue: number
    wonDealsValue: number
    oreDaFatturareValue: number
    oreDaFatturareText: string
  }
  appointments: any[]
  invoices: any[]
  projectsAll: any[]
  services: any[]
  companyHours: any[]
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

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

type TabType = 'overview' | 'sales' | 'cash' | 'projects';

export function DashboardBento({ metrics, appointments, invoices, projectsAll, services, companyHours }: DashboardBentoProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs: { id: TabType, label: string }[] = [
    { id: 'overview', label: 'Panoramica' },
    { id: 'sales', label: 'Vendite' },
    { id: 'cash', label: 'Cassa' },
    { id: 'projects', label: 'Progetti' }
  ];

  // --- REUSABLE WIDGETS ---

  const HeroCard = (
      <motion.div key="hero" variants={itemVariants} className={\`bento-card bento-dark \${styles.bentoHero}\`} style={{ position: 'relative', overflow: 'hidden' }}>
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
      <motion.div key="mrr" variants={itemVariants} className={\`bento-card bento-green \${styles.bentoSmall}\`}>
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
      <motion.div key="arr" variants={itemVariants} className={\`bento-card bento-primary \${styles.bentoSmall}\`}>
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

  const CompetenzaCard = (
      <motion.div key="comp" variants={itemVariants} className={\`bento-card bento-dark \${styles.bentoSmall}\`} style={{ border: '1px solid rgba(168, 85, 247, 0.2)' }}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Competenza Economica: Totale Fatturato (emesso)" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              Competenza (Fatturato) <Info size={12} opacity={0.6}/>
            </span>
            <TrendingUp size={16} className={styles.cardIcon} style={{ color: '#a855f7' }}/>
          </div>
          <div>
            <div className={styles.cardValue}>
              <CountUp end={metrics.competenzaValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub}>Valore generato / Emesso</div>
          </div>
        </div>
      </motion.div>
  )

  const CassaCard = (
      <motion.div key="cassa" variants={itemVariants} className={\`bento-card bento-green \${styles.bentoSmall}\`}>
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

  const DaIncassareCard = (
      <motion.div key="daincassare" variants={itemVariants} className={\`bento-card bento-orange \${styles.bentoSmall}\`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel} title="Valore dei progetti 'Da Fatturare' o 'In Ritardo', sottraendo eventuali fatture/incassi già registrati nel progetto." style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
              Da Incassare <Info size={12} opacity={0.6}/>
            </span>
            <Award size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
              <CountUp end={metrics.daIncassare} duration={2} separator="." decimal="," prefix="€ " />
            </div>
          </div>
        </div>
      </motion.div>
  )

  const PipelineCard = (
      <motion.div key="pipeline" variants={itemVariants} className={\`bento-card bento-blue \${styles.bentoSmall}\`}>
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
      <motion.div key="venduto" variants={itemVariants} className={\`bento-card bento-purple \${styles.bentoSmall}\`}>
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
      <motion.div key="ore" variants={itemVariants} className={\`bento-card bento-dark \${styles.bentoSmall}\`}>
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
      <motion.div key="agenda" variants={itemVariants} className={\`bento-card bento-purple \${styles.bentoWide}\`}>
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
  
  const ChartCard = (
      <motion.div key="chart" variants={itemVariants} className={\`bento-card bento-dark \${styles.bentoFull}\`} style={{ padding: 0 }}>
        <div className={styles.cardTop} style={{ padding: '1.5rem 1.5rem 0' }}>
          <span className={styles.cardLabel}>Cash Flow & Attività</span>
        </div>
        <CashFlowChart 
          invoices={invoices} 
          projects={projectsAll} 
          services={services}
          companyHours={companyHours}
        />
      </motion.div>
  )

  // --- RENDERING BASED ON ACTIVE TAB ---

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return [
          HeroCard,
          MRRCard,
          ARRCard,
          CompetenzaCard,
          CassaCard,
          AgendaCard,
          ChartCard
        ]
      case 'sales':
        return [
          HeroCard,
          PipelineCard,
          VendutoCard,
          MRRCard,
          ARRCard,
          AgendaCard
        ]
      case 'cash':
        return [
          CassaCard,
          CompetenzaCard,
          DaIncassareCard,
          MRRCard,
          ARRCard,
          ChartCard
        ]
      case 'projects':
        return [
          HeroCard,
          OreCard,
          MRRCard,
          ARRCard,
          AgendaCard
        ]
      default:
        return []
    }
  }

  return (
    <>
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={\`\${styles.tabButton} \${activeTab === tab.id ? styles.tabButtonActive : ''}\`}
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
`

fs.writeFileSync('src/components/dashboard/DashboardBento.tsx', fileContent);
