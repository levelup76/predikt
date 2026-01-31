import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MyPredictions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tippjeim</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center text-gray-500">
        Még nem adtál le tippet egyetlen eseményre sem.
      </div>
    </div>
  )
}
