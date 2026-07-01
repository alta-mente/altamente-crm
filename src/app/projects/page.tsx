import { ProjectBoard } from './ProjectBoard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export const metadata = {
  title: 'Progetti | Altamente CRM',
}

import { Suspense } from 'react'

export default function ProjectsPage() {
  return (
    <DashboardLayout title="Produzione & Progetti">
      <Suspense fallback={<div style={{ padding: '2rem' }}>Caricamento...</div>}>
        <ProjectBoard />
      </Suspense>
    </DashboardLayout>
  )
}
