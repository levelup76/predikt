'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EventDetailsForm, eventDetailsSchema } from '@/lib/schemas'
import { createEventDraftAction } from '@/app/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

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

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">1. Alapadatok</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Esemény Címe</label>
          <input 
            {...form.register('title')}
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            placeholder="Pl. Oscar 2026 - A nagy döntés"
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
           <label className="block text-sm font-medium mb-1">Leírás</label>
           <textarea 
             {...form.register('description')}
             className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 h-24"
             placeholder="Miről szól az esemény? Mi a tét?"
           />
           {form.formState.errors.description && (
             <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
           )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kategória</label>
            <select 
              {...form.register('category')}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="other">Egyéb</option>
              <option value="sport">Sport</option>
              <option value="politics">Politika / Közélet</option>
              <option value="awards">Díjátadó</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Lezárás ideje</label>
            <input 
              type="datetime-local"
              {...form.register('lock_at')}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
            {form.formState.errors.lock_at && (
               <p className="text-red-500 text-sm mt-1">{form.formState.errors.lock_at.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Forrás URL (Opcionális)</label>
          <input 
            {...form.register('source_url')}
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            placeholder="https://hivatalos-oldal.hu"
          />
           {form.formState.errors.source_url && (
               <p className="text-red-500 text-sm mt-1">{form.formState.errors.source_url.message}</p>
            )}
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          Tovább a Designhoz
        </button>
      </form>
    </div>
  )
}
