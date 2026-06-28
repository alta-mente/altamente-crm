'use client'

import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DashboardChartsProps {
  deals: any[]
}

const COLORS: Record<string, string> = {
  'unassigned': '#94a3b8',
  'contacted': '#3b82f6',
  'meeting': '#8b5cf6',
  'proposal': '#f59e0b',
  'negotiation': '#ec4899',
  'won': '#10b981',
  'lost': '#ef4444',
}

const LABELS: Record<string, string> = {
  'unassigned': 'Nuovo',
  'contacted': 'Contattato',
  'meeting': 'Meeting',
  'proposal': 'Preventivo',
  'negotiation': 'In Trattativa',
  'won': 'Vinto',
  'lost': 'Perso',
}

export function DashboardCharts({ deals }: DashboardChartsProps) {
  
  const data = useMemo(() => {
    const phases: Record<string, number> = {}
    deals.forEach(d => {
      const p = d.phase_id
      if (!phases[p]) phases[p] = 0
      phases[p] += 1
    })
    
    return Object.entries(phases).map(([name, value]) => ({
      name: LABELS[name] || name,
      originalName: name,
      value
    })).sort((a, b) => b.value - a.value)
  }, [deals])

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.originalName] || '#fff'} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
