import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ServiceList } from './ServiceList'

export const metadata = {
  title: 'Scadenze e Servizi | Altamente CRM',
}

export default function ServicesPage() {
  return (
    <DashboardLayout title="Scadenze & Servizi">
      <ServiceList />
    </DashboardLayout>
  )
}
