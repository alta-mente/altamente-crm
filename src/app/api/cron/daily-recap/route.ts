import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const RESEND_API_KEY = process.env.RESEND_API_KEY
// In a real app this would be the user's email or fetched from DB
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'alessandro@altamente.com'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function GET(request: Request) {
  // Verify cron secret if configured in Vercel
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Get today's bounds
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  // Fetch today's appointments
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*, deals(title)')
    .gte('scheduled_at', todayStart.toISOString())
    .lt('scheduled_at', tomorrowStart.toISOString())
    .order('scheduled_at', { ascending: true })

  const thirtyDaysFromNow = new Date(todayStart)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  // Fetch expiring services
  const { data: expiringServices, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'active')
    .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
    .order('expiry_date', { ascending: true })

  if (error || servicesError) {
    console.error('Error fetching data:', error || servicesError)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const hasAppointments = appointments && appointments.length > 0
  const hasExpiring = expiringServices && expiringServices.length > 0

  if (!hasAppointments && !hasExpiring) {
    return NextResponse.json({ message: 'No appointments or expiring services today, no email sent.' })
  }

  // Format email content
  let htmlContent = `<h2>Riepilogo CRM Altamente</h2>`
  
  if (hasAppointments) {
    htmlContent += `<h3>📅 ${appointments.length} Attività di Oggi</h3><ul>`
    appointments.forEach(appt => {
      const timeStr = new Date(appt.scheduled_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })
      const dealStr = appt.deals?.title ? ` (in <b>${appt.deals.title}</b>)` : ''
      htmlContent += `<li><strong>${timeStr}</strong>: ${appt.title}${dealStr}</li>`
    })
    htmlContent += `</ul>`
  }

  if (hasExpiring) {
    htmlContent += `<h3>⚠️ ${expiringServices.length} Servizi in scadenza</h3><ul>`
    expiringServices.forEach(srv => {
      const dateStr = new Date(srv.expiry_date).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' })
      htmlContent += `<li><strong>${dateStr}</strong>: ${srv.title} (€${srv.cost})</li>`
    })
    htmlContent += `</ul>`
  }

  htmlContent += `<br/><p>Buon lavoro dal tuo CRM Altamente!</p>`

  if (!resend) {
    console.log('RESEND_API_KEY non configurata. Email non inviata.')
    console.log('Contenuto email:', htmlContent)
    return NextResponse.json({ message: 'Email not sent (missing Resend API key)', mock: htmlContent })
  }

  try {
    const subject = []
    if (hasAppointments) subject.push(`${appointments.length} attività`)
    if (hasExpiring) subject.push(`${expiringServices.length} scadenze`)
    
    const rawEmail = NOTIFICATION_EMAIL
    const FROM_EMAIL = rawEmail.includes('<') ? rawEmail : `Altamente CRM <${rawEmail}>`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      subject: `Riepilogo: ${subject.join(', ')} 📅`,
      html: htmlContent
    })
    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
