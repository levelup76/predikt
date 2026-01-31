import Step1Details from '@/components/wizard/step-1-details'

export default function CreateEventPage() {
  return (
    <div className="py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold">Új Esemény Létrehozása</h1>
        <p className="text-gray-500">Indítsd el a játékot 3 egyszerű lépésben.</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="flex items-center justify-center mb-8 space-x-4 text-sm">
           <span className="font-bold text-blue-600">1. Részletek</span>
           <span className="text-gray-400">&rarr;</span>
           <span className="text-gray-400">2. Design</span>
           <span className="text-gray-400">&rarr;</span>
           <span className="text-gray-400">3. Kérdések</span>
         </div>

         <Step1Details /> 
      </div>
    </div>
  )
}
