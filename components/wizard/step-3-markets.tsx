'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventMarketsSchema, EventMarketsForm } from '@/lib/schemas'
import { saveMarketsAction, publishEventAction } from '@/app/actions'
import { Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react'

export default function Step3Markets({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

  const form = useForm<EventMarketsForm>({
    resolver: zodResolver(eventMarketsSchema),
    defaultValues: {
      markets: [
        { 
          question: '', 
          type: 'select', 
          options: [{ id: '1', label: '' }, { id: '2', label: '' }] 
        }
      ]
    }
  })

  const { fields: marketFields, append: appendMarket, remove: removeMarket } = useFieldArray({
    control: form.control,
    name: 'markets'
  })

  // We need a helper for nested Field Arrays (options within markets)
  // But react-hook-form makes nested arrays tricky in one component.
  // For MVP simplicity, we will render options manually or create a sub-component.
  // Let's do a sub-component for the Market Item to handle its own options?
  // Actually, to keep state simple, let's just do it inline with standard map, 
  // but we need to register them correctly 'markets.0.options.0.label'
  
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
      <h2 className="text-2xl font-bold mb-6">3. Kérdések (Piacok)</h2>
      <p className="text-gray-500 mb-6 text-sm">Adj hozzá legalább egy kérdést, amire a felhasználók tippelhetnek.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {marketFields.map((market, mIndex) => (
          <div key={market.id} className="p-6 border rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 relative group">
            
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
               {marketFields.length > 1 && (
                 <button type="button" onClick={() => removeMarket(mIndex)} className="text-red-500 hover:text-red-700 p-2">
                   <Trash2 className="w-5 h-5" />
                 </button>
               )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Kérdés #{mIndex + 1}</label>
              <input 
                 {...form.register(`markets.${mIndex}.question`)}
                 placeholder="Pl. Ki nyeri a legjobb film díjat?"
                 className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
              {form.formState.errors.markets?.[mIndex]?.question && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.markets[mIndex]?.question?.message}</p>
              )}
            </div>

            {/* Options Management (Simulated Field Array for MVP) */}
            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
               <label className="block text-xs uppercase text-gray-400 font-bold mb-2">Válaszlehetőségek</label>
               
               {/* We rely on the watcher to know how many options current market has? 
                   Actually, let's just render inputs based on the current form values for this index. 
                   A clean way is to use a child component, but for speed: */}
               <MarketOptions 
                  control={form.control} 
                  marketIndex={mIndex} 
                  errors={form.formState.errors}
               />
            </div>

          </div>
        ))}

        <button 
          type="button" 
          onClick={() => appendMarket({ question: '', type: 'select', options: [{ id: crypto.randomUUID(), label: '' }, { id: crypto.randomUUID(), label: '' }] })}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center font-medium text-gray-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          + Új kérdés hozzáadása
        </button>

        <div className="pt-6 border-t dark:border-gray-700">
           {form.formState.errors.markets && (
              <p className="text-red-500 text-center mb-4">{form.formState.errors.markets.message}</p>
           )}

           <button 
             type="submit" 
             disabled={isPublishing}
             className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:-translate-y-1"
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
import { useFieldArray, Control } from 'react-hook-form'

function MarketOptions({ control, marketIndex, errors }: { control: Control<EventMarketsForm>, marketIndex: number, errors: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `markets.${marketIndex}.options`
  })

  return (
    <div className="space-y-2">
      {fields.map((option, oIndex) => (
        <div key={option.id} className="flex items-center gap-2">
           <input 
             {...control.register(`markets.${marketIndex}.options.${oIndex}.label`)}
             placeholder={`Opció ${oIndex + 1}`}
             className="flex-1 p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
           />
           {fields.length > 2 && (
             <button type="button" onClick={() => remove(oIndex)} className="text-gray-400 hover:text-red-500">
               <Trash2 className="w-4 h-4" />
             </button>
           )}
        </div>
      ))}
      <button 
        type="button" 
        onClick={() => append({ id: crypto.randomUUID(), label: '' })}
        className="text-sm text-blue-600 hover:underline flex items-center mt-2"
      >
        <Plus className="w-3 h-3 mr-1" /> Opció felvétele
      </button>

      {/* Show error for the options array itself (e.g. min 2 options) */}
       {errors?.markets?.[marketIndex]?.options?.message && (
          <p className="text-red-500 text-xs">{errors?.markets?.[marketIndex]?.options?.message}</p> // Typo? .root? No, .message on array usually works with Zod refine
       )}
       {/* Error for specific option empty */}
       {errors?.markets?.[marketIndex]?.options?.[0]?.label && (
          <p className="text-red-500 text-xs">Az opciók nem lehetnek üresek.</p>
       )}
    </div>
  )
}
