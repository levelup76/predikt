import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuthButton from './auth-button'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="font-bold text-xl tracking-tight">Predikt</Link>
      <div className="flex items-center gap-4">
        {user && (
          <Link href="/my-predictions" className="text-sm hover:underline">
            Tippjeim
          </Link>
        )}
        <AuthButton user={user} />
      </div>
    </header>
  )
}
