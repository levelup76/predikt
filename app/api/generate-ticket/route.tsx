// fs and path removed to prevent build errors in edge/non-node environments if we switch later
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Explicit Node.js runtime

export async function POST(req: NextRequest) {
  // v1.1 - Clean build verify
  try {
    const { eventTitle, eventSlug, items } = await req.json();

    let fontData: ArrayBuffer | null = null;
    
    // Attempt to load font - using fetch because local file appears to have invalid signature
    try {
        console.log('API: Fetching font from remote URL...');
        // Using jsDelivr for a reliable WOFF source (Satori supports WOFF)
        const fontUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/roboto-mono@5.0.8/files/roboto-mono-latin-700-normal.woff';
        const fontRes = await fetch(fontUrl);
        
        if (fontRes.ok) {
            fontData = await fontRes.arrayBuffer();
            console.log('API: Remote font loaded successfully. Size:', fontData.byteLength);
        } else {
             console.error('API: Failed to fetch remote font:', fontRes.status, fontRes.statusText);
        }

    } catch (fsError) {
        console.error('API: Font Loading Error:', fsError);
    }

    const fonts = fontData ? [
        {
          name: 'Roboto Mono',
          data: fontData,
          style: 'normal' as const,
          weight: 700 as const,
        },
    ] : undefined;
    
    
    // Attempt to generate image with custom font
    try {
      if (fonts) {
        return new ImageResponse(
          (
            <div
              style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                padding: '40px',
              }}
            >
                {/* THE RECEIPT CONTAINER */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '500px', // Fixed width for consistency
                  minHeight: '800px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  borderTop: '8px solid #FACC15', // yellow-400
                  borderBottom: '8px solid #FACC15',
                  padding: '24px',
                  position: 'relative',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  fontFamily: 'Roboto Mono',
                }}
              >
                 {/* Header */}
                 <div 
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '24px',
                        borderBottom: '2px dashed #000',
                        paddingBottom: '24px',
                    }}
                 >
                     <span style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px' }}>PREDIKT</span>
                     <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#6B7280', marginTop: '4px' }}>Tippszelvény</span>
                     
                     <div 
                        style={{
                            display: 'flex',
                            marginTop: '16px',
                            border: '2px solid #000',
                            padding: '12px 24px',
                        }}
                     >
                         <span style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' }}>{eventTitle}</span>
                     </div>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '16px', fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>
                         <span>DÁTUM: {new Date().toLocaleDateString('hu-HU')}</span>
                         <span>ID: #{eventSlug?.substring(0, 6).toUpperCase()}</span>
                     </div>
                 </div>
    
                 {/* List */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                     {(items || []).map((item: any, i: number) => (
                         <div 
                            key={i} 
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                borderBottom: '1px solid #E5E7EB',
                                paddingBottom: '16px',
                            }}
                         >
                             <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                                 <span style={{ fontWeight: 700, fontSize: '12px', opacity: 0.6, width: '32px' }}>{item.num}.</span>
                                 <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>{item.q}</span>
                             </div>
                             <div style={{ paddingLeft: '48px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div 
                                        style={{ 
                                            display: 'flex',
                                            backgroundColor: '#000000', 
                                            color: '#ffffff',
                                            padding: '10px 16px',
                                            minWidth: '60px',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span style={{ fontSize: '18px', fontWeight: 900, lineHeight: 1 }}>{item.a}</span>
                                    </div>
                                    {/* Heart Icon (SVG) */}
                                    {(item.fav && (!item.favLabel || item.favLabel === item.a)) && (
                                       <svg width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                         <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                       </svg>
                                    )}
                                </div>
                                
                                {item.favLabel && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#000' }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                             <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                        </svg>
                                        <span style={{ opacity: 0.7 }}>Szívügyem:</span>
                                        <span>{item.favLabel}</span>
                                    </div>
                                )}
                             </div>
                         </div>
                     ))}
                 </div>
    
                 {/* Footer */}
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '2px dashed #000', paddingTop: '24px', marginTop: 'auto' }}>
                     <div style={{ display: 'flex', border: '2px solid #000', padding: '12px 24px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>SOK SIKERT!</span>
                     </div>
                     
                     <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Készítsd el te is a saját tippedet:</span>
                     <span style={{ fontSize: '14px', fontWeight: 900, textDecoration: 'underline' }}>predikt.hu/e/{eventSlug}</span>
                     
                     {/* Barcode-ish */}
                     <div style={{ display: 'flex', gap: '4px', height: '32px', marginTop: '24px', opacity: 0.5 }}>
                        {[...Array(20)].map((_, i) => (
                            <div 
                                key={i} 
                                style={{ 
                                    height: '100%', 
                                    width: Math.random() > 0.5 ? '4px' : '8px',
                                    backgroundColor: '#000' 
                                }}
                            />
                        ))}
                     </div>
                 </div>
              </div>
            </div>
          ),
          {
            width: 600,
            height: 1200,
            fonts: fonts, 
          }
        );
      }
    } catch (fontError) {
      console.error('API: Failed to generate with custom font, falling back:', fontError);
    }
    
    // Fallback: Return image without custom fonts if font loading failed or font generation crashed
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            padding: '40px',
          }}
        >
            {/* THE RECEIPT CONTAINER */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '500px', // Fixed width for consistency
              minHeight: '800px',
              backgroundColor: '#ffffff',
              color: '#000000',
              borderTop: '8px solid #FACC15', // yellow-400
              borderBottom: '8px solid #FACC15',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              fontFamily: 'Roboto Mono',
            }}
          >
             {/* Header */}
             <div 
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '24px',
                    borderBottom: '2px dashed #000',
                    paddingBottom: '24px',
                }}
             >
                 <span style={{ fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px' }}>PREDIKT</span>
                 <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#6B7280', marginTop: '4px' }}>Hivatalos Tippszelvény</span>
                 
                 <div 
                    style={{
                        display: 'flex',
                        marginTop: '16px',
                        border: '2px solid #000',
                        padding: '12px 24px',
                    }}
                 >
                     <span style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' }}>{eventTitle}</span>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '16px', fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>
                     <span>DÁTUM: {new Date().toLocaleDateString('hu-HU')}</span>
                     <span>ID: #{eventSlug?.substring(0, 6).toUpperCase()}</span>
                 </div>
             </div>

             {/* List */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                 {(items || []).map((item: any, i: number) => (
                     <div 
                        key={i} 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            borderBottom: '1px solid #E5E7EB',
                            paddingBottom: '16px',
                        }}
                     >
                         <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                             <span style={{ fontWeight: 700, fontSize: '12px', opacity: 0.6, width: '32px' }}>{item.num}.</span>
                             <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>{item.q}</span>
                         </div>
                         <div style={{ paddingLeft: '48px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div 
                                    style={{ 
                                        display: 'flex',
                                        backgroundColor: '#000000', 
                                        color: '#ffffff',
                                        padding: '10px 16px',
                                        minWidth: '60px',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span style={{ fontSize: '18px', fontWeight: 900, lineHeight: 1 }}>{item.a}</span>
                                </div>
                                {/* Heart Icon (SVG) */}
                                {(item.fav && (!item.favLabel || item.favLabel === item.a)) && (
                                   <svg width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                     <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                   </svg>
                                )}
                            </div>
                            
                            {item.favLabel && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#000' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                         <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                    </svg>
                                    <span style={{ opacity: 0.7 }}>Szívügyem:</span>
                                    <span>{item.favLabel}</span>
                                </div>
                            )}
                         </div>
                     </div>
                 ))}
             </div>

             {/* Footer */}
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '2px dashed #000', paddingTop: '24px', marginTop: 'auto' }}>
                 <div style={{ display: 'flex', border: '2px solid #000', padding: '12px 24px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>SOK SIKERT!</span>
                 </div>
                 
                 <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Készítsd el te is a saját tippedet:</span>
                 <span style={{ fontSize: '14px', fontWeight: 900, textDecoration: 'underline' }}>predikt.hu/e/{eventSlug}</span>
                 
                 {/* Barcode-ish */}
                 <div style={{ display: 'flex', gap: '4px', height: '32px', marginTop: '24px', opacity: 0.5 }}>
                    {[...Array(20)].map((_, i) => (
                        <div 
                            key={i} 
                            style={{ 
                                height: '100%', 
                                width: Math.random() > 0.5 ? '4px' : '8px',
                                backgroundColor: '#000' 
                            }}
                        />
                    ))}
                 </div>
             </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 1200,
      }
    );
  } catch (e: any) {
    console.error('API Error Detailed:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
