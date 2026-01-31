'use client'

import { useState } from 'react'
import { submitPredictionAction } from '@/app/actions'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Loader2, CheckCircle, Lock } from 'lucide-react'
import RankingMarket from './ranking-market'

// Types for props
type Option = { id: string, label: string }
type Market = { id: string, question: string, options_json: Option[], type?: string }
type Prediction = { picks_json: Record<string, any> } | null

export default function BettingForm({ 
  eventId, 
  markets, 
  userPrediction, 
  isLocked,
  results,
  stats,
  totalPredictions = 0
}: { 
  eventId: string, 
  markets: Market[], 
  userPrediction: Prediction,
  isLocked: boolean,
  results?: Record<string, any>,
  stats?: Record<string, Record<string, number>>,
  totalPredictions?: number
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

  const handleRankingChange = (marketId: string, newOrder: string[]) => {
    if (isLocked) return
    setPicks(prev => ({
        ...prev,
        [marketId]: newOrder
    }))
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
                            <div className="flex flex-col">
                                <span className="font-medium pr-4">{option.label}</span>
                                {!!results && results[market.id] && (
                                   <span className="text-xs text-gray-500 mt-1">Eredmény: <strong className="text-green-600">{results[market.id]?.[option.id]}</strong></span>
                                )}
                            </div>
                            <input 
                               type="number"
                               disabled={isLocked}
                               value={val}
                               onChange={(e) => handleScoreChange(market.id, option.id, e.target.value)}
                               className={clsx(
                                   "w-20 p-2 text-center text-lg font-bold border rounded-md dark:bg-gray-800 dark:border-gray-600 outline-none",
                                   !!results && results[market.id] && String(val) === String(results[market.id]?.[option.id]) 
                                     ? "bg-green-100 border-green-500 text-green-700 ring-2 ring-green-500" 
                                     : "focus:ring-2 focus:ring-blue-500"
                               )}
                               placeholder="-"
                            />
                         </div>
                       )
                    })}
                 </div>
               ) : market.type === 'ranking' ? (
                  <div className="p-2">
                     <p className="text-sm text-gray-500 mb-3 italic">Húzd a versenyzőket a helyes sorrendbe!</p>
                     <RankingMarket 
                        market={market}
                        value={picks[market.id] as string[] | undefined}
                        onChange={(newOrder) => handleRankingChange(market.id, newOrder)}
                        disabled={isLocked}
                     />
                  </div>
               ) : (
                 <div className="grid gap-3 sm:grid-cols-2">
                  {market.options_json.map((option) => {
                    const isSelected = picks[market.id] === option.id
                    
                    // Stats calculation
                    const voteCount = stats?.[market.id]?.[option.id] || 0
                    const votePercent = totalPredictions > 0 ? Math.round((voteCount / totalPredictions) * 100) : 0
                    
                    // Result checking
                    const isCorrect = results?.[market.id] === option.id
                    const isRevealed = !!results
                    
                    let borderColor = "border-gray-200 dark:border-gray-700"
                    let textColor = "text-gray-900 dark:text-gray-100"
                    
                    if (isSelected) {
                        borderColor = "border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
                        textColor = "text-blue-700 dark:text-blue-300"
                    }
                    
                    if (isRevealed) {
                        if (isCorrect) {
                            borderColor = "border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500"
                            textColor = "text-green-800 dark:text-green-200"
                        } else if (isSelected && !isCorrect) {
                            borderColor = "border-red-300 bg-red-50 dark:bg-red-900/20 opacity-70"
                            textColor = "text-red-800 dark:text-red-200"
                        } else {
                            borderColor = "border-gray-200 dark:border-gray-700 opacity-50"
                        }
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(market.id, option.id)}
                        disabled={isLocked}
                        className={clsx(
                          "p-4 rounded-lg border-2 text-left transition-all relative overflow-hidden",
                          borderColor,
                          textColor,
                          !isLocked && !isRevealed && "hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                         {/* Progress Bar Background for Stats */}
                         {stats && (
                             <div 
                                className={clsx("absolute left-0 top-0 bottom-0 transition-all opacity-10", isCorrect ? "bg-green-500" : "bg-blue-500")} 
                                style={{ width: `${votePercent}%` }} 
                             />
                         )}

                        <span className="font-medium relative z-10">{option.label}</span>
                        {isSelected && !isRevealed && (
                          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 z-10" />
                        )}
                        {isRevealed && isCorrect && (
                          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 z-10" />
                        )}

                        {/* Stats Text */}
                         {stats && (
                             <div className="relative z-10 mt-1 min-h-[1.2rem] flex items-center">
                                 <div className="text-xs font-bold opacity-70">
                                     {votePercent}% ({voteCount} szavazat)
                                 </div>
                             </div>
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
