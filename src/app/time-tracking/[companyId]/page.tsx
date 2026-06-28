import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { createClient } from '@/utils/supabase/server'
import { CompanyTimeTrackingDetail } from '@/components/time-tracking/CompanyTimeTrackingDetail'
import { notFound } from 'next/navigation'

export default async function CompanyTimeTrackingPage({ 
  params 
}: { 
  params: Promise<{ companyId: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch company details
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', resolvedParams.companyId)
    .single()

  if (companyError || !company) {
    notFound()
  }

  // Fetch hours for the company
  const { data: hours, error: hoursError } = await supabase
    .from('company_hours')
    .select('*')
    .eq('company_id', resolvedParams.companyId)
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  if (hoursError) {
    console.error('Error fetching hours:', hoursError)
  }

  return (
    <DashboardLayout title={`Dettaglio Ore: ${company.name}`}>
      <CompanyTimeTrackingDetail 
        company={company}
        initialHours={hours || []}
      />
    </DashboardLayout>
  )
}
