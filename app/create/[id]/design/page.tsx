import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Step2Design from '@/components/wizard/step-2-design'

export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: event } = await supabase.from('events').select('theme, creator_id').eq('id', id).single()
  
  if (!event) notFound()

  // Security check: only creator can edit
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id !== event.creator_id) {
    return <div>Nincs jogosultságod szerkeszteni ezt az eseményt.</div>
  }

  return (
    <div className="py-10">
       <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="flex items-center justify-center mb-8 space-x-4 text-sm">
           <span className="text-gray-400">1. Részletek</span>
           <span className="text-gray-400">&rarr;</span>
           <span className="font-bold text-blue-600">2. Design</span>
           <span className="text-gray-400">&rarr;</span>
           <span className="text-gray-400">3. Kérdések</span>
         </div>

         <Step2Design eventId={id} initialTheme={event.theme} />
      </div>
    </div>
  )
}
