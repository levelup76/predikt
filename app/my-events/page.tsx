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
        predictions:predictions(count)
    `)
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Általam Szervezett Események</h1>
        <Link 
           href="/create"
           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg transition-transform hover:-translate-y-0.5"
        >
            <Plus className="w-5 h-5 mr-2" />
            Új Esemény
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Még nem hoztál létre eseményt</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Indítsd el a saját tippjátékodat! Hívd meg a barátaidat és derüljön ki, ki a legjobb jós.
          </p>
          <Link 
            href="/create" 
            className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-blue-500/30 shadow-lg"
          >
            Létrehozás Most
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
             const statusColors = {
              open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
              locked: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
              revealed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 
              draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }[event.status] || 'bg-gray-100';

            const statusLabel = {
                open: 'Nyitva',
                locked: 'Lezárva',
                revealed: 'Kiértékelve',
                draft: 'Vázlat'
            }[event.status];
            
            // @ts-ignore
            const predictionCount = event.predictions?.[0]?.count || 0;

            return (
              <div 
                key={event.id} 
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
              >
                 <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${statusColors}`}>
                            {statusLabel}
                        </span>
                        <div className="flex items-center text-xs text-gray-500 font-medium">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(event.created_at).toLocaleDateString('hu-HU')}
                        </div>
                    </div>
                    <Link href={`/e/${event.slug}`} className="text-xl font-bold hover:text-blue-600 transition-colors">
                        {event.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                        {predictionCount} tippelő eddig
                    </div>
                 </div>

                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link 
                        href={`/e/${event.slug}`}
                        className="flex-1 sm:flex-none py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-center transition-colors"
                    >
                        Megtekintés
                    </Link>
                    <Link 
                        href={`/e/${event.slug}/admin`}
                        className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 font-bold text-sm flex items-center justify-center shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                        <Settings className="w-3.5 h-3.5 mr-2" />
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
