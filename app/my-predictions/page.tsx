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
        <h1 className="text-4xl font-black uppercase tracking-tight border-b-4 border-black dark:border-white pb-2">Tippjeim</h1>
        <div className="text-sm font-bold uppercase text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 border-2 border-dashed border-gray-400">
          {predictions?.length || 0} eseményen tippeltél
        </div>
      </div>

      {!predictions || predictions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border-2 border-dashed border-black dark:border-white">
          <Trophy className="w-16 h-16 mx-auto text-black dark:text-white mb-6 border-2 border-black dark:border-white p-2 bg-yellow-400 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
          <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-2">Még nincsenek tippjeid</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium">
            Válassz egy izgalmas eseményt a főoldalról és tedd meg az első tippedet!
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-black dark:border-white text-lg font-black uppercase text-white bg-black dark:bg-white dark:text-black hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 rounded-none"
          >
            Események böngészése
          </Link>
        </div>
      ) : (
        <div className="grid gap-8">
          {predictions.map((prediction) => {
            const eventData = prediction.events;
            // @ts-ignore
            const event = Array.isArray(eventData) ? eventData[0] : eventData;
            
            // Handle case where event might be null (deleted?)
            if (!event) return null;

            // @ts-ignore - Supabase types join
            const markets = event.markets || [];
            // @ts-ignore
            const picks = prediction.picks_json || {};
            
            const totalMarkets = markets.length;
            const answeredCount = Object.keys(picks).length;
            
            const isFullyAnswered = answeredCount === totalMarkets && totalMarkets > 0;
            
            // Theme map updated to Fresh border colors logic if needed, but we rely on global neo-brutalist style heavily now.
            // Keeping subtle variation for "theme" hint could be cool.
            const themeMap: Record<string, string> = {
              modern: 'bg-blue-100',
              elegant: 'bg-yellow-100',
              retro: 'bg-pink-100', 
              neon: 'bg-green-100',
            };
            const themeBg = themeMap[event.theme || 'modern'] || 'bg-gray-100';

            const statusColorMap: Record<string, string> = {
              open: 'bg-green-400 text-black border-black',
              locked: 'bg-orange-400 text-black border-black',
              revealed: 'bg-blue-400 text-black border-black', 
              draft: 'bg-gray-200 text-gray-400 border-gray-400'
            };
            const statusColors = statusColorMap[event.status || 'draft'] || 'bg-gray-100 text-gray-800';

            const statusLabelMap: Record<string, string> = {
                open: 'Nyitva',
                locked: 'Lezárva',
                revealed: 'Kiértékelve',
                draft: 'Vázlat'
            };
            const statusLabel = statusLabelMap[event.status || 'draft'] || 'Ismeretlen';

            return (
              <div 
                key={prediction.id} 
                className={`bg-white dark:bg-gray-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-0.5 border-2 text-xs font-black uppercase tracking-wide ${statusColors}`}>
                          {statusLabel}
                        </span>
                        <div className="flex items-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          <span>Eredményhirdetés: {event.lock_at ? new Date(event.lock_at).toLocaleDateString('hu-HU') : 'TBD'}</span>
                        </div>
                      </div>
                      <Link href={`/e/${event.slug}`} className="group">
                        <h2 className="text-3xl font-black uppercase text-black dark:text-white hover:underline decoration-4 decoration-yellow-400 underline-offset-4 transition-all">
                          {event.title}
                        </h2>
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-6 border-2 border-dashed border-black dark:border-white px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
                        <div className="text-center">
                            <span className="block text-xs uppercase font-black tracking-widest mb-1">Tippek</span>
                            <span className="text-2xl font-black text-black dark:text-white">
                                {answeredCount} <span className="text-gray-400 text-lg font-bold">/ {totalMarkets}</span>
                            </span>
                        </div>
                        {event.status === 'revealed' && (
                             <div className="pl-6 border-l-2 border-black dark:border-white text-center">
                                <span className="block text-xs uppercase font-black tracking-widest mb-1">Pontszám</span>
                                <span className="text-2xl font-black text-black dark:text-white bg-green-400 px-2">
                                    {prediction.points || 0}
                                </span>
                            </div>
                        )}
                    </div>
                  </div>

                  {/* Quick View of Picks */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase flex items-center border-b-2 border-black dark:border-white pb-2 inline-block">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Legutóbbi tippjeid
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {markets.slice(0, 4).map((market: any) => { // Show first 4
                            const pickedOptionId = picks[market.id];
                            const pickedOption = market.options_json?.find((o: any) => o.id === pickedOptionId);
                            
                            return (
                                <div key={market.id} className="text-sm flex items-center justify-between bg-white dark:bg-black p-3 border-2 border-black dark:border-white">
                                    <span className="font-bold uppercase truncate max-w-[60%] block pr-2" title={market.question}>
                                        {market.question}
                                    </span>
                                    <span className={`font-mono text-xs px-2 py-1 ${pickedOption ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-gray-400 italic border border-dashed border-gray-400'}`}>
                                        {pickedOption ? pickedOption.label : 'Nincs tipp'}
                                    </span>
                                </div>
                            )
                        })}
                        {markets.length > 4 && (
                            <Link href={`/e/${event.slug}`} className="text-xs font-black uppercase text-center flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-3 border-2 border-dashed border-black dark:border-white hover:bg-yellow-400 hover:text-black hover:border-black transition-colors">
                                +{markets.length - 4} kérdés...
                            </Link>
                        )}
                    </div>
                  </div>

                  {event.status === 'open' && (
                      <div className="mt-8 pt-4 border-t-2 border-black dark:border-white flex justify-end">
                          <Link 
                            href={`/e/${event.slug}`}
                            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-sm hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center"
                          >
                              {isFullyAnswered ? 'Tippek módosítása' : 'Tippek folytatása'} 
                              <Clock className="w-4 h-4 ml-2" />
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
