import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, CheckCircle2, Trophy, ArrowRight } from 'lucide-react'

export const revalidate = 60;

export default async function ArchivePage() {
  const supabase = await createClient()

  // Fetch past events
  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, status, lock_at, category, theme')
    .in('status', ['locked', 'revealed'])
    .order('lock_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 font-mono py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
           <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
             Korábbi<br/>Események
           </h1>
           <p className="font-bold text-lg bg-yellow-400 text-black inline-block px-2 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             Lezárt és kiértékelt események archívuma.
           </p>
        </div>
      </div>

      {!events || events.length === 0 ? (
           <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-400">
             <p className="text-gray-500 font-bold uppercase text-lg">Még nincsenek lezárt események.</p>
           </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
               const themeMap: Record<string, string> = {
                modern: 'from-blue-600 to-blue-800',
                elegant: 'from-yellow-600 to-yellow-800',
                retro: 'from-pink-500 to-indigo-600',
                neon: 'from-green-500 to-emerald-700',
              };
              const themeColor = themeMap[event.theme || 'modern'] || themeMap.modern;

              return (
                <Link
                  key={event.id}
                  href={`/e/${event.slug}`}
                  className="block group relative bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
                >
                  <div className={`h-32 bg-gradient-to-br ${themeColor} relative border-b-2 border-black dark:border-white p-4`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        {event.status === 'revealed' && (
                            <div className="bg-green-400 text-black text-xs font-black uppercase px-2 py-1 border-2 border-black flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Kiértékelve
                            </div>
                        )}
                        {event.status === 'locked' && (
                            <div className="bg-gray-200 text-black text-xs font-black uppercase px-2 py-1 border-2 border-black flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Trophy className="w-3 h-3 mr-1" /> Lezárva
                            </div>
                        )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                       <span className="bg-black text-white px-2 py-0.5">{event.category}</span>
                       <span className="flex items-center">
                         <Calendar className="w-3 h-3 mr-1" />
                         {new Date(event.lock_at).toLocaleDateString('hu-HU')}
                       </span>
                    </div>

                    <h3 className="text-2xl font-black uppercase mb-4 leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex items-center justify-end">
                        <ArrowRight className="w-6 h-6 border-2 border-black dark:border-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
      )}
    </div>
  )
}
