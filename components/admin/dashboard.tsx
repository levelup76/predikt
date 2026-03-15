"use client";
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
