'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { UploadCloud, Image as ImageIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export function WorkspaceSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    company_name: '',
    vat_number: '',
    address: '',
    email: '',
    logo_url: '',
    quote_terms: '',
    target_revenue: 300000,
    target_mrr: 10000
  })
  
  const [uploadingImage, setUploadingImage] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('workspace_settings')
      .select('*')
      .eq('id', 1)
      .single()
      
    if (data) {
      setSettings(data)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const { error } = await supabase
      .from('workspace_settings')
      .update({
        company_name: settings.company_name,
        vat_number: settings.vat_number,
        address: settings.address,
        email: settings.email,
        logo_url: settings.logo_url,
        quote_terms: settings.quote_terms,
        target_revenue: settings.target_revenue,
        target_mrr: settings.target_mrr
      })
      .eq('id', 1)

    setSaving(false)
    if (error) {
      toast.error('Errore durante il salvataggio delle impostazioni')
    } else {
      toast.success('Impostazioni salvate con successo')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Controlla dimensione < 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Il file è troppo grande. Massimo 2MB.')
      return
    }

    setUploadingImage(true)
    
    const fileExt = file.name.split('.').pop()
    const fileName = `logo-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('assets')
      .upload(filePath, file)

    if (uploadError) {
      toast.error("Errore durante il caricamento dell'immagine")
      setUploadingImage(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath)
      
    setSettings(prev => ({ ...prev, logo_url: publicUrl }))
    setUploadingImage(false)
    toast.success('Immagine caricata! Ricordati di salvare le impostazioni.')
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento impostazioni...</div>

  return (
    <section className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
      <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '0.5rem' }}>Dati Fiscali e Logo</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem' }}>
        Questi dati verranno utilizzati per generare i preventivi e i documenti ufficiali.
      </p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Gestione Logo */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div 
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: 'var(--radius-md)', 
              border: '2px dashed var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              backgroundColor: 'var(--color-surface)',
              flexShrink: 0
            }}
          >
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo Aziendale" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <ImageIcon size={32} color="var(--color-text-muted)" />
            )}
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Carica il tuo Logo (JPG/PNG)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface-solid)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', transition: 'all 0.2s', fontSize: '0.9rem' }}>
                <UploadCloud size={16} />
                {uploadingImage ? 'Caricamento in corso...' : 'Sfoglia File...'}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/svg+xml" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                />
              </label>
              {settings.logo_url && (
                <button type="button" onClick={() => setSettings({...settings, logo_url: ''})} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Rimuovi
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Campi di Testo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Ragione Sociale / Nome Freelance" 
            value={settings.company_name} 
            onChange={e => setSettings({...settings, company_name: e.target.value})} 
            required
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Input 
              label="Partita IVA / C.F." 
              value={settings.vat_number} 
              onChange={e => setSettings({...settings, vat_number: e.target.value})} 
            />
            <Input 
              label="Email Ufficiale" 
              type="email"
              value={settings.email} 
              onChange={e => setSettings({...settings, email: e.target.value})} 
            />
          </div>
          <Input 
            label="Indirizzo (es. Via Roma 1, 00100 Roma)" 
            value={settings.address} 
            onChange={e => setSettings({...settings, address: e.target.value})} 
          />
        </div>

        {/* Obiettivi Aziendali */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>Obiettivi Aziendali (Dashboard)</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Input 
              label="Target Venduto Annuo (€)" 
              type="number"
              value={settings.target_revenue} 
              onChange={e => setSettings({...settings, target_revenue: Number(e.target.value)})} 
            />
            <Input 
              label="Target Canoni MRR (€)" 
              type="number"
              value={settings.target_mrr} 
              onChange={e => setSettings({...settings, target_mrr: Number(e.target.value)})} 
            />
          </div>
        </div>

        {/* Condizioni di Contratto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Condizioni di Contratto (Testo fisso a fine preventivo)
          </label>
          <div style={{ minHeight: '300px' }}>
            <ReactQuill 
              theme="snow"
              value={settings.quote_terms || ''}
              onChange={val => setSettings({...settings, quote_terms: val})}
              style={{ backgroundColor: 'white', color: 'black', borderRadius: '4px', height: '250px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
          </Button>
        </div>
      </form>
    </section>
  )
}
