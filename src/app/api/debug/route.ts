import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('*').limit(1)
  return NextResponse.json({ keys: Object.keys(projects?.[0] || {}) })
}
