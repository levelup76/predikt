'use client'

import { useState } from 'react'
import { Crown, Lock, Globe, Save, RefreshCw, UserCheck, Trophy, Edit3, Settings, Trash2, AlertTriangle, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import Link from 'next/link'
import { updateEventDetailsAction, deleteEventAction } from '@/app/actions' // Adjust path if needed

type Event = any // TODO: Proper types.

export default function AdminDashboard({ event }: { event: Event }) {
    const supabase = createClient()
                            <option value="public">Publikus</option>
                            <option value="private">Privát</option>
                        </select>
                    </div>
                </div>
    import { useForm } from 'react-hook-form'
                    <div className="mt-4">
                        <button onClick={restoreEvent} disabled={isRestoring} className="px-4 py-2 bg-green-600 text-white font-bold border-2 border-black rounded">
                            {isRestoring ? 'Visszaállítás...' : 'Visszaállítás'}
                        </button>
                        <span className="ml-2 text-red-600 font-bold">Törölve: {new Date(event.deleted_at).toLocaleString()} (7 napig visszaállítható)</span>
                    </div>
                )}
        const router = useRouter();
                </div>
            </section>
            )}

           {/* 2. Edit Section */}
           {/* Audit Log Tab */}
           {activeTab === 'audit' && (
               <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                   <h2 className="text-xl font-black uppercase mb-6 flex items-center">
                       <Settings className="w-5 h-5 mr-2" />
                       Audit Log
                   </h2>
                   <button onClick={fetchAuditLogs} className="mb-4 px-4 py-2 bg-blue-600 text-white font-bold rounded">Frissítés</button>
                   <div className="overflow-x-auto">
                       <table className="min-w-full border">
                           <thead>
                               <tr>
                                   <th className="border px-2 py-1">Dátum</th>
                                   <th className="border px-2 py-1">Felhasználó</th>
                                   <th className="border px-2 py-1">Akció</th>
                                   <th className="border px-2 py-1">Részletek</th>
                               </tr>
                           </thead>
                           <tbody>
                               {auditLogs.map(log => (
                                   <tr key={log.id}>
                                       <td className="border px-2 py-1">{new Date(log.created_at).toLocaleString()}</td>
                                       <td className="border px-2 py-1">{log.user_id}</td>
                                       <td className="border px-2 py-1">{log.action}</td>
                                       <td className="border px-2 py-1">{JSON.stringify(log.details)}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </section>
           )}
           {activeTab === 'edit' && (
               <section className="space-y-6">
                   <div className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                       <h2 className="text-xl font-black uppercase mb-6 flex items-center">
                           <Settings className="w-5 h-5 mr-2" />
                        // Main JSX
                        return (
                            <div className="space-y-8">
                                {/* Notifications */}
                                {notifications.length > 0 && (
                                    <div className="mb-4">
                                        {notifications.map(n => (
                                            <div key={n.id} className="bg-yellow-100 border-2 border-yellow-600 p-4 mb-2 flex justify-between items-center">
                                                <span>{n.message}</span>
                                                <button onClick={() => dismissNotification(n.id)} className="ml-4 px-3 py-1 bg-yellow-600 text-white font-bold rounded">Bezár</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* TABS */}
                                <div className="flex border-b-2 border-black dark:border-white mb-6">
                                    <button onClick={() => setActiveTab("status")} className={`px-4 py-3 font-black text-sm uppercase tracking-tight border-r-2 border-black dark:border-white transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === "status" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-gray-500"}`}>
                                        <div className="flex items-center gap-2"><Globe className="w-4 h-4" />Státusz</div>
                                    </button>
                                    <button onClick={() => setActiveTab("users")} className={`hidden sm:block px-4 py-3 font-black text-sm uppercase tracking-tight border-r-2 border-black dark:border-white transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === "users" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-gray-500"}`}>
                                        <div className="flex items-center gap-2"><Users className="w-4 h-4" />Játékosok</div>
                                    </button>
                                    <button onClick={() => setActiveTab("edit")} className={`px-4 py-3 font-black text-sm uppercase tracking-tight border-r-2 border-black dark:border-white transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === "edit" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-gray-500"}`}>
                                        <div className="flex items-center gap-2"><Edit3 className="w-4 h-4" />Szerkesztés</div>
                                    </button>
                                    <button onClick={() => setActiveTab("results")} className={`px-4 py-3 font-black text-sm uppercase tracking-tight border-r-2 border-black dark:border-white transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === "results" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-gray-500"}`}>
                                        <div className="flex items-center gap-2"><Trophy className="w-4 h-4" />Eredmények</div>
                                    </button>
                                    <button onClick={() => setActiveTab("audit")} className={`px-4 py-3 font-black text-sm uppercase tracking-tight transition-colors hover:bg-yellow-400 hover:text-black ${activeTab === "audit" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent text-gray-500"}`}>
                                        <div className="flex items-center gap-2"><Settings className="w-4 h-4" />Audit Log</div>
                                    </button>
                                </div>
                                {/* 1. Status Control Panel */}
                                {activeTab === "status" && (
                                    <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                        <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Globe className="w-5 h-5 mr-2" />Státusz Kezelés</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <button onClick={() => updateStatus('draft')} disabled={isUpdating || status === 'draft'} className={`p-4 border-2 border-black dark:border-white text-sm font-black uppercase tracking-tight transition-all ${status === 'draft' ? 'bg-gray-200 text-black cursor-default' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-50'}`}>Vázlat (Draft)</button>
                                            <button onClick={() => updateStatus('open')} disabled={isUpdating || status === 'open'} className={`p-4 border-2 border-black dark:border-white text-sm font-black uppercase tracking-tight transition-all ${status === 'open' ? 'bg-green-400 text-black cursor-default' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-green-50'}`}>Nyitva (Open)</button>
                                            <button onClick={() => updateStatus('locked')} disabled={isUpdating || status === 'locked'} className={`p-4 border-2 border-black dark:border-white text-sm font-black uppercase tracking-tight transition-all ${status === 'locked' ? 'bg-orange-400 text-black cursor-default' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-orange-50'}`}>Lezárva (Locked)</button>
                                            <button onClick={() => updateStatus('revealed')} disabled={isUpdating || status === 'revealed'} className={`p-4 border-2 border-black dark:border-white text-sm font-black uppercase tracking-tight transition-all ${status === 'revealed' ? 'bg-blue-400 text-black cursor-default' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-blue-50'}`}>Kiértékelve (Revealed)</button>
                                        </div>
                                        <div className="mt-6 pt-4 border-t-2 border-black dark:border-white text-sm font-bold">
                                            Jelenlegi státusz: <span className="font-black uppercase bg-yellow-400 px-2 py-1 ml-2 border-2 border-black text-black">{status}</span>
                                            <div className="mt-4">
                                                <label className="font-black mr-2">Láthatóság:</label>
                                                <select value={visibility} onChange={e => updateVisibility(e.target.value)} className="border-2 border-black px-2 py-1">
                                                    <option value="public">Publikus</option>
                                                    <option value="private">Privát</option>
                                                </select>
                                            </div>
                                        </div>
                                        {event.deleted_at && (
                                            <div className="mt-4">
                                                <button onClick={restoreEvent} disabled={isRestoring} className="px-4 py-2 bg-green-600 text-white font-bold border-2 border-black rounded">
                                                    {isRestoring ? 'Visszaállítás...' : 'Visszaállítás'}
                                                </button>
                                                <span className="ml-2 text-red-600 font-bold">Törölve: {new Date(event.deleted_at).toLocaleString()} (7 napig visszaállítható)</span>
                                            </div>
                                        )}
                                    </section>
                                )}
                                {/* 2. Edit Section */}
                                {activeTab === "edit" && (
                                    <section className="space-y-6">
                                        <div className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow">
                                            <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Settings className="w-5 h-5 mr-2" />Alapadatok Módosítása</h2>
                                            <form onSubmit={handleSubmitDetails(data => updateEventDetailsAction(event.id, data))} className="space-y-6 max-w-2xl">
                                                <div>
                                                    <label className="block text-sm font-black uppercase mb-2">Esemény Címe</label>
                                                    <input {...registerDetails('title')} className="w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-black uppercase mb-2">Leírás</label>
                                                    <textarea {...registerDetails('description')} className="w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none font-bold" rows={3}></textarea>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-black uppercase mb-2">Kategória</label>
                                                        <select {...registerDetails('category')} className="w-full p-3 bg-transparent border-none font-bold">
                                                            <option value="sport">Sport</option>
                                                            <option value="politics">Politika / Közélet</option>
                                                            <option value="awards">Díjak / Gálák</option>
                                                            <option value="other">Egyéb</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-black uppercase mb-2">Lezárás Dátuma</label>
                                                        <input type="datetime-local" {...registerDetails('lock_at')} className="w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none font-bold" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-black uppercase mb-2">Forrás URL (opcionális)</label>
                                                    <input {...registerDetails('source_url')} className="w-full p-3 border-2 border-black dark:border-white bg-transparent rounded-none font-bold" />
                                                </div>
                                                <button type="submit" disabled={isUpdating} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black uppercase px-6 py-3 border-2 border-black dark:border-white shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {isUpdating ? 'Mentés...' : 'Változások Mentése'}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow">
                                            <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Edit3 className="w-5 h-5 mr-2" />Kérdések Szerkesztése</h2>
                                            <p className="text-sm font-medium mb-6">A kérdések szerkesztésére a varázsló felületét használhatod.<br /><strong className="bg-yellow-400 px-1 text-black">FIGYELEM:</strong> Ha már érkezett szavazat, a kérdések nem módosíthatók!</p>
                                            <Link href={`/create/${event.id}/markets`} className="inline-flex items-center px-6 py-3 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white font-black uppercase hover:bg-gray-100 dark:hover:bg-gray-900 transition-all shadow">
                                                <Edit3 className="w-4 h-4 mr-2" />Kérdések szerkesztő megnyitása
                                            </Link>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 p-6 border-2 border-red-500 shadow">
                                            <h2 className="text-xl font-black uppercase mb-4 flex items-center text-red-600 dark:text-red-400"><AlertTriangle className="w-5 h-5 mr-2" />Veszélyzóna</h2>
                                            <p className="text-sm font-bold text-red-800 dark:text-red-200 mb-6">Az esemény törlése végleges. Nem vonható vissza.</p>
                                            <button onClick={() => deleteEventAction(event.id)} disabled={isDeleting} className="inline-flex items-center px-6 py-3 border-2 border-red-600 bg-red-600 text-white font-black uppercase hover:bg-red-700 transition-all shadow">
                                                {isDeleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                                {isDeleting ? 'Törlés...' : 'Esemény Törlése'}
                                            </button>
                                        </div>
                                    </section>
                                )}
                                {/* 3. Audit Log Tab */}
                                {activeTab === "audit" && (
                                    <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                                        <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Settings className="w-5 h-5 mr-2" />Audit Log</h2>
                                        <button onClick={fetchAuditLogs} className="mb-4 px-4 py-2 bg-blue-600 text-white font-bold rounded">Frissítés</button>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border">
                                                <thead>
                                                    <tr>
                                                        <th className="border px-2 py-1">Dátum</th>
                                                        <th className="border px-2 py-1">Felhasználó</th>
                                                        <th className="border px-2 py-1">Akció</th>
                                                        <th className="border px-2 py-1">Részletek</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {auditLogs.map(log => (
                                                        <tr key={log.id}>
                                                            <td className="border px-2 py-1">{new Date(log.created_at).toLocaleString()}</td>
                                                            <td className="border px-2 py-1">{log.user_id}</td>
                                                            <td className="border px-2 py-1">{log.action}</td>
                                                            <td className="border px-2 py-1">{JSON.stringify(log.details)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                )}
                                {/* 4. Results Tab */}
                                {activeTab === "results" && (
                                    <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                                        <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Trophy className="w-5 h-5 mr-2" />Eredmények Rögzítése</h2>
                                        <p className="text-sm font-bold mb-6 flex items-center bg-yellow-400 border-2 border-black p-3 text-black inline-block"><UserCheck className="w-4 h-4 mr-2" />Itt rögzítheted a helyes válaszokat / végeredményt. Mentéskor a rendszer automatikusan kalkulál.</p>
                                        {/* Results form and scoring UI would go here */}
                                    </section>
                                )}
                                {/* 5. Users Tab */}
                                {activeTab === "users" && (
                                    <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                                        <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Users className="w-5 h-5 mr-2" />Játékosok</h2>
                                        {/* User list and admin actions would go here */}
                                    </section>
                                )}
                            </div>
                        );
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
