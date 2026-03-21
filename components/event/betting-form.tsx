'use client'

import { useState } from 'react'
import { submitPredictionAction } from '@/app/actions'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Loader2, CheckCircle, Lock, Heart, Share2, Link as LinkIcon, Camera } from 'lucide-react'
import RankingMarket from './ranking-market'
import SharePicksModal from './share-picks-modal'

// Types for props
type Option = { id: string, label: string }
type Market = { id: string, question: string, options_json: Option[], type?: string }
type Prediction = { picks_json: Record<string, any>, favorites_json?: Record<string, any> } | null

export default function BettingForm({
  eventId,
  eventTitle,
  eventSlug,
  markets,
  userPrediction,
  isLocked,
  results,
  stats,
  totalPredictions = 0,
  userPoints = null,
}: {
  eventId: string,
  eventTitle: string,
  eventSlug: string,
  markets: Market[],
  userPrediction: Prediction,
  isLocked: boolean,
  results?: Record<string, any>,
  stats?: Record<string, Record<string, number>>,
  totalPredictions?: number,
  userPoints?: number | null,
}) {
  const router = useRouter()
  // Load initial picks from existing prediction or empty
  const [picks, setPicks] = useState<Record<string, any>>(userPrediction?.picks_json || {})
  const [favorites, setFavorites] = useState<Record<string, any>>(userPrediction?.favorites_json || {})
  const [isPending, setIsPending] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isResultsShareOpen, setIsResultsShareOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
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

  const handleMultiSelect = (marketId: string, optionId: string) => {
    if (isLocked) return
    setPicks(prev => {
      const current: string[] = Array.isArray(prev[marketId]) ? prev[marketId] : []
      const next = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId]
      if (next.length === 0) {
        const copy = { ...prev }
        delete copy[marketId]
        return copy
      }
      return { ...prev, [marketId]: next }
    })
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

  const handleFavorite = (marketId: string, optionId: string) => {
    // Allows toggling off if already selected? Let's say yes.
    if (isLocked) return
    setFavorites(prev => {
        if (prev[marketId] === optionId) {
            const copy = { ...prev }
            delete copy[marketId]
            return copy
        }
        return {
            ...prev,
            [marketId]: optionId
        }
    })
  }

  const handleShareEvent = async () => {
    const url = `${window.location.origin}/e/${eventSlug}`
    
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tippelj erre: ${eventTitle}`,
          url: url
        })
        return
      } catch (err) {
        // Ignore abort
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setFeedback({ type: 'success', message: 'Link másolva a vágólapra!' })
      setTimeout(() => setFeedback(null), 2000)
    } catch (err) {
       // Ignore
    }
  }

  const handleSubmit = async () => {
    setIsPending(true)
    const result = await submitPredictionAction(eventId, picks, favorites)
    setIsPending(false)
    
    if (result.success) {
      setFeedback({ type: 'success', message: 'Tippek sikeresen mentve!' })
      router.refresh()
    } else {
      setFeedback({ type: 'error', message: result.error || 'Ismeretlen hiba' })
    }
  }

  return (
    <div className="space-y-12">
      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-w-sm w-full relative">
               <div className={clsx(
                   "p-4 border-b-2 border-black dark:border-white",
                   feedback.type === 'success' ? "bg-green-400 text-black" : "bg-red-500 text-white"
               )}>
                   <h3 className="text-2xl font-black uppercase text-center">
                       {feedback.type === 'success' ? 'Siker!' : 'Hiba!'}
                   </h3>
               </div>
               <div className="p-8 text-center space-y-6">
                   <p className="font-bold text-lg dark:text-white">{feedback.message}</p>
                   <button 
                       onClick={() => setFeedback(null)}
                       className="w-full bg-black text-white dark:bg-white dark:text-black font-black uppercase py-3 border-2 border-transparent hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                   >
                       Rendben
                   </button>
               </div>
           </div>
        </div>
      )}
      
      {/* Progress Bar - Sticky */}
      <div className="bg-white dark:bg-gray-900 p-4 border-b-4 border-black dark:border-white sticky top-0 z-30 flex items-center justify-between shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)] -mx-4 md:mx-0 md:border-2 md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
         <div className="flex flex-col">
            <span className="text-xs font-black uppercase text-gray-500 tracking-widest">Haladás</span>
            <span className="text-xl font-black text-black dark:text-white uppercase">{answeredCount} / {totalCount} tipp</span>
         </div>
         
         <div className="flex items-center gap-2">
            
            {/* Share Event Button */}
            <button
                onClick={handleShareEvent}
                className="hidden sm:flex items-center gap-2 px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                title="Esemény linkjének megosztása"
            >
                <LinkIcon className="w-4 h-4" />
                <span className="text-xs font-black uppercase">Esemény</span>
            </button>

            {/* Share Results Button – only after reveal */}
            {results && userPrediction && (
                <button
                    onClick={() => setIsResultsShareOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-yellow-400 text-black hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    title="Eredményem megosztása"
                >
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">Eredményem</span>
                </button>
            )}

            {/* Share Picks Button */}
            {answeredCount > 0 && !results && (
                <button
                    onClick={() => setIsShareOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    title="Saját tippjeim megosztása képként"
                >
                    <Camera className="w-4 h-4" />
                    <span className="text-xs font-black uppercase hidden sm:inline">Tippjeim</span>
                </button>
            )}

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
              {market.type === 'multiselect' && (
                <p className="text-xs font-black uppercase mt-2 bg-blue-400 text-black inline-block px-2 py-1 border border-black">
                  Több helyes válasz is lehetséges – jelöld be mindegyiket!
                </p>
              )}
            </div>
            
            <div className="p-6">
               {market.type === 'score' ? (
                 <div className="grid gap-6 sm:grid-cols-2">
                    {market.options_json.map((option) => {
                       // picks[market.id] is an object like { optionId: "3" }
                       const val = picks[market.id]?.[option.id] || ''
                       
                       return (
                         <div key={option.id} className="flex items-center gap-3 p-4 border-2 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                            <div className="flex flex-col flex-1 min-w-0">
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
                                   "w-24 p-2 text-center text-xl font-black border-2 border-black rounded-none outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0",
                                   !!results && results[market.id] && String(val) === String(results[market.id]?.[option.id])
                                     ? "bg-green-400 text-black"
                                     : "bg-gray-100 focus:bg-white"
                               )}
                               placeholder="-"
                            />
                            <button
                               type="button"
                               onClick={() => handleFavorite(market.id, option.id)}
                               disabled={isLocked}
                               className={clsx("transition-transform hover:scale-110 shrink-0", favorites[market.id] === option.id ? "text-red-500" : "text-gray-300 hover:text-red-400")}
                               title="Kedvencnek jelölés"
                            >
                               <Heart size={18} className={clsx(favorites[market.id] === option.id && "fill-current")} />
                            </button>
                         </div>
                       )
                    })}
                 </div>
               ) : market.type === 'multiselect' ? (
                 <div className="grid gap-4 sm:grid-cols-2">
                  {market.options_json.map((option) => {
                    const selectedArr: string[] = Array.isArray(picks[market.id]) ? picks[market.id] : []
                    const isSelected = selectedArr.includes(option.id)

                    const voteCount = stats?.[market.id]?.[option.id] || 0
                    const votePercent = totalPredictions > 0 ? Math.round((voteCount / totalPredictions) * 100) : 0

                    const correctArr: string[] = Array.isArray(results?.[market.id]) ? results![market.id] : []
                    const isCorrect = correctArr.includes(option.id)
                    const isRevealed = !!results

                    let borderColor = "border-black dark:border-white"
                    let bgColor = "bg-white dark:bg-black"
                    let textColor = "text-black dark:text-white"
                    let shadow = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"

                    if (isSelected && !isRevealed) {
                      bgColor = "bg-black dark:bg-white"
                      textColor = "text-white dark:text-black"
                    }
                    if (isRevealed) {
                      if (isCorrect) {
                        borderColor = "border-black"; bgColor = "bg-green-500"; textColor = "text-black"; shadow = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      } else if (isSelected) {
                        borderColor = "border-red-500"; bgColor = "bg-red-500"; textColor = "text-white"
                      } else {
                        borderColor = "border-gray-200"; bgColor = "opacity-50"; shadow = "shadow-none"
                      }
                    }

                    return (
                      <div
                        key={option.id}
                        onClick={() => !isLocked && handleMultiSelect(market.id, option.id)}
                        role="checkbox"
                        aria-checked={isSelected ? "true" : "false"}
                        tabIndex={isLocked ? -1 : 0}
                        onKeyDown={(e) => { if (!isLocked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleMultiSelect(market.id, option.id) } }}
                        className={clsx(
                          "p-4 border-2 text-left transition-all relative overflow-hidden min-h-[80px] flex flex-col justify-center",
                          borderColor, bgColor, textColor, shadow,
                          !isLocked && !isRevealed && "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer",
                          isLocked && "cursor-not-allowed opacity-80"
                        )}
                      >
                        {stats && (
                          <div className={clsx("absolute left-0 top-0 bottom-0 transition-all opacity-20 mix-blend-multiply dark:mix-blend-overlay", isCorrect ? "bg-white" : "bg-black dark:bg-white")} style={{ width: `${votePercent}%` }} />
                        )}
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              "w-5 h-5 border-2 border-current shrink-0 flex items-center justify-center",
                              isSelected ? "bg-current" : "bg-transparent"
                            )}>
                              {isSelected && <CheckCircle className="w-3 h-3 text-white dark:text-black" />}
                            </div>
                            <span className="font-bold uppercase tracking-wide text-sm pr-2">{option.label}</span>
                          </div>
                          {isRevealed && isCorrect && <CheckCircle className="w-6 h-6 shrink-0 text-black" />}
                        </div>
                        {stats && (
                          <div className="relative z-10 mt-2 border-t border-current pt-1 opacity-80">
                            <div className="text-xs font-mono font-bold">{votePercent}% ({voteCount} szavazat)</div>
                          </div>
                        )}
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
                        favoriteId={favorites[market.id]}
                        onChange={(newOrder) => handleRankingChange(market.id, newOrder)}
                        onFavorite={(id) => handleFavorite(market.id, id)}
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
                    
                    // Result checking (correct can be a string or array for split awards)
                    const correctVal = results?.[market.id]
                    const isCorrect = Array.isArray(correctVal) ? correctVal.includes(option.id) : correctVal === option.id
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
                      <div
                        key={option.id}
                        onClick={() => !isLocked && handleSelect(market.id, option.id)}
                        role="button"
                        tabIndex={isLocked ? -1 : 0}
                        aria-disabled={isLocked}
                        onKeyDown={(e) => {
                            if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                handleSelect(market.id, option.id);
                            }
                        }}
                        className={clsx(
                          "p-4 border-2 text-left transition-all relative overflow-hidden group min-h-[80px] flex flex-col justify-center",
                          borderColor,
                          bgColor,
                          textColor,
                          shadow,
                          !isLocked && !isRevealed && "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer",
                          isLocked && "cursor-not-allowed opacity-80"
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
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleFavorite(market.id, option.id); }}
                                    disabled={isLocked}
                                    className={clsx("p-1 z-20 transition-transform hover:scale-110", favorites[market.id] === option.id ? "text-red-500" : "text-gray-300 hover:text-red-400")}
                                    title="Kedvencnek jelölés"
                                >
                                    <Heart size={20} className={clsx(favorites[market.id] === option.id && "fill-current")} />
                                </button>
                                <span className="font-bold uppercase tracking-wide text-sm pr-6">{option.label}</span>
                            </div>
                            
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
                      </div>
                    )
                  })}
                </div>
               )}
            </div>
          </div>
        ))}
      </div>

      <SharePicksModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        eventTitle={eventTitle}
        eventSlug={eventSlug}
        picks={picks}
        favorites={favorites}
        markets={markets}
      />

      <SharePicksModal
        isOpen={isResultsShareOpen}
        onClose={() => setIsResultsShareOpen(false)}
        eventTitle={eventTitle}
        eventSlug={eventSlug}
        picks={picks}
        favorites={favorites}
        markets={markets}
        results={results}
        userPoints={userPoints ?? undefined}
      />
    </div>
  )
}
