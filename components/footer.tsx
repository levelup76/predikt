
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Predikt</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 max-w-xs">
              Mert az igazi nyeremény nem a pénz, hanem a dicsőség, hogy te mondtad meg előre.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold uppercase text-sm mb-2 opacity-60">Info</h4>
            <Link href="/about" className="hover:underline hover:text-yellow-500 font-bold w-fit">
              Rólunk
            </Link>
            <Link href="/privacy" className="hover:underline hover:text-yellow-500 font-bold w-fit">
              Adatkezelési Tájékoztató
            </Link>
            <Link href="/terms" className="hover:underline hover:text-yellow-500 font-bold w-fit">
              Felhasználási Feltételek
            </Link>
          </div>

          {/* Social / Contact */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold uppercase text-sm mb-2 opacity-60">Kapcsolat</h4>
            <a href="mailto:levelup@levelup.hu" className="hover:underline font-bold w-fit">
              levelup@levelup.hu
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-gray-500 uppercase">
          <p>© {currentYear} Predikt. Minden jog fenntartva.</p>
          <p>Készítette: LevelUp</p>
        </div>
      </div>
    </footer>
  )
}
