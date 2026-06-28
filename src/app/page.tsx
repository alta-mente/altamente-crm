import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardCharts } from './DashboardCharts'
import { redirect } from 'next/navigation'
import styles from './Dashboard.module.css'
import { CashFlowChart } from './CashFlowChart'
import { TrendingUp, Users, Briefcase, Award, Calendar, ChevronRight, Clock, Building } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch metrics
  const { data: deals } = await supabase.from('deals').select('*')
  const { data: projectsAll } = await supabase.from('projects').select('*')
  const { count: contactsCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true })
  const { count: companiesCount } = await supabase.from('companies').select('*', { count: 'exact', head: true })
  const { data: invoices } = await supabase.from('invoices').select('*')
  const { data: services } = await supabase.from('services').select('*')
  
  // Fetch billed time tracking hours
  const { data: companyHours } = await supabase
    .from('company_hours')
    .select('*, companies(hourly_rate)')
    .eq('billed', true)
  
  // Fetch active projects for the new list
  const { data: projectsList } = await supabase
    .from('projects')
    .select('*, companies(name)')
    .order('created_at', { ascending: false })
    .limit(5)
    
  // Fetch upcoming appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, deals(title)')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  const safeDeals = deals || []
  const safeProjectsAll = projectsAll || []
  const safeProjectsList = projectsList || []
  const safeAppointments = appointments || []
  const safeServices = services || []
  const safeCompanyHours = companyHours || []
  
  // Computations
  const activeDeals = safeDeals.filter(d => d.phase_id !== 'won' && d.phase_id !== 'lost')
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  
  const mrrValue = safeProjectsAll
    .filter(p => p.billing_type === 'retainer_monthly')
    .reduce((sum, p) => sum + (Number(p.billing_amount) || 0), 0)
    
  const daIncassare = safeProjectsAll
    .filter(p => p.billing_status === 'to_invoice' || p.billing_status === 'late')
    .reduce((sum, p) => sum + (Number(p.billing_amount) || 0), 0)
  
  const formatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <DashboardLayout title="Dashboard Analytics">
      <div className={styles.container}>
        
        <div className={styles.bentoGrid}>
          {/* Main Hero Card (Large Left) */}
          <div className={`bento-card bento-light ${styles.bentoHero}`}>
            <div className={styles.cardContent}>
              <div className={styles.heroTitle}>
                Dashboard<br/>& Analytics
              </div>
              <div className={styles.heroStats}>
                <div className={styles.heroStatBlock}>
                  <span className={styles.heroStatValue}>{activeDeals.length}</span>
                  <span className={styles.heroStatLabel}>Trattative attive</span>
                </div>
                <div className={styles.heroStatBlock}>
                  <span className={styles.heroStatValue}>{contactsCount}</span>
                  <span className={styles.heroStatLabel}>Contatti in DB</span>
                </div>
                <div className={styles.heroStatBlock}>
                  <span className={styles.heroStatValue}>{companiesCount}</span>
                  <span className={styles.heroStatLabel}>Aziende</span>
                </div>
              </div>
            </div>
            {/* Abstract Organic Shape Background */}
            <svg style={{position:'absolute', top:'10%', right:'-10%', width:'80%', height:'120%', opacity:0.1, zIndex:0, pointerEvents:'none'}} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#000" d="M47.7,-57.2C59.5,-45.3,65.3,-26.4,66.8,-7.4C68.4,11.6,65.8,30.6,55.3,44.7C44.7,58.8,26.4,68.1,7.2,69.5C-12,70.9,-31.1,64.4,-44.6,51.8C-58.1,39.2,-66,20.4,-67.2,1.3C-68.4,-17.8,-63,-36.1,-50.7,-48.1C-38.3,-60,-19.1,-65.7,0.3,-66C19.7,-66.4,36,-53.4,47.7,-57.2Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </div>

          {/* MRR Card (Green Tall) */}
          <div className={`bento-card bento-green ${styles.bentoTall}`}>
            <div className={styles.cardContent}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>Entrate Mensili (MRR)</span>
                <TrendingUp size={16} className={styles.cardIcon}/>
              </div>
              <div>
                <div className={styles.cardValue}>{formatter.format(mrrValue)}</div>
                <div className={styles.cardSub}>Retainer in corso</div>
              </div>
              <div className={styles.cardGraph}>
                <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0,30 Q25,10 50,25 T100,15" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                  <path d="M0,35 Q30,15 60,30 T100,20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                  <circle cx="50" cy="25" r="2.5" fill="#fff" />
                  <circle cx="60" cy="30" r="1.5" fill="rgba(255,255,255,0.6)" />
                </svg>
              </div>
            </div>
          </div>

          {/* Da Incassare (Orange Small) */}
          <div className={`bento-card bento-orange ${styles.bentoSmall}`}>
            <div className={styles.cardContent}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>Da Incassare</span>
                <Award size={16} className={styles.cardIcon}/>
              </div>
              <div>
                <div className={styles.cardValue}>{formatter.format(daIncassare)}</div>
              </div>
              <div className={styles.cardGraph}>
                <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                  <circle cx="50" cy="15" r="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <circle cx="50" cy="15" r="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                  <circle cx="50" cy="15" r="2" fill="#fff" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pipeline Value (Blue Small) */}
          <div className={`bento-card bento-blue ${styles.bentoSmall}`}>
            <div className={styles.cardContent}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>Valore Pipeline</span>
                <Briefcase size={16} className={styles.cardIcon}/>
              </div>
              <div>
                <div className={styles.cardValue}>{formatter.format(pipelineValue)}</div>
              </div>
              <div className={styles.cardGraph}>
                 <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                  <polyline points="0,20 20,15 40,18 60,10 80,12 100,5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" vectorEffect="non-scaling-stroke"/>
                  <circle cx="100" cy="5" r="2" fill="#fff" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Agenda (Dark Wide) */}
          <div className={`bento-card bento-dark ${styles.bentoWide}`}>
            <div className={styles.cardContent}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>Prossimi Appuntamenti</span>
                <Calendar size={16} className={styles.cardIcon}/>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                {safeAppointments.length === 0 ? (
                  <div style={{ fontSize: '13px', opacity: 0.5, fontStyle: 'italic' }}>Nessun appuntamento in vista.</div>
                ) : (
                  safeAppointments.slice(0, 3).map(appt => (
                    <Link href="/board" key={appt.id} className={styles.listItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.5px' }}>
                          {new Date(appt.scheduled_at).toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                        <span className={styles.itemTitle}>{appt.title}</span>
                      </div>
                      <span className={styles.itemMeta}>{appt.deals?.title}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Cash Flow Chart */}
          <CashFlowChart 
            invoices={invoices || []} 
            projects={safeProjectsAll} 
            services={safeServices}
            companyHours={safeCompanyHours}
          />
          
        </div>

      </div>
    </DashboardLayout>
  )
}
