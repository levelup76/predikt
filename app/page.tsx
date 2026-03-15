import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch real events from DB
  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug, description, lock_at, status, theme, category, deleted_at")
    .eq("status", "open")
    .neq("visibility", "private")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 font-mono">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12">
        
        {/* Sidebar / Hero Area */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-6">
          <div className="bg-yellow-400 dark:bg-yellow-500 p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] border-2 border-black dark:border-white">
            <h1 className="text-5xl font-black text-black mb-4 uppercase leading-none tracking-tighter">
              Predikt
            </h1>
            <p className="text-black font-bold text-lg mb-6 leading-tight">
              Te vagy a legnagyobb jós a világon!
            </p>
            <div className="space-y-2 text-sm font-bold">
               <div className="bg-white text-black p-2 border-2 border-black flex items-center gap-2">
                 <span className="text-red-500">✖</span> Nem fogadás
               </div>
               <div className="bg-white text-black p-2 border-2 border-black flex items-center gap-2">
                 <span className="text-blue-500">✖</span> Nem lottó
               </div>
               <div className="bg-black text-white p-2 border-2 border-black flex items-center gap-2">
                 <span className="text-green-400">✔</span> Csak dicsőség
               </div>
            </div>
          </div>

           <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
             <h3 className="font-bold text-lg uppercase mb-2">Hogyan?</h3>
             <ul className="list-disc list-inside space-y-2 text-sm">
               <li>Hozz létre eseményt</li>
               <li>Hívd meg a haverokat</li>
               <li>Tippeljetek</li>
               <li>Röhögj a veszteseken</li>
             </ul>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
            <div className="bg-black text-white p-4 mb-8 border-2 border-black dark:border-white flex justify-between items-center transform -rotate-1">
                <h2 className="text-2xl font-black uppercase">Aktív Események</h2>
                <Link href="/create" className="bg-white text-black px-4 py-1 text-sm font-bold hover:bg-yellow-400 transition-colors uppercase">
                    + Létrehozás
                </Link>
            </div>
            
            {!events || events.length === 0 ? (
                <div className="p-12 text-center opacity-50 font-bold border-2 border-dashed border-gray-400">
                    Nincs aktív esemény. Hozz létre te egyet!
                </div>
            ) : (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <Link key={event.id} href={`/e/${event.slug}`} className="block bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all">
                            <div className="flex justify-between items-start mb-2">
                                    <span className="bg-black text-white text-xs px-2 py-1 font-bold uppercase">{event.category || 'Általános'}</span>
                                    <span className="font-bold text-xs">{new Date(event.lock_at).toLocaleDateString('hu-HU')}</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase mb-1">{event.title}</h3>
                            <p className="font-medium text-gray-600 dark:text-gray-300 line-clamp-2">{event.description}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}