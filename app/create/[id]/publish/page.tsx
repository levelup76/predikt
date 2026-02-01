
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import WizardProgress from '@/components/wizard/wizard-progress'
import Step4Publish from '@/components/wizard/step-4-publish'

export default async function CreateEventPublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Verify ownership
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

  // Get markets to pass to preview
    const { data: markets } = await supabase
    .from('markets')
    .select('*')
    .eq('event_id', id)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <WizardProgress currentStep={4} />
      
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tighter">
                    Utolsó lépés!
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                    Állítsd be, kik láthatják az eseményt.
                </p>
            </div>

            <Step4Publish event={event} markets={markets || []} />
        </div>
    </div>
  )
}
