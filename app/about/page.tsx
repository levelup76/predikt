import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <Link 
        href="/"
        className="inline-flex items-center text-sm font-bold uppercase text-black dark:text-white hover:underline mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Vissza a főoldalra
      </Link>

      <div className="bg-white dark:bg-gray-900 p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] border-2 border-black dark:border-white">
        <div className="flex flex-col items-center mb-10 text-center">
             <div className="relative w-24 h-24 mb-6">
                <Image 
                  src="/logo.png?v=2" 
                  alt="Predikt Logo" 
                  width={550} 
                  height={550} 
                  className="object-contain" 
                  unoptimized
                />
             </div>
             <h1 className="text-5xl md:text-6xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">
               Predikt
             </h1>
             <p className="text-xl text-gray-500 font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1">Közösségi Tippjáték</p>
        </div>

        {/* Development Warning */}
        <div className="mb-10 p-6 bg-yellow-400 border-2 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           <p className="text-black font-black uppercase text-lg">
             ⚠️ Az oldal jelenleg fejlesztés alatt áll ⚠️
           </p>
           <p className="text-black font-medium text-sm mt-2 border-t border-black pt-2 inline-block">
             Hibákkal, javaslatokkal keressenek a <a href="mailto:levelup@levelup.hu" className="uppercase font-black hover:bg-black hover:text-white px-1">levelup@levelup.hu</a> címen!
           </p>
        </div>

        <div className="space-y-10 text-lg text-black dark:text-white font-medium">
          <section className="border-l-4 border-black dark:border-white pl-6">
            <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-3">
              Az Ötlet
            </h2>
            <p>
              Ez az oldal <strong>Fekete Zsombor</strong> ötlete alapján jött létre, azzal a céllal, hogy közösségi teret biztosítson a tippjátékok szerelmeseinek.
            </p>
          </section>

          <section className="border-l-4 border-black dark:border-white pl-6">
            <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-3">
              A Megvalósítás
            </h2>
            <p>
              A platform fejlesztését a <strong>Gemini Pro</strong> mesterséges intelligencia végezte, ötvözve a modern webes technológiákat a felhasználóbarát kialakítással.
            </p>
          </section>

          <section className="pt-8 border-t border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Kapcsolat
            </h2>
            <p>
              Észrevételeiddel, ötleteiddel vagy kérdéseiddel keress minket bizalommal:
            </p>
            <a 
              href="mailto:levelup@levelup.hu" 
              className="inline-block mt-2 text-blue-600 dark:text-blue-400 font-medium hover:underline text-xl"
            >
              levelup@levelup.hu
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
