import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, CheckCircle2, Trophy } from 'lucide-react'

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight">Korábbi Események</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-2">Lezárt és kiértékelt események archívuma.</p>
        </div>
      </div>

      {!events || events.length === 0 ? (
           <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <p className="text-gray-500 mb-4">Még nincsenek lezárt események.</p>
           </div>
      ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => {
               const themeColor = {
                modern: 'from-blue-500 to-purple-600',
                elegant: 'from-yellow-600 to-gray-900',
                retro: 'from-pink-500 to-indigo-500',
                neon: 'from-green-400 to-blue-900',
              }[event.theme || 'modern'];

              return (
                <Link
                  key={event.id}
                  href={`/e/${event.slug}`}
                  className="block group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-500"
                >
                  <div className={`h-24 bg-gradient-to-r ${themeColor} relative`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                    {event.status === 'revealed' && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Eredményekkel
                        </div>
                    )}
                     {event.status === 'locked' && (
                        <div className="absolute top-4 right-4 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center">
                            <Trophy className="w-3 h-3 mr-1" /> Lezárva
                        </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                       <span>{event.category}</span>
                       <span>•</span>
                       <span className="flex items-center">
                         <Calendar className="w-3 h-3 mr-1" />
                         {new Date(event.lock_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}
                       </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>
      )}
    </div>
  )
}
