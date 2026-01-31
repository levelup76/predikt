'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEventDesignAction } from '@/app/actions'
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'

const themes = [
  { id: 'modern', name: 'Modern', color: 'bg-blue-600' },
  { id: 'elegant', name: 'Elegáns', color: 'bg-yellow-600' },
  { id: 'retro', name: 'Retró', color: 'bg-pink-600' },
  { id: 'neon', name: 'Neon', color: 'bg-green-500' },
]

export default function Step2Design({ eventId, initialTheme }: { eventId: string, initialTheme: string }) {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || 'modern')
  const [isPending, setIsPending] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')

  const handleSave = async () => {
    setIsPending(true)
    // pass coverUrl if entered, otherwise null
    const result = await updateEventDesignAction(eventId, selectedTheme, coverUrl || null)
    if (result.success) {
      router.push(`/create/${eventId}/markets`)
    } else {
      alert(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">2. Megjelenés</h2>

      <div className="space-y-8">
        
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Válassz stílust</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={clsx(
                  "p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all",
                  selectedTheme === theme.id 
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                )}
              >
                <div className={`w-8 h-8 rounded-full ${theme.color}`}></div>
                <span className="font-medium text-sm">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cover Image Placeholder */}
        <div>
           <label className="block text-sm font-medium mb-3">Borítókép</label>
           <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center text-gray-500">
             <div className="flex flex-col items-center">
                <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                <p className="mb-4 text-sm">Jelenleg csak URL megadása támogatott.</p>
                <input 
                  type="text" 
                  placeholder="https://pelda.hu/kep.jpg"
                  className="w-full max-w-sm p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
             </div>
           </div>
           
           {/* Preview */}
           <div className={`mt-6 p-6 rounded-xl border relative overflow-hidden text-white ${
              selectedTheme === 'modern' ? 'bg-gradient-to-br from-gray-900 to-gray-800' :
              selectedTheme === 'elegant' ? 'bg-gradient-to-br from-yellow-900 to-black' :
              selectedTheme === 'retro' ? 'bg-gradient-to-br from-indigo-500 to-pink-500' :
              'bg-black border-green-500 border-2'
           }`}>
              <div className="relative z-10">
                 <span className="text-xs uppercase tracking-widest opacity-70 mb-2 block">Előnézet</span>
                 <h3 className="text-2xl font-bold">Esemény Címe</h3>
                 <p className="opacity-80 mt-1 text-sm">Ez a választott dizájn hangulata.</p>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           {/* Back button logic would be nice, but simple router.back() usually works */}
           <button 
             onClick={handleSave}
             disabled={isPending}
             className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center text-lg"
           >
             {isPending ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
             Tovább a kérdésekhez
           </button>
        </div>

      </div>
    </div>
  )
}
