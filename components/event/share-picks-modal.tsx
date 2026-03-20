'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Download, Heart, Copy, Check } from 'lucide-react'
import html2canvas from 'html2canvas'

interface SharePicksModalProps {
  isOpen: boolean
  onClose: () => void
  eventTitle: string
  eventSlug: string
  picks: Record<string, any>
  favorites: Record<string, any>
  markets: any[]
  userName?: string
  results?: Record<string, any>
  userPoints?: number
}

// Standard hex colors to avoid html2canvas issues with Tailwind v4 'lab' colors
const COLORS = {
  white: '#ffffff',
  black: '#000000',
  yellow400: '#FACC15',
  gray500: '#6B7280',
  gray200: '#E5E7EB',
}

export default function SharePicksModal({
  isOpen,
  onClose,
  eventTitle,
  eventSlug,
  picks,
  favorites,
  markets,
  userName,
  results,
  userPoints,
}: SharePicksModalProps) {
  const isResultsMode = !!results
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const ticketRef = useRef<HTMLDivElement>(null)

  // Cleanup blob url on unmount or change
  useEffect(() => {
    return () => {
        if (downloadUrl) window.URL.revokeObjectURL(downloadUrl)
    }
  }, [downloadUrl])

  if (!isOpen) return null

  // Filter only answered markets
  const answeredMarkets = markets.filter(m => picks[m.id])

  const handleDownload = async () => {
    setIsGenerating(true)

    try {
        const blob = await generateTicketBlob();
        if (!blob) return;
        
        // Share / Download logic
        const file = new File([blob], `predikt-${eventSlug}-picks.png`, { type: 'image/png' });
        const isMobile = typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
        let shared = false;

        if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
             try {
                 await navigator.share({
                     files: [file],
                     title: 'Predikt Tippjeim',
                     text: `Itt vannak a tippjeim a(z) ${eventTitle} eseményre!`,
                 })
                 shared = true;
             } catch (e) {
                 console.warn('Share API cancelled/failed', e)
             }
        }

        if (!shared) {
             const url = window.URL.createObjectURL(blob);
             setDownloadUrl(url);
             
             // Try auto-download (works on Chrome/FF, blocked on Safari Desktop)
             const link = document.createElement('a')
             link.href = url
             link.download = `predikt-${eventSlug}-picks.png`
             document.body.appendChild(link)
             link.click()
             document.body.removeChild(link)
             // We do NOT revoke here immediately so the button link remains valid
        }

    } catch (err) {
      console.error('Hiba a kép generálásakor:', err)
      alert('Nem sikerült a képet létrehozni. Kérlek próbáld újra később!')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    setIsGenerating(true)
    
    // Create the promise immediately
    const blobPromise = generateTicketBlob().then(blob => {
        if (!blob) throw new Error("Generálás sikertelen");
        return blob;
    });

    try {
        // Use the Promise-based ClipboardItem approach for Safari support
        // This keeps the user interaction context alive while generation happens async
        const item = new ClipboardItem({
            'image/png': blobPromise
        });

        navigator.clipboard.write([item])
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
            })
            .catch((err) => {
                console.error('Copy failed (async)', err);
                alert('Nem sikerült a vágólapra másolni. Lehet, hogy a böngésződ nem támogatja ezt a funkciót.');
            })
            .finally(() => {
                setIsGenerating(false);
            });

    } catch (err) {
        // Fallback or initialization error
        console.error('Copy setup failed', err);
        // Try the old fashioned way if constructor fails (mostly for older browsers, though Safari is the main target here)
        blobPromise.then(blob => {
             if (!blob) return;
             return navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
             ]);
        })
        .then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        })
        .catch(e => {
            console.error('Legacy copy failed', e);
             alert('Nem sikerült a vágólapra másolni.');
        })
        .finally(() => setIsGenerating(false));
    }
  }


  const generateTicketBlob = async () => {
    if (!ticketRef.current) return null;
    
    // Tiny delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Clone the element manually to avoid Modal/Context issues in Safari
    const originalElement = ticketRef.current;
    const { offsetWidth, offsetHeight } = originalElement;
    
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Setup clone styles to be rendered off-screen but visible to the engine
    clone.style.position = 'fixed';
    clone.style.top = '0px';
    clone.style.left = '0px';
    clone.style.width = `${offsetWidth}px`;
    clone.style.height = `${offsetHeight}px`;
    clone.style.zIndex = '-9999'; 
    clone.style.background = '#ffffff'; // Force white background
    clone.style.pointerEvents = 'none'; // No interactions
    
    // Apply manual padding fix to the clone directly
    const innerContainer = clone.querySelector('#ticket-inner-container') as HTMLElement;
    if (innerContainer) {
        innerContainer.style.padding = '0px 16px 16px 16px';
    }
    
    // Remove shadows/borders from the container itself for clean cut
    clone.style.boxShadow = 'none';
    clone.style.borderRadius = '0';

    document.body.appendChild(clone);

    try {
        const canvas = await html2canvas(clone, {
            scale: 2, // Retina quality
            useCORS: true, // Enable CORS to safely load external images if headers allow
            allowTaint: false, // Must be false to ensure we can export to Blob (security)
            backgroundColor: '#ffffff',
            logging: false,
            width: offsetWidth,
            height: offsetHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: document.documentElement.offsetWidth, 
            windowHeight: document.documentElement.offsetHeight,
            ignoreElements: (element) => {
                // Ignore external URL links and lazyload images as requested to improve stability
                if (element.tagName === "A") {
                    const anchor = element as HTMLAnchorElement;
                    // Check if host is different (external link)
                    if (anchor.host && anchor.host !== window.location.host) {
                        return true;
                    }
                }
                if (element.getAttribute('loading') === "lazy") {
                    return true;
                }
                return false;
            }
        });

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => {
                // Cleanup
                document.body.removeChild(clone);
                resolve(blob);
            }, 'image/png');
        });
    } catch (error) {
        console.error('TicketGen Error:', error);
        if (document.body.contains(clone)) {
            document.body.removeChild(clone);
        }
        throw error;
    }
  }

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
        onClick={onClose}
    >
      <div 
        className="w-full max-w-md relative cursor-auto"
        onClick={(e) => e.stopPropagation()}
      >
         <button 
            type="button"
            onClick={onClose}
            className="fixed right-4 top-4 z-[70] text-white hover:text-yellow-400 transition-colors md:absolute md:-right-12 md:-top-2 p-2"
            aria-label="Bezárás"
         >
            <X className="w-8 h-8" />
         </button>


         {/* Controls - Sticky Header */}
         <div className="sticky top-0 z-50 py-4 mb-2 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 rounded-b-xl border-b border-white/10 shadow-lg">
             {downloadUrl ? (
                <div className="flex flex-col items-center gap-2">
                    <a
                        href={downloadUrl}
                        download={`predikt-${eventSlug}-picks.png`}
                        className="bg-green-500 text-white px-6 py-3 font-black uppercase text-sm border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] flex items-center gap-2 hover:translate-y-1 hover:shadow-none transition-all animate-bounce"
                        onClick={() => {
                             // Let the download happen
                             setTimeout(() => setDownloadUrl(null), 5000) 
                        }}
                    >
                        <Download className="w-5 h-5" /> KÉP LETÖLTÉSE
                    </a>
                    <span className="text-white/80 text-xs">Ha nem töltődött le automatikusan</span>
                </div>
             ) : (
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="bg-yellow-400 text-black px-6 py-3 font-black uppercase text-sm border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] flex items-center gap-2 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                >
                    {isGenerating ? 'Generálás...' : (
                        <>
                            <Download className="w-4 h-4" /> Kép Mentése / Megosztása
                        </>
                    )}
                </button>
             )}
             
             <button
                onClick={handleCopy}
                disabled={isGenerating}
                className={`mt-3 px-6 py-2 font-black uppercase text-xs border-2 flex items-center gap-2 transition-all disabled:opacity-50 ${isCopied ? 'bg-green-500 text-white border-green-500' : 'bg-white text-black border-white/50 hover:border-white hover:bg-gray-100'}`}
             >
                {isCopied ? (
                    <>
                        <Check className="w-3 h-3" /> Vágólapra Másolva!
                    </>
                ) : (
                    <>
                        <Copy className="w-3 h-3" /> Vágólapra Másolás (Facebookhoz)
                    </>
                )}
             </button>

             <span className="text-white text-xs font-bold opacity-80 decoration-dashed mt-2">
                 (Mobilon megosztás, Gépen letöltés)
             </span>
         </div>

         {/* THE RECEIPT PREVIEW (Just for display now, not for generation) */}
         <div ref={ticketRef} data-ticket-container="true" className="overflow-hidden rounded-sm shadow-2xl relative" style={{ margin: '0 auto' }}>
             <div  
                id="ticket-inner-container"
                className="p-6 font-mono text-sm leading-relaxed relative"
                style={{ 
                    minHeight: '400px',
                    backgroundColor: COLORS.white,
                    color: COLORS.black,
                }}
             >
                 {/* Header */}
                 <div
                    className="text-center mb-6 pb-6 border-b"
                    style={{ borderColor: COLORS.gray200 }}
                 >
                     <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">PREDIKT</h2>
                     <p className="text-xs font-bold uppercase tracking-widest" style={{ color: COLORS.gray500 }}>
                       {isResultsMode ? 'Eredménykártya' : 'Tippszelvény'}
                     </p>
                     <div className="mt-4 mb-2">
                         <h3 className="text-xl font-black uppercase leading-[1.1] block">{eventTitle}</h3>
                     </div>
                     <div className="mt-4 flex justify-between text-xs font-bold" style={{ color: COLORS.gray500 }}>
                         <span>DÁTUM: {new Date().toLocaleDateString('hu-HU')}</span>
                         <span>ID: #{eventSlug.substring(0, 6).toUpperCase()}</span>
                     </div>
                 </div>

                 {/* Score box – results mode only */}
                 {isResultsMode && (
                   <div style={{
                     border: `4px solid ${COLORS.black}`,
                     padding: '20px',
                     textAlign: 'center',
                     marginBottom: '24px',
                     boxShadow: `6px 6px 0 ${COLORS.black}`,
                   }}>
                     <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: COLORS.gray500, marginBottom: '8px' }}>
                       EREDMÉNYEM
                     </div>
                     <div style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1 }}>
                       {userPoints ?? '?'}
                     </div>
                     <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.gray500 }}>
                       / {markets.length} helyes válasz
                     </div>
                   </div>
                 )}

                 {/* List */}
                 <div className="space-y-4 mb-8">
                     {answeredMarkets.map((market, i) => {
                         const pickId = picks[market.id]

                         // Correct answer check
                         const correctVal = results?.[market.id]
                         let isCorrect = false
                         if (isResultsMode && correctVal !== undefined && pickId !== undefined) {
                           if (Array.isArray(correctVal)) {
                             isCorrect = Array.isArray(pickId)
                               ? pickId.some((id: string) => correctVal.includes(id))
                               : correctVal.includes(pickId)
                           } else {
                             isCorrect = pickId === correctVal
                           }
                         }

                         let label = ''
                         if (market.type === 'score') {
                             label = 'Pontszám tipp'
                         } else if (market.type === 'ranking') {
                             label = 'Sorrend tipp'
                         } else if (market.type === 'multiselect' && Array.isArray(pickId)) {
                             label = pickId.map((id: string) => market.options_json?.find((o: any) => o.id === id)?.label).filter(Boolean).join(', ')
                         } else {
                             const option = market.options_json?.find((o: any) => o.id === pickId)
                             label = option ? option.label : '???'
                         }

                         // Correct answer label (for wrong answers in results mode)
                         let correctLabel = ''
                         if (isResultsMode && !isCorrect && correctVal !== undefined) {
                             if (market.type === 'select' || market.type === 'boolean') {
                                 if (Array.isArray(correctVal)) {
                                     correctLabel = correctVal.map((id: string) => market.options_json?.find((o: any) => o.id === id)?.label).filter(Boolean).join(' & ')
                                 } else {
                                     const opt = market.options_json?.find((o: any) => o.id === correctVal)
                                     correctLabel = opt ? opt.label : ''
                                 }
                             } else if (market.type === 'multiselect' && Array.isArray(correctVal)) {
                                 correctLabel = correctVal.map((id: string) => market.options_json?.find((o: any) => o.id === id)?.label).filter(Boolean).join(', ')
                             }
                         }

                         const isFav = favorites[market.id]
                         let favLabel = ''
                         if (!isResultsMode && isFav && isFav !== pickId && market.options_json) {
                             const favOption = market.options_json.find((o: any) => o.id === isFav)
                             if (favOption) favLabel = favOption.label
                         }

                         return (
                             <div
                                key={market.id}
                                className="flex flex-col pb-4 mb-4 border-b last:border-0 last:mb-0 last:pb-0 relative"
                                style={{ borderColor: COLORS.gray200 }}
                             >
                                 <div className="flex justify-between items-start gap-4 mb-2">
                                     <span className="font-bold uppercase text-xs opacity-60 w-8 shrink-0">{(i + 1).toString().padStart(2, '0')}.</span>
                                     <span className="font-bold flex-grow uppercase leading-tight">{market.question}</span>
                                     {isResultsMode && (
                                       <span style={{
                                         fontWeight: 900,
                                         fontSize: '18px',
                                         color: isCorrect ? '#16a34a' : '#dc2626',
                                         lineHeight: 1,
                                         flexShrink: 0,
                                       }}>
                                         {isCorrect ? '✓' : '✗'}
                                       </span>
                                     )}
                                 </div>
                                 <div className="pl-12">
                                    <div style={{
                                        padding: '4px 0px',
                                        fontSize: '18px',
                                        fontWeight: 900,
                                        lineHeight: '1.25',
                                        color: isResultsMode && !isCorrect ? '#dc2626' : COLORS.black,
                                        textDecoration: isResultsMode && !isCorrect ? 'line-through' : 'none',
                                    }}>
                                        {label}
                                    </div>
                                    {correctLabel && (
                                        <div style={{
                                            marginTop: '4px',
                                            fontSize: '14px',
                                            fontWeight: 900,
                                            color: '#16a34a',
                                            textTransform: 'uppercase',
                                        }}>
                                            ✓ {correctLabel}
                                        </div>
                                    )}
                                    {!isResultsMode && (isFav && (!favLabel || isFav === pickId)) && (
                                        <Heart className="w-5 h-5" style={{ color: COLORS.black, fill: COLORS.black }} />
                                    )}
                                    {!isResultsMode && favLabel && (
                                        <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase" style={{ color: COLORS.black }}>
                                            <Heart className="w-3 h-3" style={{ color: COLORS.black, fill: COLORS.black }} />
                                            <span style={{ opacity: 0.7 }}>Szívügyem:</span>
                                            <span>{favLabel}</span>
                                        </div>
                                    )}
                                 </div>
                             </div>
                         )
                     })}
                 </div>

                 {/* Footer */}
                 <div className="pt-6 text-center border-t" style={{ borderColor: COLORS.gray200 }}>
                     <div className="mb-4">
                         <div className="inline-block mb-2">
                            <span className="font-black uppercase text-xl tracking-widest leading-[1.1] block">
                              {isResultsMode ? 'TE IS JÁTSSZ!' : 'SOK SIKERT!'}
                            </span>
                         </div>
                     </div>
                     <p className="text-xs font-bold uppercase mb-1">
                       {isResultsMode ? 'Nézd meg az eredményeket:' : 'Készítsd el te is a saját tippedet:'}
                     </p>
                     <p className="text-sm font-black underline">predikt.hu/e/{eventSlug}</p>
                     
                     <div className="mt-6 flex justify-center opacity-50">
                        {/* Fake Barcode */}
                        <div className="h-8 flex gap-1">
                            {[...Array(20)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-full ${Math.random() > 0.5 ? 'w-1' : 'w-2'}`}
                                    style={{ backgroundColor: COLORS.black }}
                                ></div>
                            ))}
                        </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  )
}
