import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { redirect } from 'next/navigation'
import styles from './Dashboard.module.css'
import { DashboardBento } from '@/components/dashboard/DashboardBento'

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
  
  // Fetch upcoming appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, deals(title)')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  const safeDeals = deals || []
  const safeProjectsAll = projectsAll || []
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
  
  return (
    <DashboardLayout title="Dashboard Analytics">
      <div className={styles.container}>
        <DashboardBento 
          metrics={{
            activeDealsCount: activeDeals.length,
            contactsCount: contactsCount || 0,
            companiesCount: companiesCount || 0,
            mrrValue,
            daIncassare,
            pipelineValue
          }}
          appointments={safeAppointments}
          invoices={invoices || []}
          projectsAll={safeProjectsAll}
          services={safeServices}
          companyHours={safeCompanyHours}
        />
      </div>
    </DashboardLayout>
  )
}
