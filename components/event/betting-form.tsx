'use client'

import { useState } from 'react'
import { submitPredictionAction } from '@/app/actions'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Loader2, CheckCircle, Lock } from 'lucide-react'

// Types for props
type Option = { id: string, label: string }
type Market = { id: string, question: string, options_json: Option[], type?: string }
type Prediction = { picks_json: Record<string, any> } | null

export default function BettingForm({ 
  eventId, 
  markets, 
  userPrediction, 
  isLocked 
}: { 
  eventId: string, 
  markets: Market[], 
  userPrediction: Prediction,
  isLocked: boolean
}) {
  const router = useRouter()
  // Load initial picks from existing prediction or empty
  const [picks, setPicks] = useState<Record<string, any>>(userPrediction?.picks_json || {})
  const [isPending, setIsPending] = useState(false)
  
  // Calculate completion percentage
  const answeredCount = Object.keys(picks).length
  const totalCount = markets.length
  const progress = Math.round((answeredCount / totalCount) * 100)
  
  // Basic validation: Check if we have answers for all markets
  // For score markets, technically we should check if all fields are filled, but existence is a good start.
  const isComplete = answeredCount === totalCount

  const handleSelect = (marketId: string, optionId: string) => {
    if (isLocked) return
    setPicks(prev => ({
      ...prev,
      [marketId]: optionId
    }))
  }

  const handleScoreChange = (marketId: string, optionId: string, value: string) => {
    if (isLocked) return
    
    setPicks(prev => {
        const currentMarketPicks = prev[marketId] || {}
        // If value is empty, maybe remove the key? For now just save generic object
        return {
            ...prev,
            [marketId]: {
                ...currentMarketPicks,
                [optionId]: value
            }
        }
    })
  }

  const handleSubmit = async () => {
    setIsPending(true)
    const result = await submitPredictionAction(eventId, picks)
    setIsPending(false)
    
    if (result.success) {
      alert('Tippek sikeresen mentve!')
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-20 z-10 flex items-center justify-between">
         <div className="flex flex-col">
            <span className="text-xs font-bold uppercase text-gray-500">Haladás</span>
            <span className="text-lg font-bold text-blue-600">{answeredCount} / {totalCount} tipp</span>
         </div>
         
         {!isLocked ? (
           <button 
             onClick={handleSubmit} 
             disabled={!isComplete || isPending}
             className={clsx(
               "px-6 py-2 rounded-full font-bold transition-all flex items-center",
               isComplete 
                 ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30" 
                 : "bg-gray-200 text-gray-400 cursor-not-allowed"
             )}
           >
             {isPending && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
             {userPrediction ? 'Frissítés' : 'Beküldés'}
           </button>
         ) : (
           <div className="flex items-center text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full">
             <Lock className="w-4 h-4 mr-2" /> Lezárva
           </div>
         )}
      </div>

      {/* Markets List */}
      <div className="space-y-6">
        {markets.map((market, index) => (
          <div key={market.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold pt-0.5">{market.question}</h3>
            </div>
            
            <div className="p-4">
               {market.type === 'score' ? (
                 <div className="grid gap-4 sm:grid-cols-2">
                    {market.options_json.map((option) => {
                       // picks[market.id] is an object like { optionId: "3" }
                       const val = picks[market.id]?.[option.id] || ''
                       
                       return (
                         <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <span className="font-medium pr-4">{option.label}</span>
                            <input 
                               type="number"
                               disabled={isLocked}
                               value={val}
                               onChange={(e) => handleScoreChange(market.id, option.id, e.target.value)}
                               className="w-20 p-2 text-center text-lg font-bold border rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                               placeholder="-"
                            />
                         </div>
                       )
                    })}
                 </div>
               ) : (
                 <div className="grid gap-3 sm:grid-cols-2">
                  {market.options_json.map((option) => {
                    const isSelected = picks[market.id] === option.id
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(market.id, option.id)}
                        disabled={isLocked}
                        className={clsx(
                          "p-4 rounded-lg border-2 text-left transition-all relative",
                          isSelected 
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm" 
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <span className="font-medium">{option.label}</span>
                        {isSelected && (
                          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    )
                  })}
                </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
