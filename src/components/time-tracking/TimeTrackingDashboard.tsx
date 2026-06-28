'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Clock, ArrowRight, Package, Euro } from 'lucide-react'

interface Company {
  id: string;
  name: string;
  prepaid_minutes?: number;
  hourly_rate?: number;
}

interface TimeTrackingDashboardProps {
  companies: Company[];
  unbilledTotals: { company_id: string; minutes: number }[];
}

export function TimeTrackingDashboard({ companies, unbilledTotals }: TimeTrackingDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const formatTime = (minutes: number) => {
    const h = Math.floor(Math.abs(minutes) / 60)
    const m = Math.abs(minutes) % 60
    return `${minutes < 0 ? '-' : ''}${h}h ${m.toString().padStart(2, '0')}m`
  }

  const totalsMap = unbilledTotals.reduce((acc, curr) => {
    acc[curr.company_id] = curr.minutes
    return acc
  }, {} as Record<string, number>)

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Cerca azienda..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/companies">
          <Button variant="outline">Gestisci Aziende Tracker</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Azienda</th>
              <th className="px-6 py-4">Contratto</th>
              <th className="px-6 py-4">Ore Attuali (da fatturare)</th>
              <th className="px-6 py-4">Stato / Costo</th>
              <th className="px-6 py-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCompanies.map(company => {
              const currentMin = totalsMap[company.id] || 0
              const prepaidMin = company.prepaid_minutes || 0
              const rate = company.hourly_rate || 0

              let contractType = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">📝 Semplice</span>
              if (prepaidMin > 0) {
                contractType = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"><Package size={14}/> Pacchetto</span>
              } else if (rate > 0) {
                contractType = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><Euro size={14}/> A Tariffa</span>
              }

              let statusText = '-'
              if (currentMin > 0 && prepaidMin > 0) {
                const rem = prepaidMin - currentMin
                statusText = `Rimaste ${formatTime(rem)}`
              } else if (currentMin > 0 && rate > 0) {
                const cost = (currentMin / 60) * rate
                statusText = `€ ${cost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              }

              return (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                  <td className="px-6 py-4">{contractType}</td>
                  <td className="px-6 py-4 font-mono font-medium text-base">
                    {currentMin > 0 ? formatTime(currentMin) : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {statusText}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/time-tracking/${company.id}`}>
                      <Button size="sm" className="gap-2">
                        <Clock size={16} />
                        Gestisci
                      </Button>
                    </Link>
                  </td>
                </tr>
              )
            })}
            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nessuna azienda trovata. Assicurati che l'opzione "Time Tracking" sia abilitata per l'azienda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
