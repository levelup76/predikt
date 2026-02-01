
'use client'

import { X, Eye } from 'lucide-react'
import BettingForm from '@/components/event/betting-form'
import { useEffect } from 'react'

interface PreviewModalProps {
    isOpen: boolean
    onClose: () => void
    markets: any[]
}

export function PreviewModal({ isOpen, onClose, markets }: PreviewModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
           <div className="bg-gray-50 dark:bg-gray-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] w-full max-w-4xl relative my-10 max-h-[90vh] flex flex-col">
               <div className="sticky top-0 z-50 bg-black text-white p-4 flex justify-between items-center border-b-4 border-black dark:border-white shrink-0">
                   <h3 className="text-xl md:text-2xl font-black uppercase flex items-center gap-2">
                       <Eye className="w-6 h-6" />
                       Hogy néz ki haveroknak?
                   </h3>
                   <button onClick={onClose} className="hover:text-yellow-400 transition-colors">
                       <X className="w-8 h-8" />
                   </button>
               </div>
               
               <div className="p-6 md:p-8 overflow-y-auto flex-1">
                   <div className="mb-6 bg-yellow-100 border-2 border-black p-4 text-sm font-bold uppercase text-black">
                       Ez csak előnézet. Próbáld ki a gombokat, jelöld be a szíveket! (Nem mentődik el semmi.)
                   </div>

                   <BettingForm 
                       eventId="preview"
                       isLocked={false}
                       userPrediction={null}
                       markets={markets}
                   />
               </div>
           </div>
        </div>
    )
}
