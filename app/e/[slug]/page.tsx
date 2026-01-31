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
      id, title, description, category, lock_at, source_url, theme, status, cover_image, creator_id, result_json,
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
      .select('picks_json')
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
           // For simple select: pick is optionId string
           const val = picks[marketId]
           if (typeof val === 'string') {
              if (!aggregateStats[marketId]) aggregateStats[marketId] = {}
              aggregateStats[marketId][val] = (aggregateStats[marketId][val] || 0) + 1
           } 
         })
       })
     }
  }

  // Theme styles map
  const themeMap: Record<string, string> = {
    modern: 'bg-gradient-to-br from-blue-600 to-purple-700',
    elegant: 'bg-gradient-to-br from-yellow-700 to-gray-900',
    retro: 'bg-gradient-to-br from-indigo-500 to-pink-500',
    neon: 'bg-black border-b-4 border-green-500',
  };

  const themeStyles = themeMap[event.theme || 'modern'] || 'bg-blue-600'

  return (
    <div className="pb-20">
       
       {/* Hero Section */}
       <div className={`-mx-4 -mt-4 mb-8 p-8 ${themeStyles} text-white shadow-lg`}>
          <div className="container mx-auto max-w-4xl">
             <div className="flex items-center gap-2 mb-4 opacity-80 text-sm font-bold tracking-wider uppercase">
               <span>{event.category}</span>
               <span>•</span>
               <span className={isLocked ? "text-red-300" : "text-green-300"}>
                 {isLocked ? "Lezárva" : "Tippelés Nyitva"}
               </span>
             </div>
             
             <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{event.title}</h1>
             <p className="text-lg opacity-90 max-w-2xl">{event.description}</p>
             
             <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium opacity-90 items-center">
               <div className="flex items-center gap-2">
                 <Clock className="w-5 h-5" />
                 Lezárás: {new Date(event.lock_at).toLocaleString('hu-HU')}
               </div>
               {event.source_url && (
                 <a href={event.source_url} target="_blank" className="flex items-center gap-2 hover:underline hover:text-white transition-colors">
                   <LinkIcon className="w-5 h-5" />
                   Hivatalos forrás
                 </a>
               )}
               
               <div className="ml-auto">
                   <ShareButton title={event.title} slug={event.slug} />
               </div>


               <Link 
                   href={`/e/${slug}/stats`}
                   className="flex items-center gap-2 hover:underline hover:text-white transition-colors bg-white/10 px-3 py-1 rounded-full"
               >
                   <BarChart3 className="w-4 h-4" />
                   Eredmények & Statisztikák
               </Link>

               {isCreator && (
                   <Link 
                       href={`/e/${slug}/admin`}
                       className="ml-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-white px-4 py-2 rounded-lg flex items-center shadow-lg border border-white/10"
                   >
                       <Settings className="w-4 h-4 mr-2" />
                       Esemény Kezelése
                   </Link>
               )}
             </div>
          </div>
       </div>

       {/* Content */}
       <div className="container mx-auto max-w-4xl">
          {isLocked && !userPrediction && (
             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-yellow-800">
               A tippelés lezárult, és sajnos te nem adtál le tippet.
             </div>
          )}

          {!user && !isLocked && (
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center mb-8">
               <h3 className="text-lg font-bold text-blue-900 mb-2">Szeretnél tippelni?</h3>
               <p className="text-blue-700 mb-4">Jelentkezz be Google fiókoddal a tippjeid rögzítéséhez!</p>
               {/* Button is in header, but user needs nudge */}
            </div>
          )}
          
          <BettingForm 
            eventId={event.id}
            markets={event.markets}
            userPrediction={userPrediction}
            isLocked={isLocked || !user}
            results={event.result_json}
            stats={aggregateStats}
            totalPredictions={totalPredictions}
          />
          
          <div className="mt-12 border-t pt-8">
               <ReportButton eventId={event.id} />
          </div>
       </div>
    </div>
  )
}
