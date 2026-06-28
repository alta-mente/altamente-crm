import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { createClient } from '@/utils/supabase/server'
import { TimeTrackingDashboard } from '@/components/time-tracking/TimeTrackingDashboard'

export default async function TimeTrackingPage() {
  const supabase = await createClient()

  // Fetch all companies with time tracking enabled
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .eq('time_tracking_enabled', true)
    .order('name')

  if (error) {
    console.error('Error fetching companies:', error)
  }

  // Fetch unbilled hours for these companies
  const companyIds = companies?.map(c => c.id) || []
  let unbilledHours: { company_id: string, minutes: number }[] = []
  
  if (companyIds.length > 0) {
    const { data: hoursData, error: hoursError } = await supabase
      .from('company_hours')
      .select('company_id, minutes')
      .in('company_id', companyIds)
      .eq('billed', false)
      
    if (!hoursError && hoursData) {
      // Group by company
      const grouped = hoursData.reduce((acc, curr) => {
        acc[curr.company_id] = (acc[curr.company_id] || 0) + curr.minutes
        return acc
      }, {} as Record<string, number>)
      
      unbilledHours = Object.entries(grouped).map(([company_id, minutes]) => ({
        company_id,
        minutes
      }))
    }
  }

  return (
    <DashboardLayout title="Ore (Consuntivi)">
      <TimeTrackingDashboard 
        companies={companies || []} 
        unbilledTotals={unbilledHours} 
      />
    </DashboardLayout>
  )
}
