import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CompaniesTableClient } from '@/components/companies/CompaniesTableClient'

export default function CompaniesPage() {
  return (
    <DashboardLayout title="Aziende">
      <CompaniesTableClient />
    </DashboardLayout>
  )
}
