'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PhasesManager } from './PhasesManager'
import { ProjectPhasesManager } from './ProjectPhasesManager'
import { ProjectTypesManager } from './ProjectTypesManager'
import { WorkspaceSettings } from './WorkspaceSettings'
import { User, Briefcase, Layout, Folder, Webhook } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('workspace')

  const tabs = [
    { id: 'workspace', label: 'Workspace', icon: Briefcase },
    { id: 'profile', label: 'Profilo', icon: User },
    { id: 'crm', label: 'Fasi CRM', icon: Layout },
    { id: 'projects', label: 'Progetti', icon: Folder },
    { id: 'integrations', label: 'Integrazioni', icon: Webhook },
  ]

  return (
    <DashboardLayout title="Impostazioni">
      <div style={{ maxWidth: '1000px', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Sidebar Tabs */}
        <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {activeTab === 'workspace' && (
            <WorkspaceSettings />
          )}

          {activeTab === 'profile' && (
            <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '1.5rem' }}>Account Tecnico (Supabase Auth)</h2>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input label="Email" value="tu@email.com" disabled />
                <Input label="Nuova Password" type="password" placeholder="••••••••" />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button variant="primary">Aggiorna Profilo</Button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'crm' && (
            <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>Gestione Fasi Deal (CRM)</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem' }}>
                Aggiungi, rinomina o riordina le colonne della board dei Deal. Non puoi eliminare una fase se contiene ancora dei deal.
              </p>
              <PhasesManager />
            </section>
          )}

          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>Tipi di Progetto</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem' }}>
                  Definisci le tipologie di progetto gestite dalla tua agenzia (es. Sviluppo Web, SEO, Social Media).
                </p>
                <ProjectTypesManager />
              </section>

              <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>Fasi per Tipo di Progetto</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem' }}>
                  Aggiungi, rinomina o riordina le fasi del processo produttivo specifiche per ogni tipo di progetto.
                </p>
                <ProjectPhasesManager />
              </section>
            </div>
          )}

          {activeTab === 'integrations' && (
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
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}
