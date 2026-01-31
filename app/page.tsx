import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch real events from DB
  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug, description, lock_at, status, theme, category")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Tippelj. Oszd meg. Dicsekedj.</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Ingyenes közösségi tippjáték az Oscar-tól a Bajnokok Ligájáig.
          Hívd ki a barátaidat és mutasd meg, ki a nagyobb jós!
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Aktív Események</h2>
        
        {!events || events.length === 0 ? (
           <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <p className="text-gray-500 mb-4">Jelenleg nincs aktív esemény.</p>
             <Link href="/create" className="text-blue-600 hover:underline font-medium">
               Hozz létre te egyet!
             </Link>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => {
              // Quick theme color mapping for cover placeholder
              const themeMap: Record<string, string> = {
                modern: 'from-blue-500 to-purple-600',
                elegant: 'from-yellow-600 to-gray-900',
                retro: 'from-pink-500 to-indigo-500',
                neon: 'from-green-400 to-blue-900',
              };
              const themeColor = themeMap[event.theme || 'modern'] || themeMap.modern;

              return (
                <Link
                  key={event.id}
                  href={`/e/${event.slug}`}
                  className="block group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className={`h-40 bg-gradient-to-r ${themeColor}`}></div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(event.lock_at).toLocaleDateString('hu-HU')}
                      <span className="mx-2">•</span>
                      <span className="uppercase text-xs font-semibold tracking-wider text-green-600 dark:text-green-400">
                        Nyitva
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                      Tippelés indítása <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
