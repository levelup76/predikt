
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Server, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield className="w-16 h-16 mx-auto mb-4 text-black dark:text-white" />
            <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 tracking-tight">
                Adatkezelési Tájékoztató
            </h1>
            <div className="inline-block bg-yellow-400 text-black px-4 py-2 font-bold uppercase text-xs md:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Utolsó módosítás: 2026. február 1.
            </div>
        </div>

        <div className="space-y-12">
            
            {/* 1. Barátságos Bevezető */}
            <section>
                <div className="mb-8 p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
                    <h2 className="text-2xl md:text-4xl font-black uppercase text-black dark:text-white mb-4">
                        Szia! 👋 Röviden a lényegről.
                    </h2>
                    <p className="text-black dark:text-gray-200 font-bold text-lg md:text-xl leading-relaxed">
                        A Predikt egy játék, és mi azt szeretnénk, hogy jól érezd magad. 
                        Nem kereskedünk az adataiddal, nem adjuk el őket marketing cégeknek, és vigyázunk rájuk. 
                        Csak azokat az adatokat kérjük el, ami ahhoz kell, hogy működjön a játék (pl. hogy be tudj lépni és számolhassuk a pontjaidat).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* KIK VAGYUNK */}
                     <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
                            <UserCheck className="w-8 h-8" />
                            <h3 className="font-black uppercase text-xl text-black dark:text-white">Mit tudunk rólad?</h3>
                        </div>
                        <ul className="space-y-3 font-medium text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-black dark:text-white">1.</span>
                                A nevedet és e-mail címedet (amit a Google/Discord ad).
                            </li>
                             <li className="flex items-start gap-2">
                                <span className="font-bold text-black dark:text-white">2.</span>
                                A tippeidet és az eseményeidet.
                            </li>
                             <li className="flex items-start gap-2">
                                <span className="font-bold text-black dark:text-white">3.</span>
                                Hogy mikor léptél be utoljára.
                            </li>
                        </ul>
                     </div>

                     {/* HOL VANNAK AZ ADATOK */}
                     <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                            <Lock className="w-8 h-8" />
                            <h3 className="font-black uppercase text-xl text-black dark:text-white">Biztonságban vannak?</h3>
                        </div>
                         <ul className="space-y-3 font-medium text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-black dark:text-white">Igen.</span>
                                Modern felhő szolgáltatókat használunk (Supabase, Vercel).
                            </li>
                             <li className="flex items-start gap-2">
                                <span className="font-bold text-black dark:text-white">Titkosítva.</span>
                                Az adataid titkosított csatornákon közlekednek.
                            </li>
                             <li className="flex items-start gap-2">
                                <span className="font-bold text-black dark:text-white">Csak mi.</span>
                                Nincs harmadik fél, nem adjuk ki senkinek.
                            </li>
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

            {/* 2. Hivatalos GDPR Adatok */}
            <section className="bg-gray-100 dark:bg-gray-800 border-2 border-black dark:border-white p-6 md:p-10">
                 <h2 className="text-xl md:text-3xl font-black uppercase mb-8 flex items-center gap-3 text-gray-800 dark:text-gray-100">
                    <Shield className="w-8 h-8" />
                    Adatkezelési Adatok (GDPR)
                </h2>

                {/* ADATKEZELŐ */}
                <div className="mb-8">
                    <h3 className="font-bold uppercase text-sm text-gray-500 mb-2 border-b border-gray-300 pb-1">Adatkezelő Adatai</h3>
                    <div className="bg-white dark:bg-black p-4 border border-gray-300 dark:border-gray-600 font-mono text-sm grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                            <span className="block text-xs uppercase text-gray-400">Cégnév</span>
                            <span className="text-lg font-bold">level up Bt.</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-400">Adószám</span>
                            <span className="font-bold">21336748-1-41</span>
                        </div>
                         <div>
                            <span className="block text-xs uppercase text-gray-400">Székhely</span>
                            <span className="font-bold">1031 Budapest, Vízimolnár utca 30 1/2</span>
                        </div>
                         <div>
                            <span className="block text-xs uppercase text-gray-400">Cégjegyzékszám</span>
                            <span className="font-bold">01-06-778389</span>
                        </div>
                         <div className="col-span-1 md:col-span-2">
                            <span className="block text-xs uppercase text-gray-400">Képviselő</span>
                            <span className="font-bold block">Fekete Zsombor</span>
                        </div>
                         <div className="col-span-1 md:col-span-2">
                            <span className="block text-xs uppercase text-gray-400">Kapcsolat</span>
                            <span className="font-bold block">E-mail: levelup@levelup.hu</span>
                            <span className="font-bold block">Tel: +36 30 229 2688</span>
                        </div>
                    </div>
                </div>

                {/* JOGALAPOK */}
                <div className="mb-8">
                    <h3 className="font-bold uppercase text-sm text-gray-500 mb-2 border-b border-gray-300 pb-1">Adatkezelés Jogalapja</h3>
                    <ul className="list-disc ml-5 text-sm font-medium space-y-1 text-gray-700 dark:text-gray-300">
                        <li><strong>Szerződés teljesítése (GDPR 6. cikk (1) b)):</strong> A szolgáltatás biztosítása.</li>
                        <li><strong>Jogos érdek (GDPR 6. cikk (1) f)):</strong> Biztonság, csalásmegelőzés.</li>
                        <li><strong>Jogi kötelezettség (GDPR 6. cikk (1) c)):</strong> Számviteli kötelezettségek teljesítése.</li>
                    </ul>
                </div>

                {/* TECHNIKAI PARTNEREK */}
                <div className="mb-8">
                     <h3 className="font-bold uppercase text-sm text-gray-500 mb-2 border-b border-gray-300 pb-1">Technikai Partnerek (Adatfeldolgozók)</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border border-gray-300 dark:border-gray-600">
                            <thead className="bg-gray-200 dark:bg-gray-700 uppercase font-bold text-xs">
                                <tr>
                                    <th className="p-2">Név</th>
                                    <th className="p-2">Szerepkör</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300 dark:divide-gray-600 bg-white dark:bg-black">
                                <tr>
                                    <td className="p-2 font-bold">Supabase Inc.</td>
                                    <td className="p-2">Adatbázis szolgáltatás (EU/USA)</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-bold">Vercel Inc.</td>
                                    <td className="p-2">Hosting szolgáltatás</td>
                                </tr>
                            </tbody>
                        </table>
                     </div>
                </div>

                {/* JOGORVOSLAT */}
                <div>
                    <h3 className="font-bold uppercase text-sm text-gray-500 mb-2 border-b border-gray-300 pb-1">Jogorvoslat & Hatóság</h3>
                    <p className="text-sm mb-3">Panasz esetén a Nemzeti Adatvédelmi és Információszabadság Hatósághoz fordulhat:</p>
                    <div className="bg-white dark:bg-black p-3 border border-gray-300 dark:border-gray-600 text-xs font-mono">
                        <strong>NAIH (Nemzeti Adatvédelmi és Információszabadság Hatóság)</strong><br/>
                        1055 Budapest, Falk Miksa utca 9-11.<br/>
                        Levelezési cím: 1363 Budapest, Pf.: 9.<br/>
                        E-mail: ugyfelszolgalat@naih.hu
                    </div>
                </div>

            </section>
            
            {/* 6. Kapcsolat - Footer része */}
            <section className="bg-black text-white p-6 md:p-8 -mx-6 md:-mx-12 border-t-2 border-black dark:border-white mt-8 mb-[-3rem] md:mb-[-3rem]">
                <h3 className="text-2xl font-black uppercase mb-2 text-yellow-400">
                    Kérdésed van?
                </h3>
                <p className="font-medium mb-6">
                  Adatkezeléssel kapcsolatos kérdéseivel forduljon hozzánk bizalommal.
                </p>
                <a href="mailto:levelup@levelup.hu" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-black uppercase border-2 border-transparent hover:bg-yellow-400 hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
                    <Mail className="w-5 h-5" />
                    levelup@levelup.hu
                </a>
            </section>
        </div>

      </div>
    </div>
  )
}
