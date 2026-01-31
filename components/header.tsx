import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuthButton from './auth-button'
import { PlusCircle } from 'lucide-react'
import Image from 'next/image'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
          {/* Use logo.png if available, fallback to emoji if fails (would need client side check) */}
          <div className="relative w-10 h-10">
             <Image src="/logo.png" alt="Predikt Logo" width={550} height={550} className="object-contain" />
          </div>
          Predikt
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">Felfedezés</Link>
          <Link href="/archive" className="hover:text-blue-600 transition-colors">Korábbi</Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">Rólunk</Link>
          {user && (
             <>
               <Link href="/my-predictions" className="hover:text-blue-600 transition-colors">Tippjeim</Link>
               <Link href="/my-events" className="hover:text-blue-600 transition-colors">Eseményeim</Link>
             </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <Link 
            href="/create" 
            className="hidden sm:flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Új Esemény
          </Link>
        )}
        <AuthButton user={user} />
      </div>
    </header>
  )
}
