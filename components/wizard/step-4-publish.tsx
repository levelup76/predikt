
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { publishEventAction } from '@/app/actions'
import { Loader2, Globe, Lock, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Step4PublishProps {
  event: any
  markets: any[]
}

export default function Step4Publish({ event, markets }: Step4PublishProps) {
  const router = useRouter()
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [isPublishing, setIsPublishing] = useState(false)

  const onPublish = async () => {
    setIsPublishing(true)
    
    // Publish Event with selected visibility
    const pubResult = await publishEventAction(event.id, visibility)
    
    if (pubResult.success) {
      // Success! Redirect to the public event page
      router.push(`/e/${pubResult.slug}`)
    } else {
      alert(pubResult.error)
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
        
        {/* Visibility Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Public Option */}
            <div 
                onClick={() => setVisibility('public')}
                className={`cursor-pointer border-4 p-8 transition-all relative ${
                    visibility === 'public' 
                    ? 'border-black dark:border-white bg-yellow-400 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] -translate-y-2' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <Globe className={`w-16 h-16 ${visibility === 'public' ? 'text-black' : 'text-gray-400'}`} />
                    <h3 className="text-2xl font-black uppercase">Publikus</h3>
                    <p className={`font-medium ${visibility === 'public' ? 'text-black' : 'text-gray-500'}`}>
                        Mindenki láthatja a főoldalon. Bárki tippelhet rá.
                    </p>
                    {visibility === 'public' && (
                        <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 text-xs font-bold uppercase">Kiválasztva</div>
                    )}
                </div>
            </div>

            {/* Private Option */}
            <div 
                onClick={() => setVisibility('private')}
                className={`cursor-pointer border-4 p-8 transition-all relative ${
                    visibility === 'private' 
                    ? 'border-black dark:border-white bg-yellow-400 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] -translate-y-2' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <Lock className={`w-16 h-16 ${visibility === 'private' ? 'text-black' : 'text-gray-400'}`} />
                    <h3 className="text-2xl font-black uppercase">Privát</h3>
                    <p className={`font-medium ${visibility === 'private' ? 'text-black' : 'text-gray-500'}`}>
                        Csak az látja, akinek elküldöd a linket. Nem jelenik meg a főoldalon.
                    </p>
                    {visibility === 'private' && (
                        <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 text-xs font-bold uppercase">Kiválasztva</div>
                    )}
                </div>
            </div>
        </div>

        {/* Warning */}
        <div className="border-4 border-black dark:border-white bg-orange-100 dark:bg-orange-950 p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="font-bold text-black dark:text-white text-sm uppercase">
                Publikálás után a láthatóság <span className="underline">nem változtatható meg</span>. Ha privátnak indítod, az esemény nem kerül ki a főoldalra.
            </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
                href={`/create/${event.id}/preview`}
                className="w-full py-4 bg-white text-black dark:bg-black dark:text-white font-black uppercase text-xl border-2 border-black dark:border-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all flex items-center justify-center"
            >
                <ArrowLeft className="w-6 h-6 mr-2" />
                Vissza az Előnézethez
            </Link>

            <button 
                onClick={onPublish}
                disabled={isPublishing}
                className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-xl border-2 border-black dark:border-white hover:bg-green-500 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center"
            >
                {isPublishing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="w-6 h-6 mr-2" />}
                {visibility === 'public' ? 'Publikálás!' : 'Létrehozás!'}
            </button>
        </div>
    </div>
  )
}
