import Step1Details from '@/components/wizard/step-1-details'

export default function CreateEventPage() {
  return (
    <div className="py-10 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Új Esemény</h1>
        <p className="text-gray-600 font-medium">Indítsd el a játékot 3 egyszerű lépésben.</p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-8 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
         <div className="flex items-center justify-between mb-10 text-sm font-bold uppercase relative">
           {/* Progress Line */}
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
           
           <div className="relative z-10 bg-white dark:bg-gray-900 px-2 flex flex-col items-center">
             <div className="w-8 h-8 flex items-center justify-center bg-black text-white border-2 border-black mb-1 shadow-[2px_2px_0px_0px_#000]">1</div>
             <span className="text-black dark:text-white">Részletek</span>
           </div>
           
           <div className="relative z-10 bg-white dark:bg-gray-900 px-2 flex flex-col items-center opacity-40">
             <div className="w-8 h-8 flex items-center justify-center bg-white text-black border-2 border-black mb-1">2</div>
             <span>Design</span>
           </div>
           
           <div className="relative z-10 bg-white dark:bg-gray-900 px-2 flex flex-col items-center opacity-40">
             <div className="w-8 h-8 flex items-center justify-center bg-white text-black border-2 border-black mb-1">3</div>
             <span>Kérdések</span>
           </div>
         </div>

         <Step1Details /> 
      </div>
    </div>
  )
}
