import { notFound } from "next/navigation"

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <div>
       <div className="mb-6">
         <span className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
           Esemény
         </span>
         <h1 className="text-3xl font-extrabold mt-1 uppercase">{slug.replace('-', ' ')}</h1>
       </div>
       
       <div className="prose dark:prose-invert max-w-none">
         <p className="lead">
           Itt jelennek majd meg a fogadási piacok (kérdések) az eseménnyel kapcsolatban.
         </p>
       </div>
       
       <div className="mt-8 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/50 p-6 rounded-lg text-yellow-800 dark:text-yellow-200">
         <p className="font-semibold">Fejlesztés alatt</p>
         <p>Csatlakoztasd az adatbázist a valódi események betöltéséhez.</p>
       </div>
    </div>
  )
}
