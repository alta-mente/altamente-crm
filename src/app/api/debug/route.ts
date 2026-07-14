import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: tables } = await supabase.rpc('get_tables')
  // or just hardcode some tables
  const { data: p } = await supabase.from('projects').select('*').limit(1)
  return NextResponse.json({ keys: Object.keys(p?.[0] || {}) })
}
