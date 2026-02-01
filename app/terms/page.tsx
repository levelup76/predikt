
import Link from 'next/link';
import { ArrowLeft, Shield, Gavel, FileText, AlertTriangle, Smile, Users, XCircle, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12 px-4 mx-auto">
      <Link 
        href="/"
        className="inline-flex items-center text-sm font-bold uppercase text-black dark:text-white hover:underline mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Vissza a főoldalra
      </Link>

      <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 md:p-12">
        
        {/* Header Section */}
        <div className="mb-10 text-center border-b-2 border-black dark:border-white pb-8">
            <Gavel className="w-16 h-16 mx-auto mb-4 text-black dark:text-white" />
            <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 tracking-tight">
                Játékszabályok
            </h1>
            <div className="inline-block bg-yellow-400 text-black px-4 py-2 font-bold uppercase text-xs md:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Érvényes: 2026. február 1-től
            </div>
        </div>

        <div className="space-y-12">
            
            {/* 1. Barátságos Bevezető */}
            <section>
                <div className="mb-8 p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
                    <h2 className="text-2xl md:text-4xl font-black uppercase text-black dark:text-white mb-4">
                        Üdv a fedélzeten! 🚀
                    </h2>
                    <p className="text-black dark:text-gray-200 font-bold text-lg md:text-xl leading-relaxed">
                        Örülök, hogy itt vagy! A Predikt célja a szórakozás. Semmi komoly, csak egy jó kis tippelgetés a barátokkal vagy a közösséggel.
                        Hogy mindenki jól érezze magát, van pár egyszerű kérésem ("házirend"), amit kérlek, tarts be.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* "NEM PÉNZ" KÁRTYA */}
                     <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-8 h-8" />
                            <h3 className="font-black uppercase text-xl text-black dark:text-white">Ez NEM szerencsejáték!</h3>
                        </div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                            Itt <strong>nincs valódi pénz</strong>. Nem tudsz befizetni, és nem tudsz nyerni pénzt. 
                            Pontokat kapsz, amikkel (egyelőre) csak a dicsőségfalra kerülhetsz fel.
                            Kérlek, ne használd az oldalt illegális fogadások szervezésére!
                        </p>
                     </div>

                     {/* VISELKEDÉS KÁRTYA */}
                     <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                            <Smile className="w-8 h-8" />
                            <h3 className="font-black uppercase text-xl text-black dark:text-white">Légy jófej!</h3>
                        </div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                            Ez egy közösség. Bárki létrehozhat eseményt.
                        </p>
                        <ul className="mt-2 space-y-1 text-sm font-bold">
                            <li className="flex items-center gap-2 text-green-700 dark:text-green-400"><CheckCircle2 className="w-4 h-4"/> Legyél tisztelettudó a chaten / nevekben.</li>
                            <li className="flex items-center gap-2 text-red-600 dark:text-red-400"><XCircle className="w-4 h-4"/> Ne ossz meg sértő vagy illegális tartalmat.</li>
                        </ul>
                     </div>
                </div>
            </section>

             <div className="relative py-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-black dark:border-white border-dashed"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-gray-900 px-4 text-sm font-black uppercase text-gray-500">A hivatalos rész</span>
                </div>
            </div>

            {/* 2. Hivatalos Szabályzat */}
            <section className="bg-gray-100 dark:bg-gray-800 border-2 border-black dark:border-white p-6 md:p-10 text-justify">
                 <h2 className="text-xl md:text-3xl font-black uppercase mb-8 flex items-center gap-3 text-gray-800 dark:text-gray-100">
                    <FileText className="w-8 h-8" />
                    Általános Szerződési Feltételek
                </h2>

                <div className="space-y-6 text-sm md:text-base font-medium text-gray-800 dark:text-gray-300">
                    <div>
                        <h4 className="font-black uppercase mb-2">1. Szolgáltató Adatai</h4>
                        <p>Az oldal üzemeltetője a <strong>level up Bt.</strong> (Székhely: 1031 Budapest, Vízimolnár utca 30 1/2, Adószám: 21336748-1-41, Cégjegyzékszám: 01-06-778389, Képviselő: Fekete Zsombor, E-mail: levelup@levelup.hu). (Továbbiakban: Szolgáltató).</p>
                    </div>

                    <div>
                        <h4 className="font-black uppercase mb-2">2. A Szolgáltatás Tárgya</h4>
                        <p>A Szolgáltató egy online felületet ("Predikt") biztosít, ahol a felhasználók regisztráció után eseményeket hozhatnak létre, és kimenetelekre tippelhetnek játékpénzben/pontokban. A szolgáltatás "as is" (ahogy van) alapon működik.</p>
                    </div>

                    <div>
                        <h4 className="font-black uppercase mb-2">3. Regisztráció</h4>
                        <p>A regisztráció ingyenes. A felhasználó felelős a fiókja biztonságáért. Egy személy csak egy fiókot használhat a fair play érdekében. A Szolgáltató fenntartja a jogot a fiók felfüggesztésére szabályszegés esetén.</p>
                    </div>

                    <div>
                        <h4 className="font-black uppercase mb-2">4. Felelősségkorlátozás</h4>
                        <p>A Szolgáltató kizár minden felelősséget a felhasználók által létrehozott tartalmakért (események nevei, leírásai). Nem vállalunk felelősséget az oldal esetleges leállásából vagy adatvesztésből eredő károkért, de mindent megteszünk a folyamatos működésért.</p>
                    </div>
                    
                    <div>
                        <h4 className="font-black uppercase mb-2">5. Módosítás</h4>
                         <p>Fenntartom a jogot a szabályzat módosítására. A jelentős változásokról értesítést küldünk.</p>
                    </div>
                </div>

            </section>
            
            {/* Kapcsolat */}
            <section className="text-center pt-8">
                 <p className="font-medium text-gray-500">Ha bármi kérdésed van, írj bátran: <a href="mailto:levelup@levelup.hu" className="text-black dark:text-white font-bold underline">levelup@levelup.hu</a></p>
            </section>
        </div>

      </div>
    </div>
  )
}
