import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-12 px-4">
      <Link 
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Vissza a főoldalra
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center mb-10 text-center">
             <div className="relative w-24 h-24 mb-6">
                <Image src="/logo.png" alt="Predikt Logo" width={550} height={550} className="object-contain" />
             </div>
             <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
               Predikt
             </h1>
             <p className="text-lg text-gray-500 font-medium">Közösségi Tippjáték</p>
        </div>

        {/* Development Warning */}
        <div className="mb-10 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
           <p className="text-amber-800 dark:text-amber-200 font-medium">
             ⚠️ Az oldal jelenleg fejlesztés alatt áll.
           </p>
           <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
             Hibákkal, javaslatokkal keressenek a <a href="mailto:levelup@levelup.hu" className="underline font-bold hover:text-amber-900 dark:hover:text-amber-100">levelup@levelup.hu</a> címen!
           </p>
        </div>

        <div className="space-y-8 text-lg text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Az Ötlet
            </h2>
            <p>
              Ez az oldal <strong>Fekete Zsombor</strong> ötlete alapján jött létre, azzal a céllal, hogy közösségi teret biztosítson a tippjátékok szerelmeseinek.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
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
