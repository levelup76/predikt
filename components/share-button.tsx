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
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-black uppercase tracking-wider border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Másolva!' : 'Esemény Megosztása'}
    </button>
  )
}