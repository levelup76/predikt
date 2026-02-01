'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventMarketsSchema, EventMarketsForm } from '@/lib/schemas'
import { saveMarketsAction, publishEventAction } from '@/app/actions'
import { Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react'

// Common Neo-Brutalist styles
const inputParams = "w-full p-2 border-2 border-black dark:border-white bg-transparent rounded-none focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all placeholder:text-gray-400"
const labelParams = "block text-xs font-bold uppercase mb-1 tracking-wide"
const btnParams = "px-4 py-2 font-bold uppercase border-2 border-black rounded-none transition-all hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"

export default function Step3Markets({ eventId, initialData = [] }: { eventId: string, initialData?: any[] }) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

  const defaultValues = initialData.length > 0 ? {
    markets: initialData.map(m => ({
      question: m.question,
      type: m.type,
      options: m.options_json
    }))
  } : {
    markets: [
        { 
          question: '', 
          type: 'select', 
          options: [{ id: '1', label: '' }, { id: '2', label: '' }] 
        }
      ]
  }

  const form = useForm<EventMarketsForm>({
    resolver: zodResolver(eventMarketsSchema),
    defaultValues
  })

  const { fields: marketFields, append: appendMarket, remove: removeMarket } = useFieldArray({
    control: form.control,
    name: 'markets'
  })
  
  const onSubmit = async (data: EventMarketsForm) => {
    setIsPublishing(true)
    
    // 1. Save Markets
    const saveResult = await saveMarketsAction(eventId, data.markets)
    if (saveResult.error) {
       alert(saveResult.error)
       setIsPublishing(false)
       return
    }

    // 2. Publish Event
    const pubResult = await publishEventAction(eventId)
    
    if (pubResult.success) {
      // Success! Redirect to the public event page
      router.push(`/e/${pubResult.slug}`)
    } else {
      alert(pubResult.error)
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-black dark:border-white pb-2 inline-block">3. Kérdések</h2>
      <p className="text-gray-600 font-bold mb-6 text-sm uppercase">Adj hozzá legalább egy kérdést, amire a felhasználók tippelhetnek!</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {marketFields.map((market, mIndex) => (
          <div key={market.id} className="p-6 border-2 border-black dark:border-white bg-white dark:bg-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group">
            
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
               {marketFields.length > 1 && (
                 <button type="button" onClick={() => removeMarket(mIndex)} className="text-red-500 hover:text-white hover:bg-red-500 border-2 border-red-500 p-1 transition-colors">
                   <Trash2 className="w-5 h-5" />
                 </button>
               )}
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="col-span-1 md:col-span-3">
                  <label className={labelParams}>Kérdés #{mIndex + 1}</label>
                  <input 
                     {...form.register(`markets.${mIndex}.question`)}
                     placeholder="Pl. Ki nyeri a meccset?"
                     className={inputParams}
                  />
                  {form.formState.errors.markets?.[mIndex]?.question && (
                    <p className="text-red-500 font-bold text-xs mt-1 bg-red-100 p-1 inline-block border border-red-500">{form.formState.errors.markets[mIndex]?.question?.message}</p>
                  )}
               </div>
               <div className="col-span-1">
                  <label className={labelParams}>Típus</label>
                  <div className="relative">
                    <select
                        {...form.register(`markets.${mIndex}.type`)}
                        className={`${inputParams} appearance-none cursor-pointer`}
                    >
                        <option value="select">Feleletválasztós</option>
                        <option value="score">Számszerű</option>
                        <option value="ranking">Rangsor</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black dark:text-white font-bold">▼</div>
                  </div>
               </div>
            </div>

            {/* Options Management */}
            <div className="pl-4 border-l-4 border-gray-200 dark:border-gray-700">
               <label className="block text-xs uppercase text-gray-400 font-black mb-4">
                 {form.watch(`markets.${mIndex}.type`) === 'score' ? 'Mezők (Kikre kell tippelni?)' : 'Válaszlehetőségek'}
               </label>
               
               <MarketOptions 
                  control={form.control} 
                  marketIndex={mIndex} 
                  errors={form.formState.errors}
                  type={form.watch(`markets.${mIndex}.type`)}
               />
            </div>

          </div>
        ))}

        <button 
          type="button" 
          onClick={() => appendMarket({ question: '', type: 'select', options: [{ id: crypto.randomUUID(), label: '' }, { id: crypto.randomUUID(), label: '' }] })}
          className="w-full py-4 border-2 border-dashed border-black dark:border-white rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center font-bold uppercase text-gray-500 hover:text-black dark:hover:text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          + Új kérdés hozzáadása
        </button>

        <div className="pt-6 border-t-2 border-black dark:border-white">
           {form.formState.errors.markets && (
              <p className="text-red-500 font-bold text-center mb-4 uppercase bg-red-100 p-2 border border-red-500 inline-block w-full">{form.formState.errors.markets.message}</p>
           )}

           <button 
             type="submit" 
             disabled={isPublishing}
             className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-xl border-2 border-black dark:border-white hover:bg-green-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 flex items-center justify-center"
           >
             {isPublishing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="w-6 h-6 mr-2" />}
             Esemény Publikálása!
           </button>
        </div>

      </form>
    </div>
  )
}

// Subcomponent for managing options of a single market
import { Control } from 'react-hook-form'

function MarketOptions({ control, marketIndex, errors, type }: { control: Control<EventMarketsForm>, marketIndex: number, errors: any, type: string }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `markets.${marketIndex}.options`
  })

  // input styles repeated for subcomponent
  const inputParams = "w-full p-2 border-2 border-black dark:border-white bg-white dark:bg-black rounded-none focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all placeholder:text-gray-400 text-sm"

  return (
    <div className="space-y-3">
      {fields.map((option, oIndex) => (
        <div key={option.id} className="flex items-center gap-2">
           <input 
             {...control.register(`markets.${marketIndex}.options.${oIndex}.label`)}
             placeholder={type === 'score' ? `Mező ${oIndex + 1} (pl. Hazai csapat)` : `Opció ${oIndex + 1}`}
             className={inputParams}
           />
           {fields.length > 1 && (
             <button type="button" onClick={() => remove(oIndex)} className="text-gray-400 hover:text-white hover:bg-black p-2 transition-colors border-2 border-transparent hover:border-black">
               <Trash2 className="w-4 h-4" />
             </button>
           )}
        </div>
      ))}
      <button 
        type="button" 
        onClick={() => append({ id: crypto.randomUUID(), label: '' })}
        className="text-xs font-bold uppercase text-blue-600 hover:text-white hover:bg-blue-600 px-3 py-1 border-2 border-blue-600 inline-flex items-center mt-2 transition-all"
      >
        <Plus className="w-3 h-3 mr-1" /> {type === 'score' ? 'Mező felvétele' : 'Opció felvétele'}
      </button>

      {/* Show error for the options array itself (e.g. min 2 options) */}
       {errors?.markets?.[marketIndex]?.options?.message && (
          <p className="text-red-500 font-bold text-xs bg-red-100 p-1 border border-red-500 inline-block">{errors?.markets?.[marketIndex]?.options?.message}</p> 
       )}
       {/* Error for specific option empty */}
       {errors?.markets?.[marketIndex]?.options?.[0]?.label && (
          <p className="text-red-500 font-bold text-xs bg-red-100 p-1 border border-red-500 inline-block">A mezők nem lehetnek üresek.</p>
       )}
    </div>
  )
}
