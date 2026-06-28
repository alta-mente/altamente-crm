'use client'

import React, { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export function NotificationManager() {
  const supabase = createClient()
  const notifiedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const checkAppointments = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return

      const now = new Date()
      // Guardiamo da 5 minuti fa a 15 minuti nel futuro
      const lowerBound = new Date(now.getTime() - 5 * 60000)
      const upperBound = new Date(now.getTime() + 15 * 60000)

      const { data } = await supabase
        .from('appointments')
        .select('id, title, scheduled_at, deals(title)')
        .gte('scheduled_at', lowerBound.toISOString())
        .lte('scheduled_at', upperBound.toISOString())

      if (data) {
        data.forEach(appt => {
          if (!notifiedIds.current.has(appt.id)) {
            const timeStr = new Date(appt.scheduled_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
            const dealTitle = appt.deals?.title ? ` in ${appt.deals.title}` : ''
            
            const bodyText = `Tra poco (${timeStr}): ${appt.title}${dealTitle}`
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Promemoria Appuntamento', {
                body: bodyText,
              })
            }
            
            // Fallback: mostriamo anche un toast interno all'app se la pagina è aperta
            toast('⏰ Promemoria Appuntamento', { 
              description: bodyText,
              duration: 10000 
            })
            
            notifiedIds.current.add(appt.id)
          }
        })
      }
    }

    const setup = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      checkAppointments()
    }

    setup()
    const interval = setInterval(checkAppointments, 60000)

    return () => clearInterval(interval)
  }, [])

  return null // This component doesn't render anything visible
}
