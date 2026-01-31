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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href={`/e/${slug}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Vissza az eseményhez
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Statisztikák
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            <Users className="w-4 h-4" />
            <span>{validPredictions.length} tippelő</span>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="space-y-8 mb-12">
          {stats.map((market: any) => (
              <div key={market.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">{market.question}</h3>
                  
                  {market.distributions.length === 0 ? (
                      <p className="text-gray-400 italic text-sm">Még nem érkezett tipp.</p>
                  ) : (
                      <div className="space-y-3">
                          {market.distributions.map((dist: any) => (
                              <div key={dist.label}>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">{dist.label}</span>
                                      <span className="text-gray-500">{dist.count} szavazat ({dist.percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                      <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
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
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Leadott Tippek
          </h2>

          {!isRevealed ? (
               <div className="p-8 text-center bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <Lock className="w-10 h-10 mx-auto text-blue-400 mb-3" />
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">A tippek még rejtve vannak</h3>
                  <p className="text-blue-700 dark:text-blue-400 max-w-md mx-auto">
                      Az egyéni tippek listája akkor válik nyilvánossá, amikor az esemény lezárul. 
                      Addig csak a fenti összesített statisztikák láthatók.
                  </p>
               </div>
          ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                              <tr>
                                  <th className="px-6 py-3 font-bold">Játékos</th>
                                  <th className="px-6 py-3 font-bold text-center">Pontszám</th>
                                  <th className="px-6 py-3 text-right">Beküldve</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                             {validPredictions
                                .sort((a,b) => (b.points || 0) - (a.points || 0))
                                .map((pred: any) => (
                                 <tr key={pred.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                     <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 uppercase">
                                             {pred.profile?.full_name?.[0] || pred.profile?.username?.[0] || '?'}
                                         </div>
                                         <span>
                                            {pred.profile?.full_name || pred.profile?.username || 'Ismeretlen'}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                         {event.status === 'revealed' ? (
                                             <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                 {pred.points || 0} pont
                                             </span>
                                         ) : (
                                             <span className="text-gray-400">-</span>
                                         )}
                                     </td>
                                     <td className="px-6 py-4 text-right text-gray-500">
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
