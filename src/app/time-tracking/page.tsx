import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { createClient } from '@/utils/supabase/server'
import { TimeTrackingDashboard } from '@/components/time-tracking/TimeTrackingDashboard'

export default async function TimeTrackingPage() {
  const supabase = await createClient()

  // Fetch all projects with time tracking enabled
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, companies(name)')
    .eq('time_tracking_enabled', true)
    .order('title')

  if (error) {
    console.error('Error fetching projects:', error)
  }

  // Fetch unbilled hours for these projects
  const projectIds = projects?.map(p => p.id) || []
  let unbilledHours: { project_id: string, minutes: number }[] = []
  
  if (projectIds.length > 0) {
    const { data: hoursData, error: hoursError } = await supabase
      .from('company_hours')
      .select('project_id, minutes')
      .in('project_id', projectIds)
      .eq('billed', false)
      
    if (!hoursError && hoursData) {
      // Group by project
      const grouped = hoursData.reduce((acc, curr) => {
        acc[curr.project_id] = (acc[curr.project_id] || 0) + curr.minutes
        return acc
      }, {} as Record<string, number>)
      
      unbilledHours = Object.entries(grouped).map(([project_id, minutes]) => ({
        project_id,
        minutes
      }))
    }
  }

  return (
    <DashboardLayout title="Ore (Consuntivi)">
      <TimeTrackingDashboard 
        projects={projects || []} 
        unbilledTotals={unbilledHours} 
      />
    </DashboardLayout>
  )
}
