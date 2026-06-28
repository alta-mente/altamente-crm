import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Clock, Euro, CheckCircle2, Package, Archive, CalendarDays, Activity } from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl max-w-md text-center border border-white/50 shadow-2xl">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Accesso Negato</h2>
          <p className="text-gray-500">Il link al report non è valido oppure è scaduto.</p>
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
  
  const usedPercentage = prepaidMin > 0 ? Math.max(0, Math.min(100, (totalActiveMinutes / prepaidMin) * 100)) : 0
  const remainingMin = Math.max(0, prepaidMin - totalActiveMinutes)

  return (
    <div className="min-h-screen font-sans bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-purple-50 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Premium Header Bar */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full" />
      
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pt-8 pb-20">
        
        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden transition-all">
          
          {/* Header Area */}
          <div className="relative p-8 sm:p-12 overflow-hidden bg-white">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 blur-3xl opacity-50 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-4 border border-indigo-100">
                  <Activity size={14} /> Report Attività
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
                  {company.name}
                </h1>
                <p className="text-gray-500 text-lg flex items-center gap-2">
                  <CalendarDays size={18} /> Aggiornato al {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              {/* Stat Block */}
              <div className="shrink-0 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-200/50 text-white w-full md:w-auto relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                  {prepaidMin > 0 ? <Package size={120} /> : rate > 0 ? <Euro size={120} /> : <Clock size={120} />}
                </div>
                
                <div className="relative z-10">
                  {prepaidMin > 0 ? (
                    <div>
                      <div className="text-sm font-medium text-indigo-100 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Package size={16} /> Credito Residuo
                      </div>
                      <div className="text-5xl font-black mb-4 tracking-tighter">
                        {formatTime(remainingMin)}
                      </div>
                      
                      <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden backdrop-blur-md relative">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                            (usedPercentage) > 80 ? 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]' : 
                            (usedPercentage) > 50 ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 
                            'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]'
                          }`}
                          style={{ width: `${usedPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs font-medium text-indigo-200">
                        <span>{formatTime(totalActiveMinutes)} usate</span>
                        <span>{formatTime(prepaidMin)} totali</span>
                      </div>
                    </div>
                  ) : rate > 0 ? (
                    <div>
                      <div className="text-sm font-medium text-indigo-100 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Euro size={16} /> Totale Maturato
                      </div>
                      <div className="text-5xl font-black tracking-tighter">
                        € {((totalActiveMinutes / 60) * rate).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="mt-2 text-sm text-indigo-200">
                        {formatTime(totalActiveMinutes)} ore in attesa
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-indigo-100 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Clock size={16} /> Ore in Attesa
                      </div>
                      <div className="text-5xl font-black tracking-tighter">
                        {formatTime(totalActiveMinutes)}
                      </div>
                      <div className="mt-2 text-sm text-indigo-200">
                        Nessuna tariffa impostata
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Hours Section */}
          <div className="p-8 sm:p-12 border-t border-gray-100 bg-white/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Attività da fatturare</h3>
            </div>
            
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-50/80 border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Data</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs">Descrizione</th>
                    <th className="py-4 px-6 font-semibold text-gray-600 uppercase tracking-wider text-xs text-right">Ore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeHours.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                          <CheckCircle2 size={32} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Nessuna attività in sospeso al momento.</p>
                      </td>
                    </tr>
                  ) : (
                    activeHours.map(row => (
                      <tr key={row.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                        <td className="py-4 px-6 text-gray-600 font-medium whitespace-nowrap">
                          {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-6 text-gray-800 leading-relaxed">{row.description}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-indigo-600 whitespace-nowrap">
                          {formatTime(row.minutes)}
                        </td>
                      </tr>
                    ))
                  )}
                  {activeHours.length > 0 && (
                    <tr className="bg-indigo-50/50 font-bold text-gray-900 border-t-2 border-indigo-100">
                      <td colSpan={2} className="py-5 px-6 text-right uppercase tracking-widest text-xs text-indigo-900">
                        Totale Ore Selezionate
                      </td>
                      <td className="py-5 px-6 text-right font-mono text-lg text-indigo-700">
                        {formatTime(totalActiveMinutes)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Archived Hours Section */}
          {archivedHours.length > 0 && (
            <div className="p-8 sm:p-12 border-t border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Archive size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Storico Attività Archiviate</h3>
              </div>
              
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {archivedHours.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-gray-500 font-medium whitespace-nowrap w-40">
                          {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest bg-gray-100 text-gray-500 px-2 py-1 rounded-md mr-3 border border-gray-200" title="Lotto archiviazione">
                            <Archive size={10} /> 
                            {row.batch_id ? new Date(row.batch_id.slice(0,4) + '-' + row.batch_id.slice(4,6) + '-' + row.batch_id.slice(6,8)).toLocaleDateString('it-IT') : 'Pregresso'}
                          </span>
                          {row.description}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-gray-400 whitespace-nowrap w-24">
                          {formatTime(row.minutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
        
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Generato automaticamente tramite il sistema di tracciamento</p>
        </div>
      </div>
    </div>
  )
}
