'use server'

import { createClient } from '@supabase/supabase-js'
import { sendInvoiceRequestEmail } from './emails'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function processInvoiceRequestAction({
  projectId,
  projectName,
  companyName,
  totalAmount,
  reportUrl,
  logoUrl,
  clientEmail
}: {
  projectId: string,
  projectName: string,
  companyName: string,
  totalAmount: number,
  reportUrl: string,
  logoUrl?: string,
  clientEmail?: string
}) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Find all unbilled hours for this project
    const { data: unbilledHours, error: hoursError } = await supabase
      .from('company_hours')
      .select('id')
      .eq('project_id', projectId)
      .eq('billed', false)

    if (hoursError) throw hoursError

    const hourIds = unbilledHours?.map(h => h.id) || []
    
    // 2. Mark hours as billed
    if (hourIds.length > 0) {
      const { error: updateHoursError } = await supabase
        .from('company_hours')
        .update({ billed: true })
        .in('id', hourIds)

      if (updateHoursError) throw updateHoursError
    }

    // 3. Find pending invoices
    const { data: pendingInvoices, error: pendingError } = await supabase
      .from('invoices')
      .select('id')
      .eq('project_id', projectId)
      .in('status', ['pending', 'late'])

    if (pendingError) throw pendingError

    const invoiceIds = pendingInvoices?.map(i => i.id) || []

    // 4. Se ci sono ore extra archiviate, creiamo una nuova fattura 'to_invoice'
    if (hourIds.length > 0) {
      // Dobbiamo capire l'importo delle ore.
      const { data: pendingDetails } = await supabase
        .from('invoices')
        .select('amount')
        .eq('project_id', projectId)
        .in('status', ['pending', 'late'])
        
      const pendingTotal = pendingDetails?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
      const hoursAmount = totalAmount - pendingTotal
      
      if (hoursAmount > 0) {
        await supabase.from('invoices').insert({
          project_id: projectId,
          amount: hoursAmount,
          status: 'pending',
          notes: 'Consuntivo Ore Extra (Richiesta dal Cliente)',
          issue_date: new Date().toISOString().split('T')[0]
        })
      }
    }

    // 5. Update pending invoices status if needed (we can skip if they are already pending)
    // Se fossero late, potremmo rimetterle a pending? No, lasciamole come sono se sono già 'pending' o 'late'.
    // Non facciamo nessun update di stato perchè 'pending' e 'late' sono già gli stati corretti per "Da Saldare".

    // 6. Send the notification email
    const emailResult = await sendInvoiceRequestEmail({
      projectName,
      companyName,
      totalAmount,
      reportUrl,
      logoUrl,
      clientEmail
    })

    return emailResult
  } catch (error: any) {
    console.error('Error processing invoice request:', error)
    return { success: false, error: error.message }
  }
}
