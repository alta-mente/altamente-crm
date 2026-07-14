import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: phases } = await supabase.from('project_phases').select('*')
  const { data: projects } = await supabase.from('projects').select('id, title, phase_id, type_id')
  
  // Find projects whose phase_id is not in phases
  const phaseIds = phases ? phases.map(p => p.id) : []
  const orphanedProjects = projects ? projects.filter(p => !phaseIds.includes(p.phase_id)) : []
  
  return NextResponse.json({ orphanedProjects, phases })
}
