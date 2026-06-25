import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ContactsTableClient } from '@/components/contacts/ContactsTableClient'

export default function ContactsPage() {
  return (
    <DashboardLayout title="Contatti">
      <ContactsTableClient />
    </DashboardLayout>
  )
}
