import React, { useState } from 'react';

export default function AdminDashboard({ event }) {
    const [activeTab, setActiveTab] = useState('status');
    return (
        <div className="space-y-8">
            <div className="flex border-b-2 border-black dark:border-white mb-6">
                <button onClick={() => setActiveTab('status')} className={activeTab === 'status' ? 'bg-black text-white' : ''}>Státusz</button>
                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'bg-black text-white' : ''}>Játékosok</button>
                <button onClick={() => setActiveTab('edit')} className={activeTab === 'edit' ? 'bg-black text-white' : ''}>Szerkesztés</button>
                <button onClick={() => setActiveTab('results')} className={activeTab === 'results' ? 'bg-black text-white' : ''}>Eredmények</button>
                <button onClick={() => setActiveTab('audit')} className={activeTab === 'audit' ? 'bg-black text-white' : ''}>Audit Log</button>
            </div>
            {activeTab === 'status' && <section>Státusz tartalom</section>}
            {activeTab === 'users' && <section>Játékosok tartalom</section>}
            {activeTab === 'edit' && <section>Szerkesztés tartalom</section>}
            {activeTab === 'results' && <section>Eredmények tartalom</section>}
            {activeTab === 'audit' && <section>Audit Log tartalom</section>}
        </div>
    );
}
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
    // Minimal valid structure
    const [activeTab, setActiveTab] = useState('status');
    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex border-b-2 border-black dark:border-white mb-6">
                <button onClick={() => setActiveTab('status')} className={activeTab === 'status' ? 'bg-black text-white' : ''}>Státusz</button>
                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'bg-black text-white' : ''}>Játékosok</button>
                <button onClick={() => setActiveTab('edit')} className={activeTab === 'edit' ? 'bg-black text-white' : ''}>Szerkesztés</button>
                <button onClick={() => setActiveTab('results')} className={activeTab === 'results' ? 'bg-black text-white' : ''}>Eredmények</button>
                <button onClick={() => setActiveTab('audit')} className={activeTab === 'audit' ? 'bg-black text-white' : ''}>Audit Log</button>
            </div>
            {/* Tab Content */}
            {activeTab === 'status' && <section>Státusz tartalom</section>}
            {activeTab === 'users' && <section>Játékosok tartalom</section>}
            {activeTab === 'edit' && <section>Szerkesztés tartalom</section>}
            {activeTab === 'results' && <section>Eredmények tartalom</section>}
            {activeTab === 'audit' && <section>Audit Log tartalom</section>}
        </div>
    );
}
}
    // Remove all code after the main return

    // Remove all code after the main return
            {activeTab === "results" && (
                <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Trophy className="w-5 h-5 mr-2" />Eredmények Rögzítése</h2>
                    <p className="text-sm font-bold mb-6 flex items-center bg-yellow-400 border-2 border-black p-3 text-black inline-block"><UserCheck className="w-4 h-4 mr-2" />Itt rögzítheted a helyes válaszokat / végeredményt. Mentéskor a rendszer automatikusan kalkulál.</p>
                    <form onSubmit={handleSubmit(onSaveResults)}>
                        <div className="space-y-8">
                            {event?.markets?.map((market: any, index: number) => (
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
                        <button 
                            type="submit"
                            disabled={isUpdating}
                            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-black uppercase border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Eredmények Mentése & Kiértékelés
                        </button>
                    </form>
                </section>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Users className="w-5 h-5 mr-2" />Játékosok</h2>
                    {/* User list and admin actions would go here */}
                </section>
            )}
        </div>
    );
            {activeTab === "results" && (
                <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Trophy className="w-5 h-5 mr-2" />Eredmények Rögzítése</h2>
                    <p className="text-sm font-bold mb-6 flex items-center bg-yellow-400 border-2 border-black p-3 text-black inline-block"><UserCheck className="w-4 h-4 mr-2" />Itt rögzítheted a helyes válaszokat / végeredményt. Mentéskor a rendszer automatikusan kalkulál.</p>
                    <form onSubmit={handleSubmit(onSaveResults)}>
                        <div className="space-y-8">
                            {event?.markets?.map((market: any, index: number) => (
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
                        <button 
                            type="submit"
                            disabled={isUpdating}
                            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-black uppercase border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Eredmények Mentése & Kiértékelés
                        </button>
                    </form>
                </section>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                    <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Users className="w-5 h-5 mr-2" />Játékosok</h2>
                    {/* User list and admin actions would go here */}
                </section>
            )}
        </div>
    );
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

                                        {/* Audit Log Tab */}
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

                                                                        {/* Audit Log Tab */}
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

                                                                        {/* Results Tab */}
                                                                        {activeTab === "results" && (
                                                                            <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                                                                                <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Trophy className="w-5 h-5 mr-2" />Eredmények Rögzítése</h2>
                                                                                <p className="text-sm font-bold mb-6 flex items-center bg-yellow-400 border-2 border-black p-3 text-black inline-block"><UserCheck className="w-4 h-4 mr-2" />Itt rögzítheted a helyes válaszokat / végeredményt. Mentéskor a rendszer automatikusan kalkulál.</p>
                                                                                <form onSubmit={handleSubmit(onSaveResults)}>
                                                                                    <div className="space-y-8">
                                                                                        {event?.markets?.map((market: any, index: number) => (
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
                                                                                    <button 
                                                                                        type="submit"
                                                                                        disabled={isUpdating}
                                                                                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-black uppercase border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                    >
                                                                                        {isUpdating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                                                        Eredmények Mentése & Kiértékelés
                                                                                    </button>
                                                                                </form>
                                                                            </section>
                                                                        )}

                                                                        {/* Users Tab */}
                                                                        {activeTab === "users" && (
                                                                            <section className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white">
                                                                                <h2 className="text-xl font-black uppercase mb-6 flex items-center"><Users className="w-5 h-5 mr-2" />Játékosok</h2>
                                                                                {/* User list and admin actions would go here */}
                                                                            </section>
                                                                        )}
                                                                    </div>
                                                                );
