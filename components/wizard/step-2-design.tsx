'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEventDesignAction } from '@/app/actions'
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'

const themes = [
  { id: 'modern', name: 'Kék', color: 'bg-blue-600' },
  { id: 'elegant', name: 'Sárga', color: 'bg-yellow-600' },
  { id: 'retro', name: 'Pink', color: 'bg-pink-600' },
  { id: 'neon', name: 'Zöld', color: 'bg-green-500' },
]

export default function Step2Design({ eventId, initialTheme }: { eventId: string, initialTheme: string }) {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || 'modern')
  const [isPending, setIsPending] = useState(false)

  const handleSave = async () => {
    setIsPending(true)
    const result = await updateEventDesignAction(eventId, selectedTheme, null)
    if (result.success) {
      router.push(`/create/${eventId}/markets`)
    } else {
      alert(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-black dark:border-white pb-2 inline-block">2. Megjelenés</h2>

      <div className="space-y-8">
        
        {/* Theme Selection */}
        <div>
          <label className="block text-xs font-bold uppercase mb-3 tracking-wide">Válassz stílust</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={clsx(
                  "p-4 border-2 flex flex-col items-center justify-center gap-2 transition-all rounded-none",
                  selectedTheme === theme.id 
                    ? "border-black bg-yellow-100 dark:bg-yellow-900/40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] translate-x-[-2px] translate-y-[-2px]" 
                    : "border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white opacity-60 hover:opacity-100"
                )}
              >
                <div className={`w-8 h-8 rounded-full border-2 border-black dark:border-white ${theme.color}`}></div>
                <span className="font-bold text-sm uppercase">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview - Simplified */}
        <div className={`mt-6 p-6 border-2 border-black dark:border-white relative overflow-hidden text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              selectedTheme === 'modern' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
              selectedTheme === 'elegant' ? 'bg-gradient-to-br from-yellow-600 to-yellow-800' :
              selectedTheme === 'retro' ? 'bg-gradient-to-br from-pink-500 to-indigo-600' :
              'bg-gradient-to-br from-green-500 to-emerald-700'
           }`}>
              <div className="relative z-10">
                 <span className="text-xs uppercase font-black tracking-widest opacity-70 mb-2 block bg-black/20 inline-block px-1">Előnézet</span>
                 <h3 className="text-2xl font-black uppercase shadow-black drop-shadow-md">Esemény Címe</h3>
                 <p className="opacity-90 mt-1 text-sm font-medium shadow-black drop-shadow-sm">Ez a választott színvilág így fog megjelenni.</p>
              </div>
        </div>

        <button 
             onClick={handleSave}
             disabled={isPending}
             className="w-full py-4 px-6 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-lg border-2 border-black dark:border-white hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(200,200,200,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
           >
             {isPending ? <Loader2 className="animate-spin" /> : (
                 <>
                    Tovább a Kérdésekhez
                 </>
             )}
        </button>

      </div>
    </div>
  )
}
