import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, CheckCircle2, Clock, Trophy } from 'lucide-react'

export const revalidate = 0; // Always fresh data for user specific pages

export default async function MyPredictions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch predictions with event details
  const { data: predictions } = await supabase
    .from('predictions')
    .select(`
      id,
      picks_json,
      points,
      created_at,
      events (
        id,
        title,
        slug,
        status,
        lock_at,
        theme,
        markets (
          id,
          question,
          options_json
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Tippjeim</h1>
        <div className="text-sm text-gray-500">
          {predictions?.length || 0} eseményen tippeltél
        </div>
      </div>

      {!predictions || predictions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Még nincsenek tippjeid</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Válassz egy izgalmas eseményt a főoldalról és tedd meg az első tippedet!
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Események böngészése
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {predictions.map((prediction) => {
            const event = prediction.events;
            // Handle case where event might be null (deleted?)
            if (!event) return null;

            // @ts-ignore - Supabase types join
            const markets = event.markets || [];
            // @ts-ignore
            const picks = prediction.picks_json || {};
            
            const totalMarkets = markets.length;
            const answeredCount = Object.keys(picks).length;
            
            const isFullyAnswered = answeredCount === totalMarkets && totalMarkets > 0;
            
            const themeColor = {
              modern: 'border-blue-500',
              elegant: 'border-yellow-600',
              retro: 'border-pink-500', 
              neon: 'border-green-400',
            }[event.theme || 'modern'];

            const statusColors = {
              open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
              locked: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
              revealed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 
              draft: 'bg-gray-100 text-gray-800'
            }[event.status] || 'bg-gray-100 text-gray-800';

            const statusLabel = {
                open: 'Nyitva',
                locked: 'Lezárva',
                revealed: 'Kiértékelve',
                draft: 'Vázlat'
            }[event.status];

            return (
              <div 
                key={prediction.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 ${themeColor} border-y border-r border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${statusColors}`}>
                          {statusLabel}
                        </span>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          <span>Eredményhirdetés: {event.lock_at ? new Date(event.lock_at).toLocaleDateString('hu-HU') : 'TBD'}</span>
                        </div>
                      </div>
                      <Link href={`/e/${event.slug}`} className="group">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {event.title}
                        </h2>
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        <div className="text-center">
                            <span className="block text-xs uppercase text-gray-500 font-semibold tracking-wider">Tippek</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {answeredCount} <span className="text-gray-400 text-sm font-normal">/ {totalMarkets}</span>
                            </span>
                        </div>
                        {event.status === 'revealed' && (
                             <div className="pl-4 border-l border-gray-200 dark:border-gray-700 text-center">
                                <span className="block text-xs uppercase text-gray-500 font-semibold tracking-wider">Pontszám</span>
                                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {prediction.points || 0}
                                </span>
                            </div>
                        )}
                    </div>
                  </div>

                  {/* Quick View of Picks */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-blue-500" />
                        Legutóbbi tippjeid:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {markets.slice(0, 4).map((market: any) => { // Show first 4
                            const pickedOptionId = picks[market.id];
                            const pickedOption = market.options_json?.find((o: any) => o.id === pickedOptionId);
                            
                            return (
                                <div key={market.id} className="text-sm flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400 truncate max-w-[60%] block" title={market.question}>
                                        {market.question}
                                    </span>
                                    <span className={`font-medium truncate max-w-[35%] block ${pickedOption ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 italic'}`}>
                                        {pickedOption ? pickedOption.label : '–'}
                                    </span>
                                </div>
                            )
                        })}
                        {markets.length > 4 && (
                            <Link href={`/e/${event.slug}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center bg-blue-50 dark:bg-blue-900/10 p-3 rounded border border-blue-100 dark:border-blue-900/20">
                                +{markets.length - 4} további kérdés megtekintése
                            </Link>
                        )}
                    </div>
                  </div>

                  {event.status === 'open' && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                          <Link 
                            href={`/e/${event.slug}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                          >
                              {isFullyAnswered ? 'Tippek módosítása' : 'Tippek folytatása'} 
                              <Clock className="w-4 h-4 ml-1.5" />
                          </Link>
                      </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
