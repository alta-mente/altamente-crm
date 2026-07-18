'use client'

import React, { useState } from 'react'
import { Euro, CheckCircle2 } from 'lucide-react'
import { processInvoiceRequestAction } from '@/app/actions/invoices'

interface Props {
  projectId: string
  projectName: string
  companyName: string
  totalAmount: number
  reportUrl: string
  logoUrl?: string
  clientEmail?: string
}

export function RequestInvoiceButton({ projectId, projectName, companyName, totalAmount, reportUrl, logoUrl, clientEmail }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleRequest = async () => {
    if (status === 'loading' || status === 'success') return
    
    setStatus('loading')
    try {
      const result = await processInvoiceRequestAction({
        projectId,
        projectName,
        companyName,
        totalAmount,
        reportUrl,
        logoUrl,
        clientEmail
      })
      
      if (result.success) {
        setStatus('success')
      } else {
        setStatus('error')
        alert("Errore durante l'invio della richiesta. Riprova più tardi.")
      }
    } catch (err) {
      setStatus('error')
      alert('Errore imprevisto.')
    }
  }

  if (totalAmount <= 0) {
    return null
  }

  if (status === 'success') {
    return (
      <button 
        disabled
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: 'var(--color-success)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-base)',
          fontWeight: 600,
          cursor: 'not-allowed',
          boxShadow: 'var(--glow-green)'
        }}
      >
        <CheckCircle2 size={18} /> Richiesta Inviata
      </button>
    )
  }

  return (
    <>
      <style>{`
        @keyframes invoicePulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); transform: scale(1); }
          50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); transform: scale(1.03); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); transform: scale(1); }
        }
        .invoice-btn-active:hover {
          transform: scale(1.05) !important;
          background: #16a34a !important;
        }
      `}</style>
      <button 
        onClick={handleRequest}
        disabled={status === 'loading'}
        className={status === 'loading' ? '' : 'invoice-btn-active'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '16px 32px',
          background: 'var(--color-success)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: status === 'loading' ? 'wait' : 'pointer',
          transition: 'all 0.3s ease',
          animation: status === 'loading' ? 'none' : 'invoicePulseGlow 2s infinite',
          boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
          width: '100%',
          maxWidth: '350px'
        }}
      >
        <Euro size={22} /> {status === 'loading' ? 'Invio in corso...' : 'Richiedi Fattura'}
      </button>
    </>
  )
}
