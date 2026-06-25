import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  return (
    <DashboardLayout title="Impostazioni">
      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Settings */}
        <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '1.5rem' }}>Profilo Utente</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Email" value="tu@email.com" disabled />
            <Input label="Nuova Password" type="password" placeholder="••••••••" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="primary">Aggiorna Profilo</Button>
            </div>
          </form>
        </section>

        {/* Webhooks & Integrations */}
        <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>Integrazioni (Webhook)</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem' }}>
            Utilizza questo URL per ricevere automaticamente nuovi Lead da Corsidia o altri sistemi tramite chiamate POST (JSON).
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input 
                label="Webhook URL (Corsidia)" 
                value="https://tuo-dominio.vercel.app/api/corsidia-lead" 
                readOnly 
              />
            </div>
            <Button variant="secondary">Copia URL</Button>
          </div>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '0.5rem' }}>Esempio di Payload Atteso (JSON)</h4>
            <pre style={{ fontSize: '0.75rem', overflowX: 'auto', color: 'var(--color-primary)' }}>
{`{
  "nome_corso": "Sviluppatore Web",
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@email.com",
  "telefono": "3331234567"
}`}
            </pre>
          </div>
        </section>

      </div>
    </DashboardLayout>
  )
}
