import { ProjectBoard } from './ProjectBoard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export const metadata = {
  title: 'Progetti | Altamente CRM',
}

export default function ProjectsPage() {
  return (
    <DashboardLayout title="Produzione & Progetti">
      <ProjectBoard />
    </DashboardLayout>
  )
}
