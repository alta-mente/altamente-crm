'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Printer } from 'lucide-react'
import styles from './Quote.module.css'

export default function QuotePage() {
  const params = useParams()
  const id = params.id as string
  const [deal, setDeal] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchDeal() {
      const [dealRes, settingsRes] = await Promise.all([
        supabase
          .from('deals')
          .select(`
            *,
            companies ( name, address, vat_number ),
            contacts ( first_name, last_name, email, phone )
          `)
          .eq('id', id)
          .single(),
        supabase
          .from('workspace_settings')
          .select('*')
          .eq('id', 1)
          .single()
      ])

      if (dealRes.data) setDeal(dealRes.data)
      if (settingsRes.data) setSettings(settingsRes.data)
      setLoading(false)
    }
    
    fetchDeal()
  }, [id])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Caricamento preventivo...</div>
  if (!deal) return <div style={{ padding: '40px', textAlign: 'center' }}>Deal non trovato.</div>

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30) // validità 30 gg
  const validUntilStr = validUntil.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className={styles.page}>
      
      <button className={styles.printButton} onClick={handlePrint}>
        <Printer size={20} /> Stampa o Salva PDF
      </button>

      <div className={styles.document}>
        <table className={styles.documentTable}>
          <thead><tr><td></td></tr></thead>
          <tbody>
            <tr>
              <td>
                <div className={styles.header}>
          <div className={styles.logo}>
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" style={{ maxHeight: '60px', maxWidth: '200px' }} />
            ) : (
              settings?.company_name || 'ALTAMENTE'
            )}
          </div>
          <div className={styles.companyInfo}>
            <strong>{settings?.company_name || 'Il Tuo Nome / Freelance'}</strong><br/>
            {settings?.vat_number && <>P.IVA/CF: {settings.vat_number}<br/></>}
            {settings?.address && <>{settings.address}<br/></>}
            {settings?.email && <>{settings.email}</>}
          </div>
        </div>

        <h1 className={styles.title}>Preventivo: {deal.title}</h1>

        <div className={styles.metaRow}>
          <div className={styles.metaCol}>
            <span className={styles.metaLabel}>Intestato a</span>
            <span className={styles.metaValue}>
              {deal.companies ? (
                <>
                  <strong>{deal.companies.name}</strong><br/>
                  {deal.companies.address && <>{deal.companies.address}<br/></>}
                  {deal.companies.vat_number && <>P.IVA: {deal.companies.vat_number}</>}
                </>
              ) : deal.contacts ? (
                <strong>{deal.contacts.first_name} {deal.contacts.last_name}</strong>
              ) : (
                <em>Nessuna azienda/contatto associato</em>
              )}
            </span>
          </div>
          
          <div className={styles.metaCol} style={{ textAlign: 'right' }}>
            <span className={styles.metaLabel}>Data di Emissione</span>
            <span className={styles.metaValue}>{currentDate}</span>
            <br/>
            <span className={styles.metaLabel}>Valido fino al</span>
            <span className={styles.metaValue}>{validUntilStr}</span>
          </div>
        </div>

        <div className={styles.description}>
          <div className={styles.descriptionTitle}>Lettera di Preventivo</div>
          <div className={styles.descriptionContent}>
            {deal.quote_description ? (
              <div dangerouslySetInnerHTML={{ __html: deal.quote_description }} />
            ) : (
              <p>Sviluppo e implementazione del progetto indicato in oggetto, secondo gli accordi presi in fase di briefing.</p>
            )}
          </div>
        </div>

        <div className={styles.totalSection}>
          <div className={styles.totalBox}>
            <span className={styles.totalLabel}>Totale (IVA esclusa):</span>
            <span className={styles.totalValue}>€{Number(deal.value).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {settings?.quote_terms && (
          <div className={styles.quoteTerms}>
            <div className={styles.quoteTermsTitle}>Condizioni Generali</div>
            <div dangerouslySetInnerHTML={{ __html: settings.quote_terms }} className={styles.descriptionContent} />
          </div>
        )}

        <div className={styles.footer}>
          Documento generato da Altamente CRM. Il presente preventivo ha validità di 30 giorni dall'emissione.
          Tutti gli importi si intendono al netto dell'IVA e di eventuali oneri di legge.
        </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                {/* Questo elemento compare SOLO in fase di stampa, ripetuto a fine di OGNI pagina */}
                <div className={styles.pageFooter}>
                  <div className={styles.pageFooterLogo}>
                    {settings?.logo_url ? (
                      <img src={settings.logo_url} alt="Logo" />
                    ) : (
                      <strong>{settings?.company_name || 'ALTAMENTE'}</strong>
                    )}
                  </div>
                  <div className={styles.pageFooterText}>
                    {settings?.company_name} | {settings?.vat_number && `P.IVA ${settings.vat_number}`} <br/>
                    {settings?.email} | {settings?.address}
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>

      </div>
    </div>
  )
}
