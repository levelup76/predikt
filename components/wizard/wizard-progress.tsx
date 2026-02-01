'use client'

import clsx from 'clsx'

export default function WizardProgress({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const steps = [
    { num: 1, label: 'Részletek' },
    { num: 2, label: 'Kérdések' },
    { num: 3, label: 'Előnézet' },
    { num: 4, label: 'Kirakás' },
  ]

  return (
    <div className="flex items-center justify-between mb-10 text-sm font-bold uppercase relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
        
        {steps.map((step) => {
            const isActive = step.num === currentStep
            const isCompleted = step.num < currentStep
            const isFuture = step.num > currentStep

            return (
                <div key={step.num} className={clsx("relative z-10 bg-white dark:bg-gray-900 px-2 flex flex-col items-center", isFuture && "opacity-40")}>
                    <div className={clsx(
                        "w-8 h-8 flex items-center justify-center border-2 mb-1 transition-all",
                        isActive ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_#000] dark:bg-white dark:text-black dark:border-white dark:shadow-[2px_2px_0px_0px_#fff]" : 
                        isCompleted ? "bg-white text-black border-black dark:bg-gray-800 dark:text-white dark:border-white" :
                        "bg-white text-black border-black dark:bg-gray-900 dark:text-white dark:border-white"
                    )}>
                        {step.num}
                    </div>
                    <span className="text-black dark:text-white">{step.label}</span>
                </div>
            )
        })}
    </div>
  )
}
