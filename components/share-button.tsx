'use client'

import { Share2, Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function ShareButton({ title, slug }: { title: string, slug: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/e/${slug}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tippelj erre: ${title} | Predikt`,
          text: `Nézd meg ezt az eseményt a Predikten: ${title}`,
          url: url
        })
        return
      } catch (err) {
        console.log('Error sharing:', err)
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <button 
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Másolva!' : 'Megosztás'}
    </button>
  )
}