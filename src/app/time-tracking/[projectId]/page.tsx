import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { createClient } from '@/utils/supabase/server'
import { ProjectTimeTrackingDetail } from '@/components/time-tracking/ProjectTimeTrackingDetail'
import { notFound } from 'next/navigation'

export default async function ProjectTimeTrackingPage({ 
  params 
}: { 
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch project details with company name
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, companies(name, contact_email)')
    .eq('id', resolvedParams.projectId)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch hours for the project
  const { data: hours, error: hoursError } = await supabase
    .from('company_hours')
    .select('*')
    .eq('project_id', resolvedParams.projectId)
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  if (hoursError) {
    console.error('Error fetching hours:', hoursError)
  }

  return (
    <DashboardLayout title={`Consuntivi: ${project.title} (${project.companies?.name || 'Senza Azienda'})`}>
      <ProjectTimeTrackingDetail 
        project={project}
        initialHours={hours || []}
      />
    </DashboardLayout>
  )
}
