import { createClient } from '@/lib/supabase/server'
import { notFound } from "next/navigation"
import BettingForm from '@/components/event/betting-form'
import ReportButton from '@/components/event/report-button'
import ShareButton from '@/components/share-button'
import { Calendar, Clock, Link as LinkIcon, Settings, BarChart3, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch Event + Markets (and creator_id for check)
  const { data: event } = await supabase
    .from('events')
    .select(`
      id, slug, title, description, category, lock_at, source_url, theme, status, cover_image, creator_id, result_json, visibility,
      markets (id, question, options_json, order, type)
    `)
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  // Sort markets by order
  event.markets.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

  // 2. Fetch User Prediction (if logged in)
  const { data: { user } } = await supabase.auth.getUser()
  let userPrediction = null
  
  const isCreator = user && user.id === event.creator_id
  
  if (user) {
    const { data: prediction } = await supabase
      .from('predictions')
      .select('picks_json, favorites_json, points')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single()
    
    userPrediction = prediction
  }
  
  const isLocked = new Date(event.lock_at) < new Date() || event.status !== 'open'

  // 3. If closed, fetch aggregate stats
  let aggregateStats: Record<string, Record<string, number>> = {}
  let totalPredictions = 0
  
  if (['locked', 'revealed'].includes(event.status)) {
     const { data: allPredictions } = await supabase
       .from('predictions')
       .select('picks_json')
       .eq('event_id', event.id)
     
     if (allPredictions) {
       totalPredictions = allPredictions.length
       
       allPredictions.forEach(p => {
         const picks = p.picks_json || {}
         Object.keys(picks).forEach(marketId => {
           const val = picks[marketId]
           if (typeof val === 'string') {
              if (!aggregateStats[marketId]) aggregateStats[marketId] = {}
              aggregateStats[marketId][val] = (aggregateStats[marketId][val] || 0) + 1
           } else if (Array.isArray(val)) {
              if (!aggregateStats[marketId]) aggregateStats[marketId] = {}
              val.forEach((optId: string) => {
                aggregateStats[marketId][optId] = (aggregateStats[marketId][optId] || 0) + 1
              })
           }
         })
       })
     }
  }

  // Theme styles map
  return (
    <div className="pb-20 min-h-screen bg-gray-50 dark:bg-gray-950 font-mono">
       
       {/* Hero Section */}
       <div className={`w-full border-b-4 border-black dark:border-white bg-black dark:bg-gray-900 text-white relative overflow-hidden`}>
          {/* Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)", backgroundSize: "20px 20px" }}></div>
          
          <div className="container mx-auto max-w-4xl py-12 px-4 relative z-10">
             <div className="flex items-center gap-3 mb-6 flex-wrap">
               <span className="bg-yellow-400 text-black text-xs font-black px-2 py-1 uppercase tracking-widest border-2 border-white">
                 {event.category || 'Általános'}
               </span>
               <span className={`bg-white text-black text-xs font-black px-2 py-1 uppercase tracking-widest border-2 border-white flex items-center`}>
                 {isLocked ? <><Lock className="w-3 h-3 mr-1"/> Lezárva</> : 'Nyitva'}
               </span>
               {event.visibility === 'private' && (
                    <span className="bg-red-500 text-white text-xs font-black px-2 py-1 uppercase tracking-widest border-2 border-white flex items-center">
                        <Lock className="w-3 h-3 mr-1" /> Privát Esemény
                    </span>
               )}
             </div>
             
             <h1 className="text-4xl md:text-6xl font-black mb-6 leading-none uppercase tracking-tight">{event.title}</h1>
             <p className="text-xl font-bold opacity-90 max-w-2xl border-l-4 border-yellow-400 pl-4 mb-8">{event.description}</p>
             
             <div className="flex flex-wrap gap-4 text-sm font-bold opacity-100 items-center">
               <div className="flex items-center gap-2 bg-white text-black px-3 py-2 border-2 border-white uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                 <Clock className="w-4 h-4" />
                 Lezárás: {new Date(event.lock_at).toLocaleString('hu-HU')}
               </div>
               
               {event.source_url && (
                 <a href={event.source_url} target="_blank" className="flex items-center gap-2 bg-black text-white border-2 border-white px-3 py-2 hover:bg-white hover:text-black transition-colors uppercase">
                   <LinkIcon className="w-4 h-4" />
                   Hivatalos forrás
                 </a>
               )}
               
               <div className="w-full md:ml-auto md:w-auto flex flex-wrap gap-4 mt-4 md:mt-0">
                   <ShareButton title={event.title} slug={event.slug} />
                   
                   <Link 
                       href={`/e/${slug}/stats`}
                       className="flex items-center gap-2 hover:bg-white hover:text-black transition-colors border-2 border-white px-4 py-2 uppercase font-black"
                   >
                       <BarChart3 className="w-4 h-4" />
                       Eredmények
                   </Link>

                   {isCreator && (
                       <Link 
                           href={`/e/${slug}/admin`}
                           className="bg-yellow-400 text-black hover:bg-yellow-300 transition-colors px-4 py-2 flex items-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-transparent uppercase font-black"
                       >
                           <Settings className="w-4 h-4 mr-2" />
                           Kezelés
                       </Link>
                   )}
               </div>
             </div>
          </div>
       </div>

       {/* Content */}
       <div className="container mx-auto max-w-4xl px-4 mt-8">
          {isLocked && !userPrediction && (
             <div className="bg-yellow-100 border-2 border-black p-6 mb-8 text-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
               <Lock className="w-6 h-6" />
               A tippelés lezárult, és sajnos te nem adtál le tippet.
             </div>
          )}

          {!user && !isLocked && (
            <div className="bg-blue-100 border-2 border-black p-8 text-center mb-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <h3 className="text-2xl font-black text-black mb-4 uppercase">Szeretnél tippelni?</h3>
               <p className="text-black font-medium mb-6">Jelentkezz be Google fiókoddal a tippjeid rögzítéséhez!</p>
               {/* Button is in header, but user needs nudge */}
            </div>
          )}
          
          <BettingForm 
            eventId={event.id}
            eventTitle={event.title}
            eventSlug={event.slug}
            markets={event.markets}
            userPrediction={userPrediction}
            isLocked={isLocked || !user}
            results={event.result_json}
            stats={aggregateStats}
            totalPredictions={totalPredictions}
            userPoints={userPrediction?.points ?? null}
          />
          
          <div className="mt-16 border-t-4 border-black dark:border-white pt-8 mb-12">
               <ReportButton eventId={event.id} />
          </div>
       </div>
    </div>
  )
}
