'use server'

import { Resend } from 'resend'

// Inizializziamo Resend solo se abbiamo la chiave (altrimenti simuliamo l'invio nei log)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const rawEmail = process.env.NOTIFICATION_EMAIL || 'notifiche@altamente.ai'
const FROM_EMAIL = rawEmail.includes('<') ? rawEmail : `Altamente CRM <${rawEmail}>`

export async function sendLowHoursAlertEmail({ 
  to, 
  companyName, 
  remainingHours,
  logoUrl
}: { 
  to: string, 
  companyName: string, 
  remainingHours: number,
  logoUrl?: string
}) {
  if (!resend) {
    console.log('[SIMULAZIONE EMAIL] Avviso Monte Ore Esaurimento a:', to, 'Residuo:', remainingHours)
    return { success: true, simulated: true }
  }

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Avviso: Monte ore in esaurimento - ${companyName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          ${logoUrl ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${logoUrl}" alt="Logo" style="max-height: 50px; width: auto;" /></div>` : ''}
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

    if (response.error) {
      console.error('Resend API Error:', response.error)
      return { success: false, error: response.error.message }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function sendReportArchivedEmail({ 
  to, 
  companyName, 
  reportUrl,
  monthName,
  logoUrl
}: { 
  to: string, 
  companyName: string, 
  reportUrl: string,
  monthName: string,
  logoUrl?: string
}) {
  if (!resend) {
    console.log('[SIMULAZIONE EMAIL] Report Archiviato a:', to, 'URL:', reportUrl)
    return { success: true, simulated: true }
  }

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Report Attività Disponibile: ${monthName} - ${companyName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          ${logoUrl ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${logoUrl}" alt="Logo" style="max-height: 50px; width: auto;" /></div>` : ''}
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

    if (response.error) {
      console.error('Resend API Error:', response.error)
      return { success: false, error: response.error.message }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function sendInvoiceRequestEmail({
  projectName,
  companyName,
  totalAmount,
  reportUrl,
  logoUrl,
  clientEmail
}: {
  projectName: string,
  companyName: string,
  totalAmount: number,
  reportUrl: string,
  logoUrl?: string,
  clientEmail?: string
}) {
  const adminEmails = ['info@altamente.it', 'arocchi@gmail.com']
  
  if (!resend) {
    console.log('[SIMULAZIONE EMAIL] Richiesta Fattura a:', adminEmails.join(', '), 'Progetto:', projectName)
    return { success: true, simulated: true }
  }

  try {
    const toList = [...adminEmails]
    if (clientEmail && /^\S+@\S+\.\S+$/.test(clientEmail)) {
      toList.push(clientEmail)
    }

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: toList,
      subject: `🚨 Richiesta Fatturazione: ${companyName} - ${projectName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          ${logoUrl ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${logoUrl}" alt="Logo" style="max-height: 50px; width: auto;" /></div>` : ''}
          <h2 style="color: #000;">Richiesta Fatturazione dal Cliente</h2>
          <p>Il cliente <strong>${companyName}</strong> ${clientEmail ? `(${clientEmail})` : ''} ha appena richiesto la fatturazione per il progetto <strong>${projectName}</strong> tramite il Report Pubblico.</p>
          <div style="background: #fdf8eb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Totale Maturato:</strong> <span style="font-size: 1.2em; color: #10b981;">€ ${totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; letter-spacing: 0.5px;">
              Visualizza Report Cliente
            </a>
          </div>
        </div>
      `
    })

    if (response.error) {
      console.error('Resend API Error:', response.error)
      return { success: false, error: response.error.message }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function sendMonthlyConsuntiviEmail({
  to,
  companyName,
  projectName,
  totalAmount,
  totalHoursStr,
  reportUrl,
  logoUrl
}: {
  to: string,
  companyName: string,
  projectName: string,
  totalAmount: number,
  totalHoursStr: string,
  reportUrl: string,
  logoUrl?: string
}) {
  if (!resend) {
    console.log('[SIMULAZIONE EMAIL] Recap Mensile Consuntivi a:', to, 'Progetto:', projectName)
    return { success: true, simulated: true }
  }

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Riepilogo Ore Mensile: ${companyName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          ${logoUrl ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${logoUrl}" alt="Logo" style="max-height: 50px; width: auto;" /></div>` : ''}
          <h2 style="color: #000;">Riepilogo Attività Consuntivate</h2>
          <p>Ciao,</p>
          <p>Ti inviamo il riepilogo automatico delle ore di lavoro maturate nel mese precedente per il progetto <strong>${projectName}</strong>.</p>
          
          <div style="background: #fdf8eb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Tempo Totale Accumulato:</strong> <span style="color: #3b82f6;">${totalHoursStr}</span></p>
            <p style="margin: 0;"><strong>Valore Totale da Fatturare:</strong> <span style="font-size: 1.2em; color: #10b981;">€ ${totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
          </div>

          <p>Puoi visionare il dettaglio completo degli interventi cliccando sul bottone qui sotto. All'interno del report troverai anche l'opzione per inviarci automaticamente la conferma per l'emissione della fattura.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; letter-spacing: 0.5px;">
              Visualizza Report Completo
            </a>
          </div>
          <p>Per qualsiasi dubbio sulle lavorazioni, non esitare a contattarci.</p>
          <br/>
          <p style="color: #666; font-size: 0.9em;">Un saluto,<br/>Il team di Altamente</p>
        </div>
      `
    })

    if (response.error) {
      console.error('Resend API Error:', response.error)
      return { success: false, error: response.error.message }
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

