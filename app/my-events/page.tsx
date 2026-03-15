import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Plus, Settings, TrendingUp } from 'lucide-react'

export const revalidate = 0;

export default async function MyEventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch created events
  const { data: events } = await supabase
    .from('events')
    .select(`
        id, 
        title, 
        slug, 
        status, 
        created_at, 
        lock_at, 
        visibility, 
        predictions:predictions(count)
    `)
    .eq('creator_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
    
    // Exclude soft-deleted events
    // Note: Supabase query builder executes in order; move filter before order

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tight border-b-4 border-black dark:border-white pb-2">Általam Szervezett</h1>
        <Link 
           href="/create"
           className="bg-yellow-400 text-black px-6 py-3 border-2 border-black font-black uppercase flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all rounded-none"
        >
            <Plus className="w-5 h-5 mr-2" />
            Új Esemény
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border-2 border-dashed border-black dark:border-white">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 w-20 h-20 border-2 border-black dark:border-white flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
               <TrendingUp className="w-10 h-10 text-black dark:text-white" />
          </div>
          <h3 className="text-2xl font-black text-black dark:text-white mb-2 uppercase">Még nem hoztál létre eseményt</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto font-medium">
            Indítsd el a saját tippjátékodat! Hívd meg a barátaidat és derüljön ki, ki a legjobb jós.
          </p>
          <Link 
            href="/create" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-black uppercase text-white bg-black dark:bg-white dark:text-black border-2 border-black dark:border-white hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 rounded-none"
          >
            Létrehozás Most
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => {
             const statusColorMap: Record<string, string> = {
              open: 'bg-green-400 text-black border-black',
              locked: 'bg-orange-400 text-black border-black',
              revealed: 'bg-blue-400 text-black border-black', 
              draft: 'bg-gray-200 text-gray-500 border-gray-400'
            };
            const statusColors = statusColorMap[event.status || 'draft'] || 'bg-gray-100';

            const statusLabelMap: Record<string, string> = {
                open: 'Nyitva',
                locked: 'Lezárva',
                revealed: 'Kiértékelve',
                draft: 'Vázlat'
            };
            const statusLabel = statusLabelMap[event.status || 'draft'] || 'Ismeretlen';
            
            // @ts-ignore
            const predictionCount = event.predictions?.[0]?.count || 0;

            return (
              <div 
                key={event.id} 
                className="bg-white dark:bg-gray-900 p-6 border-2 border-black dark:border-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none"
              >
                 <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 border-2 text-xs font-black uppercase tracking-wide ${statusColors}`}>
                            {statusLabel}
                        </span>
                        {/* @ts-ignore */}
                        {event.visibility === 'private' && (
                             <span className="px-2 py-0.5 border-2 text-xs font-black uppercase tracking-wide bg-red-500 text-white border-black dark:border-white">
                                Privát
                             </span>
                        )}
                        <div className="flex items-center text-xs text-gray-500 font-bold uppercase">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(event.created_at).toLocaleDateString('hu-HU')}
                        </div>
                    </div>
                    <Link href={`/e/${event.slug}`} className="text-2xl font-black uppercase hover:underline decoration-4 decoration-yellow-400 underline-offset-4 transition-all">
                        {event.title}
                    </Link>
                    <div className="text-sm font-bold text-gray-500 mt-1 uppercase">
                        {predictionCount} tippelő eddig
                    </div>
                 </div>

                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link 
                        href={`/e/${event.slug}`}
                        className="flex-1 sm:flex-none py-3 px-5 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-sm font-bold uppercase text-center transition-all rounded-none"
                    >
                        Megtekintés
                    </Link>
                    <Link 
                        href={`/e/${event.slug}/admin`}
                        className="flex-1 sm:flex-none py-3 px-5 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-yellow-400 hover:text-black font-black uppercase text-sm flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 rounded-none"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Kezelés
                    </Link>
                 </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
