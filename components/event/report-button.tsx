'use client'

import { useState } from 'react'
import { Flag, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { submitReportAction } from '@/app/actions'

export default function ReportButton({ eventId }: { eventId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return

    setIsSubmitting(true)
    const result = await submitReportAction(eventId, reason)
    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      setTimeout(() => {
          setIsOpen(false)
          setIsSuccess(false)
          setReason('')
      }, 3000)
    } else {
        alert('Hiba történt: ' + result.error)
    }
  }

  if (isSuccess) {
      return (
          <div className="text-green-600 flex items-center text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Köszönjük a bejelentést!
          </div>
      )
  }

  if (isOpen) {
      return (
          <form onSubmit={handleSubmit} className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 animate-in slide-in-from-top-2">
              <h4 className="text-sm font-bold text-red-800 dark:text-red-400 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Tartalom jelentése
              </h4>
              <textarea 
                  className="w-full p-2 text-sm border rounded mb-2 dark:bg-gray-800 dark:border-gray-700 decoration-gray-900 dark:text-gray-100"
                  placeholder="Mi a probléma ezzel az eseménnyel?"
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 px-3 py-1"
                  >
                      Mégse
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-red-700 flex items-center"
                  >
                      {isSubmitting && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                      Bejelentés
                  </button>
              </div>
          </form>
      )
  }

  return (
    <button 
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-red-500 flex items-center text-xs font-medium transition-colors"
    >
        <Flag className="w-3 h-3 mr-1" />
        Jelentem a tartalmat
    </button>
  )
}
