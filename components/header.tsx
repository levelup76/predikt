import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuthButton from './auth-button'
import MobileMenu from './mobile-menu'
import { PlusCircle } from 'lucide-react'
import Image from 'next/image'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="flex items-center justify-between p-4 border-b-2 border-black dark:border-white bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-black text-2xl tracking-tighter uppercase flex items-center gap-3 hover:bg-yellow-400 transition-colors px-2 -ml-2 z-50 relative">
          {/* Use logo.png if available, fallback to emoji if fails (would need client side check) */}
          <div className="relative w-10 h-10">
             <Image 
               src="/logo.png?v=2" 
               alt="Predikt Logo" 
               width={550} 
               height={550} 
               className="object-contain" 
               unoptimized
             />
          </div>
          Predikt
        </Link>
        <nav className="hidden md:flex items-center gap-1 font-bold text-sm uppercase">
          <Link href="/" className="px-3 py-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Felfedezés</Link>
          <Link href="/archive" className="px-3 py-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Korábbi</Link>
          {user && (
             <>
               <span className="text-gray-300">|</span>
               <Link href="/my-predictions" className="px-3 py-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Tippjeim</Link>
               <Link href="/my-events" className="px-3 py-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Eseményeim</Link>
             </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <Link 
            href="/create" 
            className="hidden sm:flex items-center gap-1.5 bg-yellow-400 text-black border-2 border-black px-4 py-1.5 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all uppercase"
          >
            <PlusCircle className="w-5 h-5" />
            Új Esemény
          </Link>
        )}
        <AuthButton user={user} />
        <MobileMenu user={user} />
      </div>
    </header>
  )
}
