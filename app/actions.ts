'use server'

import { createClient } from '@/lib/supabase/server'
import { EventDetailsForm, slugify } from '@/lib/schemas'
import { redirect } from 'next/navigation'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function createEventDraftAction(data: EventDetailsForm) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Jelentkezz be!' }
  }

  const slug = slugify(data.title) + '-' + Math.random().toString(36).substring(2, 7)

  const { data: event, error } = await supabase.from('events').insert({
    creator_id: user.id,
    title: data.title,
    slug: slug,
    description: data.description,
    category: data.category,
    source_url: data.source_url || null,
    lock_at: data.lock_at,
    status: 'draft',
    theme: 'modern' // Default, will update in next step
  }).select().single()

  if (error) {
    console.error('Create Event Error:', error)
    return { error: 'Hiba történt a mentéskor.' }
  }

  // Redirect to next step (handled in client usually, but we return ID)
  return { success: true, eventId: event.id }
}

export async function updateEventDesignAction(eventId: string, theme: string, coverImage: string | null) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('events').update({
    theme,
    cover_image: coverImage
  }).eq('id', eventId)

  if (error) {
    return { error: 'Hiba a design mentésekor' }
  }

  return { success: true }
}

// --- EDIT ACTIONS ---

// Update Basic Details (Title, Desc, etc.) - Allowed in DRAFT and OPEN
export async function updateEventDetailsAction(eventId: string, data: EventDetailsForm) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  // Check event ownership and status
  const { data: event } = await supabase.from('events').select('creator_id, status').eq('id', eventId).single()
  
  if (!event) return { error: 'Esemény nem található.' }
  if (event.creator_id !== user.id) return { error: 'Csak a létrehozó szerkesztheti.' }
  if (['locked', 'revealed'].includes(event.status)) return { error: 'Lezárt esemény nem szerkeszthető.' }

  // Check locking date validity
  if (new Date(data.lock_at) <= new Date()) {
      return { error: 'A lezárás idejének a jövőben kell lennie.' }
  }

  const { error } = await supabase.from('events').update({
    title: data.title,
    description: data.description,
    category: data.category,
    source_url: data.source_url || null,
    lock_at: data.lock_at,
  }).eq('id', eventId)

  if (error) return { error: 'Hiba a mentés során.' }
  
  return { success: true }
}

export async function saveMarketsAction(eventId: string, markets: any[]) {
  const supabase = await createClient()
  
  // Security & Policy Check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: event } = await supabase.from('events').select('creator_id, status').eq('id', eventId).single()
  
  if (!event || event.creator_id !== user?.id) return { error: 'Nincs jogosultságod.' }
  
  // POLICY: Markets can only be edited if DRAFT or (OPEN with 0 predictions)
  if (event.status !== 'draft') {
      // Check predictions count
      const { count } = await supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
      
      if (count && count > 0) {
          return { error: 'Már érkeztek tippek, a kérdések nem módosíthatók!' }
      }
      
      // If status is LOCKED or REVEALED, definitely no edit
      if (['locked', 'revealed'].includes(event.status)) {
         return { error: 'Lezárt esemény kérdései nem módosíthatók.' }
      }
  }

  // 1. Delete existing markets for this event (simple override logic for MVP)
  // Warning: In production, preserve IDs if editing!
  await supabase.from('markets').delete().eq('event_id', eventId)

  const marketsToInsert = markets.map((m, index) => ({
    event_id: eventId,
    question: m.question,
    type: m.type,
    options_json: m.options,
    order: index
  }))

  const { error } = await supabase.from('markets').insert(marketsToInsert)

  if (error) {
    console.error(error)
    return { error: 'Hiba a kérdések mentésekor' }
  }

  return { success: true }
}

export async function publishEventAction(eventId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('events').update({
    status: 'open'
  }).eq('id', eventId)
  
  if (error) return { error: 'Hiba a publikáláskor' }
  
  // Fetch slug for redirect
  const { data } = await supabase.from('events').select('slug').eq('id', eventId).single()
  
  return { success: true, slug: data?.slug }
}

export async function submitPredictionAction(eventId: string, picks: Record<string, string>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Jelentkezz be a tippeléshez!' }

  // 1. Check if event is locked
  const { data: event } = await supabase.from('events').select('id, title, slug, lock_at, status').eq('id', eventId).single()
  
  if (!event) return { error: 'Nem létező esemény' }
  
  if (new Date(event.lock_at) < new Date() || event.status !== 'open') {
    return { error: 'A tippelés már lezárult!' }
  }

  // 2. Check 1-hour Modification Rule
  // Fetch existing prediction to see when it was CREATED
  const { data: existingPrediction } = await supabase
    .from('predictions')
    .select('created_at, submitted_at')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .single()

  let isFirstTime = true

  if (existingPrediction) {
      isFirstTime = false
      const createdAt = new Date(existingPrediction.created_at).getTime()
      const now = Date.now()
      const oneHour = 60 * 60 * 1000

      if (now - createdAt > oneHour) {
          return { error: 'Letelt a módosításra rendelkezésre álló 1 óra!' }
      }
  }

  // 3. Insert or Update Prediction
  // We use upsert to handle both cases
  // Note: created_at is preserved by default in upsert if not specified
  const { error } = await supabase.from('predictions').upsert({
    user_id: user.id,
    event_id: eventId,
    picks_json: picks,
    submitted_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id, event_id'
  })

  if (error) {
    console.error('Prediction Error:', error)
    return { error: 'Hiba a tipp mentésekor.' }
  }

  // 4. Send Confirmation Email (Only on first vote OR always? User said "megerősítő levél ... hogy elküldte a szavazatát")
  // Let's send it every time they save successfully, or maybe just first time? 
  // "Confirmation that they sent their vote" implies every successful submission.
  
  if (process.env.RESEND_API_KEY && user.email) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://predikt.app'}/e/${event.slug}`
      
      try {
          await resend.emails.send({
              from: 'Predikt <noreply@predikt.app>', // Needs verified domain. If testing, use 'onboarding@resend.dev'
              to: user.email,
              subject: `Tipp rögzítve: ${event.title}`,
              html: `
                <h1>Szia!</h1>
                <p>Sikeresen rögzítettük a tippjeidet a következő eseményre: <strong>${event.title}</strong>.</p>
                
                <p>A tippedet a leadástól számított 1 órán belül módosíthatod.</p>
                
                <h3>Oszd meg másokkal is!</h3>
                <p>Itt a link az eseményhez:</p>
                <p><a href="${shareUrl}">${shareUrl}</a></p>
                
                <p>Sok sikert!</p>
                <p>Predikt Csapata</p>
              `
          })
      } catch (emailError) {
          console.error("Failed to send email:", emailError)
          // We don't fail the request if email fails, just log it.
      }
  }

  return { success: true }
}

  return { success: true }
}
