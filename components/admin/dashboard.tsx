"use client";
import React, { useState, useTransition } from 'react';
import clsx from 'clsx';
import { CheckCircle, Clock, Lock, Trophy, Users, FileText, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { revealResultsAction } from '@/app/actions';
import RankingMarket from '@/components/event/ranking-market';

type Option = { id: string; label: string };
type Market = { id: string; question: string; type: string; options_json: Option[]; order?: number };
type Prediction = { id: string; user_id: string; picks_json: Record<string, any>; points?: number; submitted_at?: string; profiles?: { full_name?: string; username?: string; avatar_url?: string } | null };
type AuditLog = { id: string; action: string; details: any; created_at: string; user_id: string };

const ACTION_LABELS: Record<string, string> = {
  reveal: 'Eredmény közzétéve',
  delete: 'Esemény törölve',
  restore: 'Esemény visszaállítva',
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft:    { label: 'PISZKOZAT', bg: 'bg-gray-200', text: 'text-black' },
  open:     { label: 'NYITVA',    bg: 'bg-green-400', text: 'text-black' },
  locked:   { label: 'LEZÁRVA',  bg: 'bg-yellow-400', text: 'text-black' },
  revealed: { label: 'EREDMÉNY', bg: 'bg-blue-500',   text: 'text-white' },
};

export default function AdminDashboard({ event }: { event: any }) {
  const [activeTab, setActiveTab] = useState('status');
  const [results, setResults] = useState<Record<string, any>>(event.result_json || {});
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const markets: Market[] = (event.markets || []).slice().sort((a: Market, b: Market) => (a.order || 0) - (b.order || 0));
  const predictions: Prediction[] = event.predictions || [];
  const auditLogs: AuditLog[] = event.audit_logs || [];

  const isRevealed = event.status === 'revealed';
  const isLockTimePassed = new Date(event.lock_at) < new Date();

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (isRevealed) return (b.points ?? 0) - (a.points ?? 0);
    return new Date(a.submitted_at || 0).getTime() - new Date(b.submitted_at || 0).getTime();
  });

  const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft;
  const answeredCount = Object.keys(results).length;

  const handleReveal = () => {
    if (answeredCount < markets.length) {
      setFeedback({ type: 'error', message: `Kérlek töltsd ki az összes helyes választ! (${answeredCount}/${markets.length})` });
      return;
    }
    startTransition(async () => {
      const res = await revealResultsAction(event.id, results);
      if (res.error) setFeedback({ type: 'error', message: res.error });
      else setFeedback({ type: 'success', message: 'Eredmények rögzítve! Értesítések elküldve a játékosoknak.' });
    });
  };

  const tabs = [
    { id: 'status',  label: 'Státusz' },
    { id: 'players', label: `Játékosok (${predictions.length})` },
    { id: 'results', label: 'Eredmények' },
    { id: 'audit',   label: 'Napló' },
  ];

  return (
    <div className="space-y-8 font-mono">

      {/* Feedback */}
      {feedback && (
        <div className={clsx(
          'border-4 border-black p-4 flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          feedback.type === 'success' ? 'bg-green-400 text-black' : 'bg-red-500 text-white'
        )}>
          {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="font-bold flex-1">{feedback.message}</p>
          <button type="button" onClick={() => setFeedback(null)} className="text-xs font-black uppercase opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b-4 border-black dark:border-white overflow-x-auto">
        {tabs.map(tab => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-5 py-3 font-black uppercase text-sm whitespace-nowrap border-r-2 border-black dark:border-white transition-colors',
              activeTab === tab.id
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* STÁTUSZ TAB */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Status */}
            <div className="border-4 border-black dark:border-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-gray-900">
              <p className="text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Állapot</p>
              <span className={clsx('font-black text-lg px-3 py-1 border-2 border-black', statusCfg.bg, statusCfg.text)}>
                {statusCfg.label}
              </span>
            </div>
            {/* Predictions count */}
            <div className="border-4 border-black dark:border-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-gray-900">
              <p className="text-xs font-black uppercase text-gray-500 mb-2 tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> Tippek</p>
              <p className="text-4xl font-black dark:text-white">{predictions.length}</p>
            </div>
            {/* Lock date */}
            <div className="border-4 border-black dark:border-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-gray-900">
              <p className="text-xs font-black uppercase text-gray-500 mb-2 tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> Lezárás</p>
              <p className="text-sm font-bold dark:text-white">{new Date(event.lock_at).toLocaleString('hu-HU')}</p>
            </div>
          </div>

          {/* Event info */}
          <div className="border-4 border-black dark:border-white p-6 bg-white dark:bg-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-xl font-black uppercase mb-1 dark:text-white">{event.title}</h2>
            {event.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{event.description}</p>}
            <div className="flex flex-wrap gap-2">
              <a href={`/e/${event.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-black uppercase px-3 py-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:text-white">
                <ExternalLink className="w-3 h-3" /> Publikus oldal
              </a>
              {event.source_url && (
                <a href={event.source_url} target="_blank" className="inline-flex items-center gap-1 text-xs font-black uppercase px-3 py-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:text-white">
                  <ExternalLink className="w-3 h-3" /> Forrás
                </a>
              )}
            </div>
          </div>

          {/* CTA: go reveal if locked */}
          {isLockTimePassed && !isRevealed && (
            <div className="bg-yellow-400 border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-black uppercase mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5" /> A tippelési határidő lejárt!
              </p>
              <p className="text-sm text-black mb-4">Rögzítsd a helyes válaszokat az <strong>Eredmények</strong> fülön, hogy a játékosok lássák a pontjaikat.</p>
              <button type="button" onClick={() => setActiveTab('results')} className="bg-black text-white font-black uppercase px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Eredmények rögzítése →
              </button>
            </div>
          )}
        </div>
      )}

      {/* JÁTÉKOSOK TAB */}
      {activeTab === 'players' && (
        <div>
          {sortedPredictions.length === 0 ? (
            <div className="border-4 border-black dark:border-white p-12 text-center bg-white dark:bg-gray-900">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30 dark:text-white" />
              <p className="font-black text-xl uppercase dark:text-white">Még senki sem tippelt</p>
              <p className="text-gray-500 text-sm mt-2">Oszd meg az eseményt, hogy játékosok csatlakozhassanak!</p>
            </div>
          ) : (
            <div className="border-4 border-black dark:border-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <table className="w-full">
                <thead className="bg-black text-white dark:bg-white dark:text-black">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-widest">#</th>
                    <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-widest">Játékos</th>
                    <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-widest hidden sm:table-cell">Beküldve</th>
                    <th className="py-3 px-4 text-right text-xs font-black uppercase tracking-widest">
                      {isRevealed ? <span className="flex items-center justify-end gap-1"><Trophy className="w-3 h-3" /> Pont</span> : 'Pont'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y-2 divide-black dark:divide-white">
                  {sortedPredictions.map((pred, idx) => {
                    const profile = pred.profiles;
                    const name = profile?.full_name || profile?.username || 'Ismeretlen';
                    return (
                      <tr key={pred.id} className={clsx('hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors', idx === 0 && isRevealed && 'bg-yellow-50 dark:bg-yellow-900/20')}>
                        <td className="py-3 px-4 font-black text-sm dark:text-white">
                          {idx === 0 && isRevealed ? '🥇' : idx === 1 && isRevealed ? '🥈' : idx === 2 && isRevealed ? '🥉' : `${idx + 1}.`}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-sm dark:text-white">{name}</span>
                          {profile?.username && profile.full_name && (
                            <span className="text-xs text-gray-400 ml-2">@{profile.username}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 hidden sm:table-cell">
                          {pred.submitted_at ? new Date(pred.submitted_at).toLocaleString('hu-HU') : '–'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isRevealed ? (
                            <span className={clsx('font-black text-lg', (pred.points ?? 0) === markets.length ? 'text-green-600' : 'dark:text-white')}>
                              {pred.points ?? 0} <span className="text-xs font-normal text-gray-400">/ {markets.length}</span>
                            </span>
                          ) : (
                            <span className="text-gray-300 font-black">?</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EREDMÉNYEK TAB */}
      {activeTab === 'results' && (
        <div className="space-y-8">
          {!isLockTimePassed ? (
            <div className="border-4 border-black dark:border-white p-8 text-center bg-white dark:bg-gray-900">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-30 dark:text-white" />
              <p className="font-black text-xl uppercase dark:text-white">A tippelési határidő még nem járt le</p>
              <p className="text-gray-500 text-sm mt-2">
                Lezárás: {new Date(event.lock_at).toLocaleString('hu-HU')}
              </p>
            </div>
          ) : (
            <>
              <div className={clsx(
                'border-4 border-black p-4 font-bold text-sm',
                isRevealed ? 'bg-blue-100 text-blue-900' : 'bg-yellow-100 text-yellow-900'
              )}>
                {isRevealed
                  ? '✓ Az eredmények már közzé vannak téve. Az alábbi helyes válaszok kerültek rögzítésre.'
                  : `Jelöld meg minden kérdésnél a helyes választ, majd kattints az "Eredmények rögzítése" gombra. A játékosok értesítést kapnak. (${answeredCount}/${markets.length} kitöltve)`
                }
              </div>

              {markets.map((market, index) => (
                <ResultMarket
                  key={market.id}
                  market={market}
                  index={index}
                  results={results}
                  isRevealed={isRevealed}
                  setResults={setResults}
                />
              ))}

              {!isRevealed && (
                <div className="pt-4 border-t-4 border-black dark:border-white">
                  <button
                    type="button"
                    onClick={handleReveal}
                    disabled={isPending || answeredCount < markets.length}
                    className={clsx(
                      'w-full py-4 font-black uppercase text-lg border-4 border-black transition-all flex items-center justify-center gap-3',
                      answeredCount === markets.length
                        ? 'bg-black text-white hover:bg-yellow-400 hover:text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    )}
                  >
                    {isPending && <Loader2 className="animate-spin w-5 h-5" />}
                    {isPending ? 'Mentés és értesítés küldés...' : `Eredmények rögzítése és értesítés küldése (${answeredCount}/${markets.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* NAPLÓ TAB */}
      {activeTab === 'audit' && (
        <div>
          {auditLogs.length === 0 ? (
            <div className="border-4 border-black dark:border-white p-12 text-center bg-white dark:bg-gray-900">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30 dark:text-white" />
              <p className="font-black text-xl uppercase dark:text-white">Nincs naplóbejegyzés</p>
            </div>
          ) : (
            <div className="border-4 border-black dark:border-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <table className="w-full">
                <thead className="bg-black text-white dark:bg-white dark:text-black">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-widest">Esemény</th>
                    <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-widest hidden sm:table-cell">Idő</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y-2 divide-black dark:divide-white">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-black text-sm dark:text-white uppercase">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 hidden sm:table-cell">
                        {new Date(log.created_at).toLocaleString('hu-HU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----- Subcomponent: ResultMarket -----
function ResultMarket({
  market,
  index,
  results,
  isRevealed,
  setResults,
}: {
  market: Market;
  index: number;
  results: Record<string, any>;
  isRevealed: boolean;
  setResults: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}) {
  const currentValue = results[market.id];
  const isAnswered = market.type === 'multiselect'
    ? Array.isArray(currentValue) && currentValue.length > 0
    : currentValue !== undefined;

  const handleSelect = (optionId: string) => {
    if (isRevealed) return;
    setResults(prev => ({ ...prev, [market.id]: optionId }));
  };

  const handleMultiSelect = (optionId: string) => {
    if (isRevealed) return;
    setResults(prev => {
      const current: string[] = Array.isArray(prev[market.id]) ? prev[market.id] : [];
      const next = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId];
      if (next.length === 0) { const copy = { ...prev }; delete copy[market.id]; return copy; }
      return { ...prev, [market.id]: next };
    });
  };

  const handleScoreChange = (optionId: string, value: string) => {
    if (isRevealed) return;
    setResults(prev => ({
      ...prev,
      [market.id]: { ...(prev[market.id] || {}), [optionId]: value }
    }));
  };

  const handleRankingChange = (newOrder: string[]) => {
    if (isRevealed) return;
    setResults(prev => ({ ...prev, [market.id]: newOrder }));
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative">
      <div className="absolute -top-5 left-4 z-10 flex gap-2">
        <span className="bg-yellow-400 border-2 border-black px-3 py-1 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm">
          #{index + 1}
        </span>
        {isAnswered && (
          <span className="bg-green-400 border-2 border-black px-3 py-1 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Kitöltve
          </span>
        )}
      </div>

      <div className="p-6 pt-8 border-b-2 border-dashed border-black dark:border-white">
        <h3 className="text-lg font-black uppercase dark:text-white">{market.question}</h3>
        <p className="text-xs text-gray-400 mt-1 uppercase font-bold">
          {market.type === 'select' ? 'Egyszeres választás' :
           market.type === 'boolean' ? 'Igen / Nem' :
           market.type === 'multiselect' ? 'Több helyes válasz' :
           market.type === 'score' ? 'Eredmény tipp' :
           market.type === 'ranking' ? 'Sorrend' : market.type}
          {!isRevealed && ' – Kattints a helyes válaszra!'}
        </p>
      </div>

      <div className="p-6">
        {/* MULTISELECT */}
        {market.type === 'multiselect' && (
          <div className="space-y-2">
            <p className="text-xs font-black uppercase text-blue-600 mb-3">Jelöld be az összes helyes választ!</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {market.options_json.map(option => {
                const selected: string[] = Array.isArray(currentValue) ? currentValue : [];
                const isChecked = selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleMultiSelect(option.id)}
                    disabled={isRevealed}
                    className={clsx(
                      'p-4 border-4 text-left font-black uppercase text-sm transition-all flex items-center gap-3',
                      isChecked
                        ? 'bg-green-400 border-black text-black shadow-none'
                        : 'bg-white dark:bg-gray-800 border-black dark:border-white text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                      isRevealed && 'cursor-not-allowed'
                    )}
                  >
                    <div className={clsx('w-5 h-5 border-2 border-current shrink-0 flex items-center justify-center', isChecked ? 'bg-black' : 'bg-transparent')}>
                      {isChecked && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SELECT / BOOLEAN */}
        {(market.type === 'select' || market.type === 'boolean') && (
          <div className="grid gap-3 sm:grid-cols-2">
            {market.options_json.map(option => {
              const isSelected = currentValue === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  disabled={isRevealed}
                  className={clsx(
                    'p-4 border-4 text-left font-black uppercase text-sm transition-all flex items-center justify-between',
                    isSelected
                      ? 'bg-green-400 border-black text-black shadow-none'
                      : 'bg-white dark:bg-gray-800 border-black dark:border-white text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                    isRevealed && 'cursor-not-allowed'
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <CheckCircle className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        )}

        {/* SCORE */}
        {market.type === 'score' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {market.options_json.map(option => {
              const val = (currentValue as Record<string, string>)?.[option.id] ?? '';
              return (
                <div key={option.id} className="flex items-center justify-between p-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                  <span className="font-black uppercase text-sm dark:text-white">{option.label}</span>
                  <input
                    type="number"
                    disabled={isRevealed}
                    value={val}
                    onChange={e => handleScoreChange(option.id, e.target.value)}
                    className="w-20 p-2 text-center text-xl font-black border-2 border-black rounded-none outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-100 transition-all disabled:opacity-70"
                    placeholder="–"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* RANKING */}
        {market.type === 'ranking' && (
          <div className="border-2 border-dashed border-black dark:border-white p-4">
            {!isRevealed && (
              <p className="text-xs font-bold uppercase text-gray-500 mb-4 bg-yellow-100 inline-block px-2 border border-black">
                Húzd a helyes sorrendbe!
              </p>
            )}
            <RankingMarket
              market={market}
              value={currentValue as string[] | undefined}
              favoriteId={undefined}
              onChange={handleRankingChange}
              onFavorite={() => {}}
              disabled={isRevealed}
            />
          </div>
        )}
      </div>
    </div>
  );
}
