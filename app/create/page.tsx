import Step1Details from '@/components/wizard/step-1-details'
import WizardProgress from '@/components/wizard/wizard-progress'

export default function CreateEventPage() {
  return (
    <div className="py-10 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Új Esemény</h1>
        <p className="text-gray-600 font-medium">Indítsd el a játékot 4 egyszerű lépésben.</p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-8 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
         <WizardProgress currentStep={1} />

         <Step1Details /> 
      </div>
    </div>
  )
}
