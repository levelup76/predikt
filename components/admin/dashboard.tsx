'use client'

import { useState } from 'react'
import { Crown, Lock, Globe, Save, RefreshCw, UserCheck, Trophy, Edit3, Settings, Trash2, AlertTriangle, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import Link from 'next/link'
import { updateEventDetailsAction, deleteEventAction } from '@/app/actions' // Adjust path if needed

type Event = any // TODO: Proper types

export default function AdminDashboard({ event }: { event: Event }) {
    const supabase = createClient()
    const router = useRouter()
    
    // Status management
    const [status, setStatus] = useState(event.status)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [activeTab, setActiveTab] = useState<'status' | 'edit' | 'results' | 'users'>('status')

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

    const handleDelete = async () => {
        if (!confirm('BIZTOSAN TÖRÖLNI SZERETNÉD? Ez a művelet nem visszavonható! Minden tipp és adat elvész.')) {
            return
        }
        
        setIsDeleting(true)
        const res = await deleteEventAction(event.id)
        
        if (res.success) {
            alert('Esemény törölve.')
            router.push('/my-events')
        } else {
            alert(res.error)
            setIsDeleting(false)
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
            <div className="flex border-b-2 border-black dark:border-white mb-6">
                <button 
                  onClick={() => setActiveTab('status')}
                  className={`px-4 py-3 font-black text-sm uppercase tracking-tight border-r-2 border-black dark:border-white transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === 'status' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-500'}`}
                >
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Státusz
                    </div>
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`hidden sm:block px-4 py-3 font-black text-sm uppercase tracking-tight border-r-2 border-black dark:border-white transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === 'users' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-500'}`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Játékosok
                    </div>
                </button>
                <button 
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-3 font-black text-sm uppercase tracking-tight border-r-2 border-black dark:border-white transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === 'edit' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-500'}`}
                >
                    <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        Szerkesztés
                    </div>
                </button>
                <button 
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-3 font-black text-sm uppercase tracking-tight border-r-2 border-black dark:border-white transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === 'results' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-transparent text-gray-500'}`}
                >
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Eredmények
                    </div>
                </button>
            </div>

            {/* 1. Status Control Panel */}
            {activeTab === 'status' && (
            <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <h2 className="text-xl font-black uppercase mb-6 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Státusz Kezelés
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                         onClick={() => updateStatus('draft')}
                         disabled={isUpdating || status === 'draft'}
                         className={`p-4 border-2 border-black dark:border-white text-sm font-black uppercase tracking-tight transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${status === 'draft' ? 'bg-gray-200 text-black cursor-default' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-50'}`}
                    >
                        Vázlat (Draft)
                    </button>
                    <button 
                         onClick={() => updateStatus('open')}
                         disabled={isUpdating || status === 'open'}
                         className={`p-4 border-2 border-black dark:border-white text-sm font-black uppercase tracking-tight transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${status === 'open' ? 'bg-green-400 text-black cursor-default' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-green-50'}`}
                    >
                        Nyitva (Open)
                    </button>
                    <button 
                         onClick={() => updateStatus('locked')}
                         disabled={isUpdating || status === 'locked'}
                         className={`p-4 border-2 border-black dark:border-white text-sm font-black uppercase tracking-tight transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${status === 'locked' ? 'bg-orange-400 text-black cursor-default' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-orange-50'}`}
                    >
                        Lezárva (Locked)
                    </button>
                    <button 
                         onClick={() => updateStatus('revealed')}
                         disabled={isUpdating || status === 'revealed'}
                         className={`p-4 border-2 border-black dark:border-white text-sm font-black uppercase tracking-tight transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${status === 'revealed' ? 'bg-blue-400 text-black cursor-default' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-blue-50'}`}
                    >
                        Kiértékelve (Revealed)
                    </button>
                </div>
                <div className="mt-6 pt-4 border-t-2 border-black dark:border-white text-sm font-bold">
                    Jelenlegi státusz: <span className="font-black uppercase bg-yellow-400 px-2 py-1 ml-2 border-2 border-black text-black">{status}</span>
                </div>
            </section>
            )}

           {/* 2. Edit Section */}
           {activeTab === 'edit' && (
               <section className="space-y-6">
                   <div className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                       <h2 className="text-xl font-black uppercase mb-6 flex items-center">
                           <Settings className="w-5 h-5 mr-2" />
                           Alapadatok Módosítása
                       </h2>
                       <form onSubmit={handleSubmitDetails(onUpdateDetails)} className="space-y-6 max-w-2xl">
                           <div>
                               <label className="block text-sm font-black uppercase mb-2">Esemény Címe</label>
                               <input {...registerDetails('title')} className="w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none focus:ring-0 focus:outline-none focus:bg-yellow-50 dark:focus:bg-gray-900 font-bold" />
                           </div>
                           <div>
                               <label className="block text-sm font-black uppercase mb-2">Leírás</label>
                               <textarea {...registerDetails('description')} className="w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none focus:ring-0 focus:outline-none focus:bg-yellow-50 dark:focus:bg-gray-900 font-bold" rows={3}></textarea>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-sm font-black uppercase mb-2">Kategória</label>
                                   <div className="border-2 border-black dark:border-white bg-white dark:bg-black">
                                      <select {...registerDetails('category')} className="w-full p-3 bg-transparent border-none focus:outline-none font-bold appearance-none">
                                       <option value="sport">Sport</option>
                                       <option value="politics">Politika / Közélet</option>
                                       <option value="awards">Díjak / Gálák</option>
                                       <option value="other">Egyéb</option>
                                   </select>
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-sm font-black uppercase mb-2">Lezárás Dátuma</label>
                                   <input type="datetime-local" {...registerDetails('lock_at')} className="w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none focus:ring-0 focus:outline-none focus:bg-yellow-50 dark:focus:bg-gray-900 font-bold" />
                               </div>
                           </div>
                           <div>
                               <label className="block text-sm font-black uppercase mb-2">Forrás URL (opcionális)</label>
                               <input {...registerDetails('source_url')} className="w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none focus:ring-0 focus:outline-none focus:bg-yellow-50 dark:focus:bg-gray-900 font-bold" />
                           </div>
                           <button 
                             type="submit" 
                             disabled={isUpdating || ['locked', 'revealed'].includes(status)}
                             className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black uppercase px-6 py-3 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             {isUpdating ? 'Mentés...' : 'Változások Mentése'}
                           </button>
                           {['locked', 'revealed'].includes(status) && <p className="text-sm font-bold text-red-600 mt-2 p-2 border-2 border-red-600 inline-block">LEZÁRT ESEMÉNY NEM SZERKESZTHETŐ.</p>}
                       </form>
                   </div>

                   <div className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                       <h2 className="text-xl font-black uppercase mb-6 flex items-center">
                           <Edit3 className="w-5 h-5 mr-2" />
                           Kérdések Szerkesztése
                       </h2>
                       <p className="text-sm font-medium mb-6">
                           A kérdések szerkesztésére a varázsló felületét használhatod.
                           <br />
                           <strong className="bg-yellow-400 px-1 text-black">FIGYELEM:</strong> Ha már érkezett szavazat, a kérdések nem módosíthatók!
                       </p>
                       
                       <Link 
                          href={`/create/${event.id}/markets`}
                          className="inline-flex items-center px-6 py-3 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white font-black uppercase hover:bg-gray-100 dark:hover:bg-gray-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                       >
                           <Edit3 className="w-4 h-4 mr-2" />
                           Kérdések szerkesztő megnyitása
                       </Link>
                   </div>

                    {/* DANGER ZONE */}
                    <div className="bg-red-50 dark:bg-red-900/20 p-6 border-2 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                       <h2 className="text-xl font-black uppercase mb-4 flex items-center text-red-600 dark:text-red-400">
                           <AlertTriangle className="w-5 h-5 mr-2" />
                           Veszélyzóna
                       </h2>
                       <p className="text-sm font-bold text-red-800 dark:text-red-200 mb-6">
                           Az esemény törlése végleges. Nem vonható vissza.
                       </p>
                       
                       <button 
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="inline-flex items-center px-6 py-3 border-2 border-red-600 bg-red-600 text-white font-black uppercase hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                       >
                           {isDeleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                           {isDeleting ? 'Törlés...' : 'Esemény Törlése'}
                       </button>
                   </div>
               </section>
           )}

           {/* 3. Result Resolution (Eredményhirdetés) */}
           {activeTab === 'results' && (
           <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-xl font-black uppercase flex items-center">
                        <Trophy className="w-5 h-5 mr-2" />
                        Eredmények Rögzítése
                    </h2>
                    <button 
                        onClick={handleSubmit(onSaveResults)}
                        disabled={isUpdating}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-black uppercase border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Eredmények Mentése & Kiértékelés
                    </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-6 border-2 border-black dark:border-white">
                     <p className="text-sm font-bold mb-6 flex items-center bg-yellow-400 border-2 border-black p-3 text-black inline-block">
                         <UserCheck className="w-4 h-4 mr-2" />
                         Itt rögzítheted a helyes válaszokat / végeredményt. Mentéskor a rendszer automatikusan kalkulál.
                     </p>

                     <div className="space-y-8">
                        {event.markets?.map((market: any, index: number) => (
                            <div key={market.id} className="border-b-2 border-black dark:border-gray-700 last:border-0 pb-8 last:pb-0">
                                <h3 className="font-black text-lg mb-4 flex items-center uppercase">
                                    <span className="bg-black text-white w-8 h-8 flex items-center justify-center text-sm mr-3 border-2 border-black dark:border-white">{index + 1}</span>
                                    {market.question}
                                </h3>

                                <div className="pl-11">
                                    {market.type === 'score' ? (
                                        <div className="grid gap-3 max-w-md">
                                            {market.options_json.map((option: any) => (
                                                <div key={option.id} className="flex items-center justify-between p-3 bg-white dark:bg-black border-2 border-black dark:border-gray-600">
                                                    <span className="font-bold">{option.label}</span>
                                                    <input 
                                                        type="number"
                                                        {...register(`results.${market.id}.${option.id}` as const)}
                                                        className="w-24 p-2 text-right border-2 border-black dark:border-gray-500 font-mono font-black"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {market.options_json.map((option: any) => (
                                                <label key={option.id} className="flex items-center p-4 border-2 border-black dark:border-gray-600 cursor-pointer hover:bg-yellow-50 dark:hover:bg-gray-900 transition-colors bg-white dark:bg-black has-[:checked]:bg-blue-100 dark:has-[:checked]:bg-blue-900/20">
                                                    <input 
                                                        type="radio"
                                                        value={option.id}
                                                        {...register(`results.${market.id}` as const)}
                                                        className="w-5 h-5 text-black mr-4 accent-black"
                                                    />
                                                    <span className="font-bold">{option.label}</span>
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
