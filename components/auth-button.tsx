'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthButton({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Sync server state with client state
    // This handles the case where the user is logged in (via cookies) but the initial server render didn't catch it yet
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && !user) {
        router.refresh()
      }
      if (event === 'SIGNED_OUT' && user) {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, user])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return user ? (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase hidden sm:inline bg-gray-100 dark:bg-gray-800 px-2 py-1 border border-gray-300 dark:border-gray-600">{user.email}</span>
      <button onClick={handleLogout} className="text-sm font-bold uppercase border-2 border-black dark:border-white px-3 py-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
        Kilépés
      </button>
    </div>
  ) : (
    <button onClick={handleLogin} className="text-sm font-bold uppercase bg-black text-white border-2 border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all dark:bg-white dark:text-black dark:border-white">
      Google Belépés
    </button>
  )
}
