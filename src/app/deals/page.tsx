import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Table } from '@/components/ui/Table'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DealsPage() {
  const supabase = await createClient()
  
  const { data: deals } = await supabase
    .from('deals')
    .select('*, phases(title)')
    .order('created_at', { ascending: false })

  const columns = [
    { key: 'title', title: 'Titolo' },
    { key: 'source', title: 'Sorgente', render: (d: any) => (
      <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>{d.source}</span>
    )},
    { key: 'company', title: 'Azienda', render: (d: any) => d.companies ? d.companies.name : '-' },
    { key: 'value', title: 'Valore', render: (d: any) => `€${d.value.toLocaleString('it-IT')}` },
    { key: 'phase', title: 'Fase', render: (d: any) => d.phases?.title || d.phase_id },
    { key: 'created_at', title: 'Creato il', render: (d: any) => new Date(d.created_at).toLocaleDateString('it-IT') }
  ]

  return (
    <DashboardLayout title="Deals">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Tutti i Deal</h2>
      </div>
      
      <Table columns={columns} data={deals || []} />
    </DashboardLayout>
  )
}
