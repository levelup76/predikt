'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AuthButton({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

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
      <span className="text-sm hidden sm:inline">{user.email}</span>
      <button onClick={handleLogout} className="text-sm bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded hover:opacity-80 transition-opacity">
        Kilépés
      </button>
    </div>
  ) : (
    <button onClick={handleLogin} className="text-sm bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded hover:opacity-80 transition-opacity">
      Google Belépés
    </button>
  )
}
