'use client'

import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { TrendingUp, Users, Briefcase, Award, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import styles from '@/app/Dashboard.module.css'
import { CashFlowChart } from './CashFlowChart'

interface DashboardBentoProps {
  metrics: {
    activeDealsCount: number
    contactsCount: number
    companiesCount: number
    mrrValue: number
    daIncassare: number
    pipelineValue: number
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function DashboardBento({ metrics, appointments, invoices, projectsAll, services, companyHours }: DashboardBentoProps) {
  return (
    <motion.div 
      className={styles.bentoGrid}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Main Hero Card */}
      <motion.div variants={itemVariants} className={`bento-card bento-dark ${styles.bentoHero}`} style={{ position: 'relative', overflow: 'hidden' }}>
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

      {/* MRR Card */}
      <motion.div variants={itemVariants} className={`bento-card bento-green ${styles.bentoTall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Entrate Mensili (MRR)</span>
            <TrendingUp size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
              <CountUp end={metrics.mrrValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
            <div className={styles.cardSub}>Retainer in corso</div>
          </div>
          <div className={styles.cardGraph}>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none">
              <motion.path 
                initial={{ pathLength: 0 }} 
                animate={{ pathLength: 1 }} 
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M0,30 Q25,10 50,25 T100,15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" vectorEffect="non-scaling-stroke"
              />
              <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }} cx="50" cy="25" r="3" fill="#fff" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Da Incassare */}
      <motion.div variants={itemVariants} className={`bento-card bento-orange ${styles.bentoSmall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Da Incassare</span>
            <Award size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
              <CountUp end={metrics.daIncassare} duration={2} separator="." decimal="," prefix="€ " />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pipeline Value */}
      <motion.div variants={itemVariants} className={`bento-card bento-blue ${styles.bentoSmall}`}>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Valore Pipeline</span>
            <Briefcase size={16} className={styles.cardIcon}/>
          </div>
          <div>
            <div className={styles.cardValue}>
               <CountUp end={metrics.pipelineValue} duration={2} separator="." decimal="," prefix="€ " />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Agenda */}
      <motion.div variants={itemVariants} className={`bento-card bento-purple ${styles.bentoWide}`}>
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
                  transition={{ delay: 1 + (i * 0.2) }}
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
      
      {/* Cash Flow Chart - Needs to be wrapped in motion div to stagger properly */}
      <motion.div variants={itemVariants} className={`bento-card bento-dark ${styles.bentoFull}`} style={{ padding: 0 }}>
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

    </motion.div>
  )
}
