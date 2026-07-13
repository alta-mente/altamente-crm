'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ProjectTimeTrackingDetail } from './ProjectTimeTrackingDetail'

interface TimeTrackingTabProps {
  project: any
}

export function TimeTrackingTab({ project }: TimeTrackingTabProps) {
  const [hours, setHours] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchHours = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('company_hours')
      .select('*, invoices(status)')
      .eq('project_id', project.id)
      .order('date', { ascending: false })
      .order('id', { ascending: false })
    
    if (!error && data) {
      setHours(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHours()
    // We could set up a real-time subscription here if we wanted to
  }, [project.id])

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Caricamento consuntivi...</div>
  }

  return (
    <div style={{ marginTop: '-1rem' }}>
      <ProjectTimeTrackingDetail 
        project={project} 
        initialHours={hours} 
        isEmbedded={true}
        onHoursUpdated={fetchHours}
      />
    </div>
  )
}
