'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, PlusCircle } from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface MobileMenuProps {
  user: User | null
}

export default function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="md:hidden">
      <button 
        onClick={toggleMenu}
        className="p-2 border-2 border-transparent hover:border-black dark:hover:border-white transition-all rounded-md relative z-50"
        aria-label="Menü megnyitása"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm pt-24 px-6 animate-in slide-in-from-right-10 duration-200">
           <nav className="flex flex-col gap-4 items-start text-xl font-black uppercase tracking-tight">
              <Link 
                href="/" 
                className="w-full py-3 border-b border-gray-200 dark:border-gray-700 hover:text-yellow-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Felfedezés
              </Link>
              <Link 
                href="/archive" 
                className="w-full py-3 border-b border-gray-200 dark:border-gray-700 hover:text-yellow-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Korábbi Események
              </Link>
              
              {user && (
                <>
                  <Link 
                    href="/my-predictions" 
                    className="w-full py-3 border-b border-gray-200 dark:border-gray-700 hover:text-yellow-500 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Tippjeim
                  </Link>
                  <Link 
                    href="/my-events" 
                    className="w-full py-3 border-b border-gray-200 dark:border-gray-700 hover:text-yellow-500 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Eseményeim
                  </Link>
                  
                  <Link 
                    href="/create" 
                    className="mt-4 flex items-center gap-2 bg-yellow-400 text-black border-2 border-black px-4 py-3 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all uppercase w-full justify-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <PlusCircle className="w-5 h-5" />
                    Új Esemény
                  </Link>
                </>
              )}
           </nav>
        </div>
      )}
    </div>
  )
}
