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
    <div className="space-y-12">
      
      {/* Progress Bar - Sticky */}
      <div className="bg-white dark:bg-gray-900 p-4 border-b-4 border-black dark:border-white sticky top-0 z-30 flex items-center justify-between shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)] -mx-4 md:mx-0 md:border-2 md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
         <div className="flex flex-col">
            <span className="text-xs font-black uppercase text-gray-500 tracking-widest">Haladás</span>
            <span className="text-xl font-black text-black dark:text-white uppercase">{answeredCount} / {totalCount} tipp</span>
         </div>
         
         {!isLocked ? (
           <button 
             onClick={handleSubmit} 
             disabled={!isComplete || isPending}
             className={clsx(
               "px-6 py-2 font-black uppercase text-sm border-2 transition-all flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]",
               isComplete 
                 ? "bg-black text-white border-black hover:bg-yellow-400 hover:text-black dark:bg-white dark:text-black dark:border-white" 
                 : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed shadow-none"
             )}
           >
             {isPending && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
             {userPrediction ? 'Frissítés' : 'Beküldés'}
           </button>
         ) : (
           <div className="flex items-center text-white font-black uppercase bg-red-500 border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
             <Lock className="w-4 h-4 mr-2" /> Lezárva
           </div>
         )}
      </div>

      {/* Markets List */}
      <div className="space-y-12">
        {markets.map((market, index) => (
          <div key={market.id} className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative">
            <div className="absolute -top-5 left-4 bg-yellow-400 border-2 border-black px-3 py-1 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
                #{index + 1} KÉRDÉS
            </div>

            <div className="p-8 pt-10 border-b-2 border-dashed border-black dark:border-white bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-2xl font-black uppercase leading-tight">{market.question}</h3>
            </div>
            
            <div className="p-6">
               {market.type === 'score' ? (
                 <div className="grid gap-6 sm:grid-cols-2">
                    {market.options_json.map((option) => {
                       // picks[market.id] is an object like { optionId: "3" }
                       const val = picks[market.id]?.[option.id] || ''
                       
                       return (
                         <div key={option.id} className="flex items-center justify-between p-4 border-2 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                            <div className="flex flex-col">
                                <span className="font-bold uppercase text-sm">{option.label}</span>
                                {!!results && results[market.id] && (
                                   <span className="text-xs text-black bg-green-400 inline-block px-1 border border-black mt-1 font-bold uppercase">Eredmény: {results[market.id]?.[option.id]}</span>
                                )}
                            </div>
                            <input 
                               type="number"
                               disabled={isLocked}
                               value={val}
                               onChange={(e) => handleScoreChange(market.id, option.id, e.target.value)}
                               className={clsx(
                                   "w-24 p-2 text-center text-xl font-black border-2 border-black rounded-none outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all",
                                   !!results && results[market.id] && String(val) === String(results[market.id]?.[option.id]) 
                                     ? "bg-green-400 text-black" 
                                     : "bg-gray-100 focus:bg-white"
                               )}
                               placeholder="-"
                            />
                         </div>
                       )
                    })}
                 </div>
               ) : market.type === 'ranking' ? (
                  <div className="p-4 border-2 border-dashed border-black">
                     <p className="text-xs font-bold uppercase text-gray-500 mb-4 bg-gray-200 inline-block px-2">Húzd a versenyzőket a helyes sorrendbe!</p>
                     <RankingMarket 
                        market={market}
                        value={picks[market.id] as string[] | undefined}
                        onChange={(newOrder) => handleRankingChange(market.id, newOrder)}
                        disabled={isLocked}
                     />
                  </div>
               ) : (
                 <div className="grid gap-4 sm:grid-cols-2">
                  {market.options_json.map((option) => {
                    const isSelected = picks[market.id] === option.id
                    
                    // Stats calculation
                    const voteCount = stats?.[market.id]?.[option.id] || 0
                    const votePercent = totalPredictions > 0 ? Math.round((voteCount / totalPredictions) * 100) : 0
                    
                    // Result checking
                    const isCorrect = results?.[market.id] === option.id
                    const isRevealed = !!results
                    
                    let borderColor = "border-black dark:border-white"
                    let bgColor = "bg-white dark:bg-black"
                    let textColor = "text-black dark:text-white"
                    let shadow = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                    
                    if (isSelected) {
                        bgColor = "bg-black dark:bg-white"
                        textColor = "text-white dark:text-black"
                    }
                    
                    if (isRevealed) {
                        if (isCorrect) {
                            borderColor = "border-black"
                            bgColor = "bg-green-500"
                            textColor = "text-black"
                            shadow = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        } else if (isSelected && !isCorrect) {
                            borderColor = "border-red-500"
                            bgColor = "bg-red-500"
                            textColor = "text-white"
                        } else {
                            borderColor = "border-gray-200" 
                            bgColor = "opacity-50"
                            shadow = "shadow-none"
                        }
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelect(market.id, option.id)}
                        disabled={isLocked}
                        className={clsx(
                          "p-4 border-2 text-left transition-all relative overflow-hidden group min-h-[80px] flex flex-col justify-center",
                          borderColor,
                          bgColor,
                          textColor,
                          shadow,
                          !isLocked && !isRevealed && "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        )}
                      >
                         {/* Progress Bar Background for Stats */}
                         {stats && (
                             <div 
                                className={clsx("absolute left-0 top-0 bottom-0 transition-all opacity-20 mix-blend-multiply dark:mix-blend-overlay", isCorrect ? "bg-white" : "bg-black dark:bg-white")} 
                                style={{ width: `${votePercent}%` }} 
                             />
                         )}

                        <div className="relative z-10 flex items-center justify-between w-full">
                            <span className="font-bold uppercase tracking-wide text-sm pr-6">{option.label}</span>
                            
                            {/* Icons for selection/result */}
                            {isSelected && !isRevealed && (
                              <CheckCircle className="w-6 h-6 shrink-0" />
                            )}
                            {isRevealed && isCorrect && (
                              <CheckCircle className="w-6 h-6 shrink-0 text-black" />
                            )}
                        </div>

                        {/* Stats Text */}
                         {stats && (
                             <div className="relative z-10 mt-2 border-t border-current pt-1 opacity-80">
                                 <div className="text-xs font-mono font-bold">
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
