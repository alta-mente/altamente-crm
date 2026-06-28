import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // We use the service role key to bypass RLS for webhooks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const data = await request.json()

    // Esempio di struttura dati attesa da Corsidia
    const { nome, cognome, email, telefono, nome_corso } = data

    if (!email && !telefono) {
      return NextResponse.json({ error: 'Missing email or phone' }, { status: 400 })
    }

    // 1. Cerca o crea il contatto
    let contactId = null
    
    // Cerca per email se esiste
    if (email) {
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', email)
        .single()
        
      if (existingContact) {
        contactId = existingContact.id
      }
    }

    // Se non esiste, crea
    if (!contactId) {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert([{
          first_name: nome || 'Sconosciuto',
          last_name: cognome || '',
          email: email || null,
          phone: telefono || null
        }])
        .select('id')
        .single()

      if (contactError) throw contactError
      if (newContact) contactId = newContact.id
    }

    // 2. Crea il Deal (Opportunità) e collegalo al contatto
    const dealTitle = `Lead da Corsidia: ${nome} ${cognome}`
    
    const { error: dealError } = await supabase
      .from('deals')
      .insert([{
        title: dealTitle,
        contact_id: contactId,
        course: nome_corso || null,
        source: 'corsidia',
        phase_id: 'unassigned'
      }])

    if (dealError) throw dealError

    return NextResponse.json({ success: true, message: 'Lead received and processed successfully' })

  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
