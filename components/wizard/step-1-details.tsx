'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EventDetailsForm, eventDetailsSchema } from '@/lib/schemas'
import { createEventDraftAction } from '@/app/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

export default function Step1Details() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  
  const form = useForm<EventDetailsForm>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      category: 'other',
      // Default to tomorrow
      lock_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
    }
  })

  const onSubmit = async (data: EventDetailsForm) => {
    setIsPending(true)
    const result = await createEventDraftAction(data)
    
    if (result.success) {
      router.push(`/create/${result.eventId}/design`)
    } else {
      alert(result.error)
      setIsPending(false)
    }
  }

  // Common input styles for Neo-Brutalist look
  const inputParams = "w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all placeholder:text-gray-400"
  const labelParams = "block text-xs font-bold uppercase mb-1 tracking-wide"

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-black dark:border-white pb-2 inline-block">1. Alapadatok</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className={labelParams}>Esemény Címe</label>
          <input 
            {...form.register('title')}
            className={inputParams}
            placeholder="PL. OSCAR 2026 - A NAGY DÖNTÉS"
          />
          {form.formState.errors.title && (
            <p className="text-red-500 font-bold text-sm mt-1 bg-red-100 p-1 inline-block border border-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
           <label className={labelParams}>Leírás</label>
           <textarea 
             {...form.register('description')}
             className={`${inputParams} h-32 resize-none`}
             placeholder="Miről szól az esemény? Mi a tét?"
           />
           {form.formState.errors.description && (
             <p className="text-red-500 font-bold text-sm mt-1 bg-red-100 p-1 inline-block border border-red-500">{form.formState.errors.description.message}</p>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelParams}>Kategória</label>
            <div className="relative">
                <select 
                {...form.register('category')}
                className={`${inputParams} appearance-none cursor-pointer`}
                >
                <option value="other">EGYÉB</option>
                <option value="sport">SPORT</option>
                <option value="politics">POLITIKA / KÖZÉLET</option>
                <option value="awards">DÍJÁTADÓ</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300 font-bold">
                    ▼
                </div>
            </div>
          </div>
          
          <div>
            <label className={labelParams}>Lezárás ideje</label>
            <input 
              type="datetime-local"
              {...form.register('lock_at')}
              className={inputParams}
            />
            {form.formState.errors.lock_at && (
               <p className="text-red-500 font-bold text-sm mt-1 bg-red-100 p-1 inline-block border border-red-500">{form.formState.errors.lock_at.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className={labelParams}>Forrás URL (Opcionális)</label>
          <input 
            {...form.register('source_url')}
            className={inputParams}
            placeholder="https://hivatalos-oldal.hu"
          />
           {form.formState.errors.source_url && (
               <p className="text-red-500 font-bold text-sm mt-1 bg-red-100 p-1 inline-block border border-red-500">{form.formState.errors.source_url.message}</p>
            )}
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-4 px-6 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-lg border-2 border-black dark:border-white hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(200,200,200,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
        >
          {isPending ? <Loader2 className="animate-spin" /> : (
            <>
                Tovább a Designhoz
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
