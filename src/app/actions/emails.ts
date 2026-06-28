'use server'

import { Resend } from 'resend'

// Inizializziamo Resend solo se abbiamo la chiave (altrimenti simuliamo l'invio nei log)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = 'Altamente CRM <notifiche@altamente.ai>' // Assicurati di aver verificato questo dominio su Resend

export async function sendLowHoursAlertEmail({ 
  to, 
  companyName, 
  remainingHours 
}: { 
  to: string, 
  companyName: string, 
  remainingHours: number 
}) {
  if (!resend) {
    console.log('[SIMULAZIONE EMAIL] Avviso Monte Ore Esaurimento a:', to, 'Residuo:', remainingHours)
    return { success: true, simulated: true }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Avviso: Monte ore in esaurimento - ${companyName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #000;">Avviso Monte Ore</h2>
          <p>Ciao,</p>
          <p>Ti informiamo che il monte ore prepagato per <strong>${companyName}</strong> è in esaurimento.</p>
          <div style="background: #fdf8eb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Ore residue stimate:</strong> <span style="font-size: 1.2em; color: #d97706;">${remainingHours.toFixed(1)} ore</span>
          </div>
          <p>Ti invitiamo a contattarci per concordare un nuovo pacchetto ore ed evitare interruzioni nelle lavorazioni.</p>
          <br/>
          <p style="color: #666; font-size: 0.9em;">Un saluto,<br/>Il team di Altamente</p>
        </div>
      `
    })
    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendReportArchivedEmail({ 
  to, 
  companyName, 
  reportUrl,
  monthName
}: { 
  to: string, 
  companyName: string, 
  reportUrl: string,
  monthName: string
}) {
  if (!resend) {
    console.log('[SIMULAZIONE EMAIL] Report Archiviato a:', to, 'URL:', reportUrl)
    return { success: true, simulated: true }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Report Attività Disponibile: ${monthName} - ${companyName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #000;">Nuovo Report Disponibile</h2>
          <p>Ciao,</p>
          <p>Abbiamo appena consolidato e aggiornato il report delle attività svolte per <strong>${companyName}</strong> nel periodo di <strong>${monthName}</strong>.</p>
          <p>Puoi consultare il dettaglio completo delle ore, l'archivio storico e lo stato di avanzamento cliccando sul bottone qui sotto:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; letter-spacing: 0.5px;">
              Visualizza Report Pubblico
            </a>
          </div>
          <p>Per qualsiasi dubbio sulle lavorazioni, non esitare a contattarci.</p>
          <br/>
          <p style="color: #666; font-size: 0.9em;">Un saluto,<br/>Il team di Altamente</p>
        </div>
      `
    })
    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}
