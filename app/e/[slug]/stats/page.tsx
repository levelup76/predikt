import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock, Users, BarChart3, PieChart } from "lucide-react";

export const revalidate = 60; // Refresh every minute

export default async function EventStatsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Event + Markets
  const { data: event } = await supabase
    .from("events")
    .select(`*, markets(*)`)
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  // Sort markets order
  const markets = event.markets.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  // 2. Fetch Predictions + Profiles
  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, user_id, picks_json, points, profiles(full_name, username, avatar_url)")
    .eq("event_id", event.id);

  // If FK missing (based on previous issue), we might need the split fetch again?
  // Let's assume the previous issue was indeed the Join.
  // "profiles" might return null if no FK. Use safe check.
  // Actually, let's use the split fetch method to be 100% safe.
  
  const { data: allPredictions } = await supabase
     .from("predictions")
     .select("id, user_id, picks_json, points")
     .eq("event_id", event.id);

  // Fetch profiles
  let validPredictions: any[] = [];
  if (allPredictions && allPredictions.length > 0) {
      const userIds = allPredictions.map(p => p.user_id);
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, username').in('id', userIds);
      
      validPredictions = allPredictions.map(p => ({
          ...p,
          profile: profiles?.find(prof => prof.id === p.user_id)
      }));
  }

  const isRevealed = ['locked', 'revealed'].includes(event.status);
  const isOpen = event.status === 'open';

  // Calculate Stats per Market
  const stats = markets.map((market: any) => {
      const counts: Record<string, number> = {};
      let totalVotes = 0;

      validPredictions.forEach(pred => {
          const pick = pred.picks_json?.[market.id];
          if (!pick) return; // Skip if no pick for this market

          let key = "";
          if (market.type === 'score') {
              // pick is { optId: val, optId2: val }
               // Create a string representation e.g. "2 - 1"
               // We need map option IDs to labels to order them?
               // Let's just key by the stringified object values for grouping
               // Actually, for display we want "Real: 2, Barca: 1". 
               // Let's try to format it nicely.
               try {
                   const parts = market.options_json.map((opt: any) => {
                       return `${opt.label}: ${pick[opt.id] || '?'}`
                   });
                   key = parts.join(', ');
               } catch (e) { key = "Hiba"; }
          } else {
             // pick is optionId
             const opt = market.options_json.find((o: any) => o.id === pick);
             key = opt ? opt.label : 'Egyéb';
          }

          counts[key] = (counts[key] || 0) + 1;
          totalVotes++;
      });

      // Convert to array and sort
      const distributions = Object.entries(counts)
        .map(([label, count]) => ({ label, count, percentage: Math.round((count / totalVotes) * 100) }))
        .sort((a, b) => b.count - a.count);

      return {
          ...market,
          distributions,
          totalVotes
      };
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-mono">
      <div className="mb-8">
        <Link
          href={`/e/${slug}`}
          className="inline-flex items-center text-sm font-bold uppercase text-gray-500 hover:text-black dark:hover:text-white transition-colors border-b-2 border-transparent hover:border-black dark:hover:border-white"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Vissza az eseményhez
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-black uppercase flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-black dark:text-white" />
            Statisztikák
        </h1>
        <div className="flex items-center gap-2 text-sm font-bold uppercase bg-yellow-400 text-black px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Users className="w-4 h-4" />
            <span>{validPredictions.length} tippelő</span>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="space-y-8 mb-16">
          {stats.map((market: any) => (
              <div key={market.id} className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                  <h3 className="font-black uppercase text-xl mb-6 text-black dark:text-white border-b-2 border-black dark:border-white pb-2 inline-block">
                      {market.question}
                  </h3>
                  
                  {market.distributions.length === 0 ? (
                      <p className="text-gray-500 font-bold uppercase text-sm border-2 border-dashed border-gray-400 p-4">Még nem érkezett tipp.</p>
                  ) : (
                      <div className="space-y-4">
                          {market.distributions.map((dist: any) => (
                              <div key={dist.label}>
                                  <div className="flex justify-between text-sm font-bold uppercase mb-2">
                                      <span className="text-black dark:text-white">{dist.label}</span>
                                      <span className="text-gray-600 dark:text-gray-400">{dist.count} szavazat ({dist.percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-4 border-2 border-black dark:border-white p-[2px]">
                                      <div 
                                        className="bg-black dark:bg-white h-full" 
                                        style={{ width: `${dist.percentage}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          ))}
      </div>

      {/* Individual Votes Table */}
      <section>
          <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-3">
              <Users className="w-8 h-8" />
              Leadott Tippek
          </h2>

          {!isRevealed ? (
               <div className="p-12 text-center bg-gray-50 dark:bg-gray-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <Lock className="w-12 h-12 mx-auto text-black dark:text-white mb-4" />
                  <h3 className="text-xl font-black uppercase text-black dark:text-white mb-2">A tippek még rejtve vannak</h3>
                  <p className="text-gray-600 dark:text-gray-300 font-medium max-w-md mx-auto">
                      Az egyéni tippek listája akkor válik nyilvánossá, amikor az esemény lezárul. 
                      Addig csak a fenti összesített statisztikák láthatók.
                  </p>
               </div>
          ) : (
              <div className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="text-xs text-black dark:text-white uppercase bg-yellow-400 border-b-2 border-black dark:border-white">
                              <tr>
                                  <th className="px-6 py-4 font-black">Játékos</th>
                                  <th className="px-6 py-4 font-black text-center border-l-2 border-black dark:border-white">Pontszám</th>
                                  <th className="px-6 py-4 font-black text-right border-l-2 border-black dark:border-white hidden sm:table-cell">Beküldve</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-black dark:divide-white">
                             {validPredictions
                                .sort((a,b) => (b.points || 0) - (a.points || 0))
                                .map((pred: any) => (
                                 <tr key={pred.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                     <td className="px-6 py-4 font-bold text-black dark:text-white flex items-center gap-3">
                                         <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center font-black text-black dark:text-white uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                             {pred.profile?.full_name?.[0] || pred.profile?.username?.[0] || '?'}
                                         </div>
                                         <span className="uppercase tracking-tight">
                                            {pred.profile?.full_name || pred.profile?.username || 'Ismeretlen'}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 text-center border-l-2 border-black dark:border-white">
                                         {event.status === 'revealed' ? (
                                             <span className="inline-block px-3 py-1 font-black bg-black text-white dark:bg-white dark:text-black uppercase">
                                                 {pred.points || 0} PTS
                                             </span>
                                         ) : (
                                             <span className="text-gray-400 font-black">-</span>
                                         )}
                                     </td>
                                     <td className="px-6 py-4 text-right font-medium text-gray-600 dark:text-gray-400 border-l-2 border-black dark:border-white hidden sm:table-cell">
                                         {new Date(pred.submitted_at || Date.now()).toLocaleDateString('hu-HU')}
                                     </td>
                                 </tr>
                             ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
      </section>

    </div>
  );
}
