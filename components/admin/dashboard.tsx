'use client'

import { useState } from 'react'
import { Crown, Lock, Globe, Save, RefreshCw, UserCheck, Trophy, Edit3, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import Link from 'next/link'
import { updateEventDetailsAction } from '@/app/actions' // Adjust path if needed

type Event = any // TODO: Proper types

export default function AdminDashboard({ event }: { event: Event }) {
    const supabase = createClient()
    const router = useRouter()
    
    // Status management
    const [status, setStatus] = useState(event.status)
    const [isUpdating, setIsUpdating] = useState(false)
    const [activeTab, setActiveTab] = useState<'status' | 'edit' | 'results'>('status')

    // DETAILS FORM
    const { register: registerDetails, handleSubmit: handleSubmitDetails, formState: { errors: detailsErrors } } = useForm({
        defaultValues: {
            title: event.title,
            description: event.description,
            category: event.category,
            lock_at: event.lock_at ? new Date(event.lock_at).toISOString().slice(0, 16) : '',
            source_url: event.source_url || ''
        }
    })

    const onUpdateDetails = async (data: any) => {
        setIsUpdating(true)
        const res = await updateEventDetailsAction(event.id, data)
        setIsUpdating(false)
        if (res.error) {
            alert(res.error)
        } else {
            alert('Sikeres mentés!')
            router.refresh()
        }
    }

    // RESULTS FORM
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            results: event.result_json || {}
        }
    })

    const updateStatus = async (newStatus: string) => {
        setIsUpdating(true)
        const { error } = await supabase
            .from('events')
            .update({ status: newStatus })
            .eq('id', event.id)
        
        setIsUpdating(false)
        if (error) {
            alert('Hiba történt: ' + error.message)
        } else {
            setStatus(newStatus)
            router.refresh()
        }
    }

    const onSaveResults = async (data: any) => {
        setIsUpdating(true);
        
        // 1. Save Event Results (for future reference and display)
        const { error: eventError } = await supabase
            .from('events')
            .update({ 
                result_json: data.results,
                // Optionally auto-reveal if not already
                status: status === 'locked' ? 'revealed' : status 
            })
            .eq('id', event.id)

        if (eventError) {
             alert('Hiba a mentésnél: ' + eventError.message)
             setIsUpdating(false)
             return
        }
        
        // 2. Calculate Points for all Predictions
        // MVP: Client-side calculation (simplest for now) or Server Action?
        // Let's call a Server Action to be safe and robust.
        // But we don't have it yet. Let's do a client-side loop for the MVP mock.
        
        const predictions = event.predictions || []
        const markets = event.markets || []
        
        const updates = predictions.map((pred: any) => {
            let points = 0
            const picks = pred.picks_json || {}
            
            markets.forEach((market: any) => {
               const correct = data.results[market.id]
               const userPick = picks[market.id]
               
               if (!correct || !userPick) return
               
               if (market.type === 'score') {
                   // Correct is object { "optionId": "3", ... }, UserPick is { "optionId": "3" }
                   // Check exact match for all fields
                   let allMatch = true
                   Object.keys(correct).forEach(optId => {
                       if (correct[optId] !== userPick[optId]) allMatch = false
                   })
                   if (allMatch) points += 3 // 3 points for exact score?
               } else {
                   // Select
                   if (userPick === correct) points += 1
               }
            })
            
            return {
                id: pred.id,
                points: points
            }
        })
        
        if (updates.length > 0) {
            const { error: scoreError } = await supabase
                .from('predictions')
                .upsert(updates)
             
            if (scoreError) console.error('Score update failed', scoreError)
        }

        setIsUpdating(false)
        alert('Eredmények mentve és pontok kiszámolva!')
        router.refresh()
    }

    return (
        <div className="space-y-8">
            {/* TABS */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                  onClick={() => setActiveTab('status')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'status' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Státusz
                    </div>
                </button>
                <button 
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        Szerkesztés
                    </div>
                </button>
                <button 
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'results' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Eredmények
                    </div>
                </button>
            </div>

            {/* 1. Status Control Panel */}
            {activeTab === 'status' && (
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Státusz Kezelés
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                         onClick={() => updateStatus('draft')}
                         disabled={isUpdating || status === 'draft'}
                         className={`p-3 rounded-lg border text-sm font-medium ${status === 'draft' ? 'bg-gray-100 border-gray-400 ring-2 ring-gray-200' : 'hover:bg-gray-50'}`}
                    >
                        Vázlat (Draft)
                    </button>
                    <button 
                         onClick={() => updateStatus('open')}
                         disabled={isUpdating || status === 'open'}
                         className={`p-3 rounded-lg border text-sm font-medium ${status === 'open' ? 'bg-green-100 border-green-400 ring-2 ring-green-200 text-green-800' : 'hover:bg-gray-50'}`}
                    >
                        Nyitva (Open)
                    </button>
                    <button 
                         onClick={() => updateStatus('locked')}
                         disabled={isUpdating || status === 'locked'}
                         className={`p-3 rounded-lg border text-sm font-medium ${status === 'locked' ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-200 text-orange-800' : 'hover:bg-gray-50'}`}
                    >
                        Lezárva (Locked)
                    </button>
                    <button 
                         onClick={() => updateStatus('revealed')}
                         disabled={isUpdating || status === 'revealed'}
                         className={`p-3 rounded-lg border text-sm font-medium ${status === 'revealed' ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-200 text-blue-800' : 'hover:bg-gray-50'}`}
                    >
                        Kiértékelve (Revealed)
                    </button>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                    Jelenlegi státusz: <span className="font-bold uppercase">{status}</span>
                </div>
            </section>
            )}

           {/* 2. Edit Section */}
           {activeTab === 'edit' && (
               <section className="space-y-6">
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                       <h2 className="text-xl font-bold mb-4 flex items-center">
                           <Settings className="w-5 h-5 mr-2" />
                           Alapadatok Módosítása
                       </h2>
                       <form onSubmit={handleSubmitDetails(onUpdateDetails)} className="space-y-4 max-w-2xl">
                           <div>
                               <label className="block text-sm font-medium mb-1">Esemény Címe</label>
                               <input {...registerDetails('title')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                           </div>
                           <div>
                               <label className="block text-sm font-medium mb-1">Leírás</label>
                               <textarea {...registerDetails('description')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-medium mb-1">Kategória</label>
                                   <select {...registerDetails('category')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                       <option value="sport">Sport</option>
                                       <option value="politics">Politika / Közélet</option>
                                       <option value="awards">Díjak / Gálák</option>
                                       <option value="other">Egyéb</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-sm font-medium mb-1">Lezárás Dátuma</label>
                                   <input type="datetime-local" {...registerDetails('lock_at')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                               </div>
                           </div>
                           <div>
                               <label className="block text-sm font-medium mb-1">Forrás URL (opcionális)</label>
                               <input {...registerDetails('source_url')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                           </div>
                           <button 
                             type="submit" 
                             disabled={isUpdating || ['locked', 'revealed'].includes(status)}
                             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             {isUpdating ? 'Mentés...' : 'Változások Mentése'}
                           </button>
                           {['locked', 'revealed'].includes(status) && <p className="text-xs text-red-500 mt-2">Lezárt esemény nem szerkeszthető.</p>}
                       </form>
                   </div>

                   <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                       <h2 className="text-xl font-bold mb-4 flex items-center">
                           <Edit3 className="w-5 h-5 mr-2" />
                           Kérdések Szerkesztése
                       </h2>
                       <p className="text-sm text-gray-500 mb-4">
                           A kérdések szerkesztésére a varázsló felületét használhatod.
                           <br />
                           <strong>Figyelem:</strong> Ha már érkezett szavazat, a kérdések nem módosíthatók!
                       </p>
                       
                       <Link 
                          href={`/create/${event.id}/markets`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                       >
                           <Edit3 className="w-4 h-4 mr-2" />
                           Kérdések szerkesztő megnyitása
                       </Link>
                   </div>
               </section>
           )}

           {/* 3. Result Resolution (Eredményhirdetés) */}
           {activeTab === 'results' && (
           <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center">
                        <Trophy className="w-5 h-5 mr-2" />
                        Eredmények Rögzítése
                    </h2>
                    <button 
                        onClick={handleSubmit(onSaveResults)}
                        disabled={isUpdating}
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {isUpdating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Eredmények Mentése & Kiértékelés
                    </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                     <p className="text-sm text-gray-500 mb-6 flex items-center">
                         <UserCheck className="w-4 h-4 mr-2" />
                         Itt rögzítheted a helyes válaszokat / végeredményt. Mentéskor a rendszer automatikusan kiszámolja a játékosok pontjait.
                     </p>

                     <div className="space-y-8">
                        {event.markets?.map((market: any, index: number) => (
                            <div key={market.id} className="border-b last:border-0 pb-6 last:pb-0 dark:border-gray-700">
                                <h3 className="font-bold text-lg mb-3 flex items-center">
                                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">{index + 1}</span>
                                    {market.question}
                                </h3>

                                <div className="pl-8">
                                    {market.type === 'score' ? (
                                        <div className="grid gap-3 max-w-md">
                                            {market.options_json.map((option: any) => (
                                                <div key={option.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border rounded dark:border-gray-600">
                                                    <span className="font-medium">{option.label}</span>
                                                    <input 
                                                        type="number"
                                                        {...register(`results.${market.id}.${option.id}` as const)}
                                                        className="w-24 p-1 text-right border rounded dark:bg-gray-900 dark:border-gray-700 font-mono font-bold"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {market.options_json.map((option: any) => (
                                                <label key={option.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-800 dark:border-gray-600">
                                                    <input 
                                                        type="radio"
                                                        value={option.id}
                                                        {...register(`results.${market.id}` as const)}
                                                        className="w-4 h-4 text-blue-600 mr-3"
                                                    />
                                                    <span className="font-medium">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
           </section>
           )}
        </div>
    )
}
