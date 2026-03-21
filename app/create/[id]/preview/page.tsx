
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import WizardProgress from '@/components/wizard/wizard-progress'
import BettingForm from '@/components/event/betting-form'
import { ArrowRight, Pencil, ArrowLeft } from 'lucide-react'

export default async function CreateEventPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()
  if (event.creator_id !== user.id) redirect('/')
  if (event.is_published) redirect(`/e/${event.slug}`)

  const { data: markets } = await supabase
    .from('markets')
    .select('*')
    .eq('event_id', id)
    .order('order', { ascending: true })

  // Transform markets for BettingForm: DB JSON -> Object
  // BettingForm expects specific structure, but since we are fetching from DB, 
  // 'options_json' is already a JSON object (if using typed Supabase client) or string if not.
  // Assuming standard setup, it's JSON.
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <WizardProgress currentStep={3} />
      
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tighter">
                    Előnézet
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                   Próbáld ki, hogy működik az űrlap, mielőtt élesíted!
                </p>
            </div>

            <div className="bg-yellow-100 border-2 border-black p-4 mb-8 text-center font-bold uppercase flex items-center justify-center gap-2">
                <Pencil className="w-5 h-5" />
                Ez csak előnézet. A tippek nem kerülnek mentésre.
            </div>

            <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mb-8">
                 <BettingForm 
                       eventId="preview"
                       eventTitle={event.title}
                       eventSlug={event.slug || 'preview'}
                       isLocked={false}
                       userPrediction={null}
                       markets={markets || []}
                   />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Link 
                    href={`/create/${id}/markets`}
                    className="w-full py-4 bg-white text-black dark:bg-black dark:text-white font-black uppercase text-xl border-2 border-black dark:border-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all flex items-center justify-center"
                 >
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    Vissza a kérdésekhez
                 </Link>

                 <Link 
                    href={`/create/${id}/publish`}
                    className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-xl border-2 border-black dark:border-white hover:bg-green-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center"
                 >
                    Tovább a Kirakáshoz
                    <ArrowRight className="w-6 h-6 ml-2" />
                 </Link>
            </div>
        </div>
    </div>
  )
}
