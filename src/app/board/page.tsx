'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Board } from './Board'
import { Button } from '@/components/ui/Button'
import { QuickAddDealModal } from './QuickAddDealModal'

export default function BoardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <DashboardLayout title="Kanban Board">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Nuovo Deal</Button>
      </div>
      
      <Board isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </DashboardLayout>
  )
}
