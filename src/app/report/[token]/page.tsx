import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Package, Euro } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PublicReportPage({ 
  params 
}: { 
  params: Promise<{ token: string }>
}) {
  const resolvedParams = await params
  
  if (!resolvedParams.token || resolvedParams.token.length < 5) {
    notFound()
  }

  const supabase = await createClient()

  // Find company by token
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('report_token', resolvedParams.token)
    .single()

  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-8 rounded-lg max-w-md text-center border border-red-100 shadow-sm">
          <h2 className="text-xl font-bold mb-2">⛔ Accesso Negato</h2>
          <p>Link non valido o scaduto.</p>
        </div>
      </div>
    )
  }

  // Fetch hours
  const { data: hours, error: hoursError } = await supabase
    .from('company_hours')
    .select('*')
    .eq('company_id', company.id)
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  if (hoursError) {
    console.error('Error fetching hours:', hoursError)
  }

  const allHours = hours || []
  const activeHours = allHours.filter(h => !h.billed)
  const archivedHours = allHours.filter(h => h.billed)

  const totalActiveMinutes = activeHours.reduce((acc, curr) => acc + curr.minutes, 0)
  
  const formatTime = (minutes: number) => {
    const h = Math.floor(Math.abs(minutes) / 60)
    const m = Math.abs(minutes) % 60
    return `${minutes < 0 ? '-' : ''}${h}h ${m.toString().padStart(2, '0')}m`
  }

  const prepaidMin = company.prepaid_minutes || 0
  const rate = company.hourly_rate || 0

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#1e293b] text-white p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Report Attività</h1>
              <h2 className="text-xl text-gray-300 font-light">{company.name}</h2>
            </div>
            
            {prepaidMin > 0 ? (
              <div className="bg-white/10 p-4 rounded-lg flex items-center gap-4 min-w-[200px]">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatTime(Math.max(0, prepaidMin - totalActiveMinutes))}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Credito Residuo</div>
                </div>
                <div className="flex-1 ml-4 text-right">
                  <div className="bg-gray-700 h-2.5 rounded-full overflow-hidden mb-1.5 w-24 ml-auto">
                    <div 
                      className={`h-full rounded-full ${
                        ((prepaidMin - totalActiveMinutes) / prepaidMin) < 0.2 ? 'bg-red-500' : 
                        ((prepaidMin - totalActiveMinutes) / prepaidMin) < 0.5 ? 'bg-yellow-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, ((prepaidMin - totalActiveMinutes) / prepaidMin) * 100))}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400">su {formatTime(prepaidMin)} totali</div>
                </div>
              </div>
            ) : rate > 0 ? (
              <div className="bg-white/10 p-4 rounded-lg min-w-[200px] text-center sm:text-right">
                <div className="text-3xl font-bold text-white mb-1">
                  € {((totalActiveMinutes / 60) * rate).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Totale Maturato</div>
              </div>
            ) : (
              <div className="bg-white/10 p-4 rounded-lg min-w-[200px] text-center sm:text-right">
                <div className="text-3xl font-bold text-white mb-1">
                  {formatTime(totalActiveMinutes)}
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Ore in Attesa</div>
              </div>
            )}
          </div>

          {/* Active Hours */}
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Attività non ancora fatturate</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-semibold w-24">Data</th>
                    <th className="pb-3 font-semibold">Descrizione</th>
                    <th className="pb-3 font-semibold text-right w-24">Ore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeHours.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-gray-500 italic">
                        Nessuna attività pendente in questo momento.
                      </td>
                    </tr>
                  ) : (
                    activeHours.map(row => (
                      <tr key={row.id} className="text-gray-700">
                        <td className="py-3 px-2">
                          {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                        </td>
                        <td className="py-3 px-2">{row.description}</td>
                        <td className="py-3 px-2 text-right font-mono font-medium">{formatTime(row.minutes)}</td>
                      </tr>
                    ))
                  )}
                  {activeHours.length > 0 && (
                    <tr className="bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
                      <td colSpan={2} className="py-4 px-2 text-right">TOTALE:</td>
                      <td className="py-4 px-2 text-right font-mono text-base">{formatTime(totalActiveMinutes)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Archived Hours */}
          {archivedHours.length > 0 && (
            <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-600 mb-4">Storico Attività Archiviate</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    {archivedHours.map(row => (
                      <tr key={row.id} className="text-gray-500">
                        <td className="py-3 px-2 w-24">
                          {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded mr-2" title="Lotto archiviazione">
                            📦 {row.batch_id ? new Date(row.batch_id.slice(0,4) + '-' + row.batch_id.slice(4,6) + '-' + row.batch_id.slice(6,8)).toLocaleDateString('it-IT') : 'Pregresso'}
                          </span>
                          {row.description}
                        </td>
                        <td className="py-3 px-2 text-right w-24 font-mono">{formatTime(row.minutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
