import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Step3Markets from '@/components/wizard/step-3-markets'

export default async function MarketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: event } = await supabase.from('events').select('creator_id').eq('id', id).single()
  
  if (!event) notFound()

  // Security check
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id !== event.creator_id) {
    return <div>Nincs jogosultságod szerkeszteni ezt az eseményt.</div>
  }

  // Fetch existing markets
  const { data: markets } = await supabase
    .from('markets')
    .select('*')
    .eq('event_id', id)
    .order('order', { ascending: true })

  return (
    <div className="py-10 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Kérdések</h1>
        <p className="text-gray-600 font-medium">Mire lehet tippelni?</p>
      </div>

       <div className="bg-white dark:bg-gray-900 p-8 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
         <div className="flex items-center justify-between mb-10 text-sm font-bold uppercase relative">
           {/* Progress Line */}
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
           
           <div className="relative z-10 bg-white dark:bg-gray-900 px-2 flex flex-col items-center opacity-40">
             <div className="w-8 h-8 flex items-center justify-center bg-white text-black border-2 border-black mb-1">1</div>
             <span>Részletek</span>
           </div>
           
           <div className="relative z-10 bg-white dark:bg-gray-900 px-2 flex flex-col items-center opacity-40">
             <div className="w-8 h-8 flex items-center justify-center bg-white text-black border-2 border-black mb-1">2</div>
             <span>Design</span>
           </div>
           
           <div className="relative z-10 bg-white dark:bg-gray-900 px-2 flex flex-col items-center">
             <div className="w-8 h-8 flex items-center justify-center bg-black text-white border-2 border-black mb-1 shadow-[2px_2px_0px_0px_#000]">3</div>
             <span className="text-black dark:text-white">Kérdések</span>
           </div>
         </div>

         <Step3Markets eventId={id} initialData={markets || []} />
      </div>
    </div>
  )
}
