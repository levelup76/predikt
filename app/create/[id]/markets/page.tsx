import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Step3Markets from '@/components/wizard/step-3-markets'
import WizardProgress from '@/components/wizard/wizard-progress'

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
         <WizardProgress currentStep={2} />

         <Step3Markets eventId={id} initialData={markets || []} />
      </div>
    </div>
  )
}
