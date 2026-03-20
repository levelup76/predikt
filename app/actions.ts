'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EventDetailsForm, slugify } from '@/lib/schemas'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// --- EVENT LIFECYCLE ACTIONS ---

// Delete Event (Creator Only)
export async function deleteEventAction(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Jelentkezz be!' }

    // Check ownership
    const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('creator_id')
        .eq('id', eventId)
        .single()

    if (fetchError || !event) {
        return { error: 'Esemény nem található.' }
    }

    if (event.creator_id !== user.id) {
        return { error: 'Nincs jogosultságod törölni ezt az eseményt.' }
    }

    // Soft delete: set deleted_at
    const { error: deleteError } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', eventId)

    if (deleteError) {
      return { error: 'Törlés sikertelen: ' + deleteError.message }
    }

    // Audit log
    await supabase.from('event_audit_logs').insert({
      event_id: eventId,
      user_id: user.id,
      action: 'delete',
      details: {},
      created_at: new Date().toISOString()
    })

    // Notification to owner
    await supabase.from('notifications').insert({
      user_id: user.id,
      event_id: eventId,
      message: 'Az esemény törlésre került. Visszaállítható 7 napig.',
      created_at: new Date().toISOString()
    })

    return { success: true }
}

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

export async function publishEventAction(eventId: string, visibility: 'public' | 'private' = 'public') {
  const supabase = await createClient()
  
  const { error } = await supabase.from('events').update({
    status: 'open',
    visibility: visibility
  }).eq('id', eventId)
  
  if (error) return { error: 'Hiba a publikáláskor' }
  
  // Fetch slug for redirect
  const { data } = await supabase.from('events').select('slug').eq('id', eventId).single()
  
  return { success: true, slug: data?.slug }
}

export async function submitPredictionAction(eventId: string, picks: Record<string, any>, favorites: Record<string, any> = {}) {
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
    favorites_json: favorites,
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

// --- RESULTS & REVEAL ACTIONS ---

export async function revealResultsAction(eventId: string, resultJson: Record<string, any>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { data: event } = await supabase
    .from('events')
    .select('creator_id, status, lock_at, title, slug')
    .eq('id', eventId)
    .single()

  if (!event) return { error: 'Esemény nem található.' }
  if (event.creator_id !== user.id) return { error: 'Csak a létrehozó fedheti fel az eredményeket.' }
  if (new Date(event.lock_at) > new Date()) return { error: 'A tippelési határidő még nem járt le.' }

  const { data: markets } = await supabase
    .from('markets')
    .select('id, type')
    .eq('event_id', eventId)

  const { error: updateError } = await supabase
    .from('events')
    .update({ result_json: resultJson, status: 'revealed', reveal_at: new Date().toISOString() })
    .eq('id', eventId)

  if (updateError) return { error: 'Hiba az eredmények mentésekor.' }

  const { data: predictions } = await supabase
    .from('predictions')
    .select('id, user_id, picks_json')
    .eq('event_id', eventId)

  if (predictions?.length && markets?.length) {
    const totalMarkets = markets.length

    const pointsUpdates = predictions.map(prediction => {
      const picks = prediction.picks_json || {}
      let points = 0

      for (const market of markets) {
        const correct = resultJson[market.id]
        const answer = picks[market.id]
        if (correct === undefined || answer === undefined) continue

        if (market.type === 'select' || market.type === 'boolean') {
          if (Array.isArray(correct) ? correct.includes(answer) : answer === correct) points++
        } else if (market.type === 'multiselect') {
          // Point if at least one of the user's picks is among the correct answers
          if (Array.isArray(correct) && Array.isArray(answer)) {
            if (answer.some((id: string) => correct.includes(id))) points++
          }
        } else if (market.type === 'score') {
          if (typeof correct === 'object' && typeof answer === 'object') {
            const allMatch = Object.keys(correct).every(k => String(answer[k]) === String(correct[k]))
            if (allMatch) points++
          }
        } else if (market.type === 'ranking') {
          if (Array.isArray(correct) && Array.isArray(answer)) {
            if (JSON.stringify(answer) === JSON.stringify(correct)) points++
          }
        }
      }

      return { id: prediction.id, userId: prediction.user_id, points }
    })

    // Use admin client to bypass RLS – predictions belong to other users
    let adminClient: ReturnType<typeof createAdminClient> | null = null
    try { adminClient = createAdminClient() } catch (e) { console.error('Admin client error:', e) }

    await Promise.all(pointsUpdates.map(({ id, points }) =>
      (adminClient ?? supabase).from('predictions').update({ points }).eq('id', id)
    ))

    await Promise.all(pointsUpdates.map(({ userId, points }) =>
      supabase.from('notifications').insert({
        user_id: userId,
        event_id: eventId,
        message: `"${event.title}" – Eredmények megjelentek! ${points}/${totalMarkets} helyes válasz.`,
        created_at: new Date().toISOString()
      })
    ))

    if (process.env.RESEND_API_KEY && adminClient) {
      try {
        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://predikt.app'}/e/${event.slug}`

        await Promise.all(pointsUpdates.map(async ({ userId, points }) => {
          try {
            const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
            const email = authUser?.user?.email
            if (!email) return

            await resend.emails.send({
              from: 'Predikt <noreply@predikt.app>',
              to: email,
              subject: `Eredmények közzétéve: ${event.title}`,
              html: `
                <div style="font-family: monospace; max-width: 500px; margin: 0 auto;">
                  <h1 style="border-bottom: 4px solid black; padding-bottom: 12px;">Az eredmények megjelentek!</h1>
                  <p>Az <strong>${event.title}</strong> esemény végeredményei már elérhetők.</p>
                  <div style="border: 4px solid black; padding: 24px; text-align: center; margin: 24px 0; box-shadow: 8px 8px 0 black;">
                    <div style="font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Eredményed</div>
                    <div style="font-size: 64px; font-weight: 900; line-height: 1;">${points}</div>
                    <div style="font-size: 24px; font-weight: bold;">/ ${totalMarkets}</div>
                    <div style="font-size: 14px; margin-top: 8px;">helyes válasz</div>
                  </div>
                  <a href="${shareUrl}" style="display: block; background: #000; color: #fff; padding: 16px 24px; text-decoration: none; font-weight: 900; text-transform: uppercase; text-align: center; letter-spacing: 0.1em;">
                    Megnézem az eredményeket →
                  </a>
                  <p style="margin-top: 24px; color: #666; font-size: 12px;">Predikt Csapata</p>
                </div>
              `
            })
          } catch (e) {
            console.error('Email send error:', e)
          }
        }))
      } catch (e) {
        console.error('Admin client error for email:', e)
      }
    }
  }

  await supabase.from('event_audit_logs').insert({
    event_id: eventId,
    user_id: user.id,
    action: 'reveal',
    details: {},
    created_at: new Date().toISOString()
  })

  revalidatePath(`/e/${event.slug}`)
  revalidatePath(`/e/${event.slug}/admin`)
  revalidatePath('/')
  return { success: true }
}

// --- ADMIN ACTIONS ---

const ADMIN_EMAILS = ['levelup.production@gmail.com'];

export async function deleteEventAdminAction(formData: FormData) {
    const eventId = formData.get('id') as string;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        return { error: 'Unauthorized' }
    }
    
    // Use Admin Client to bypass RLS policies
    let adminClient;
    try {
        adminClient = createAdminClient()
    } catch (e) {
        console.error('Admin Client Error:', e)
        return { error: 'Szerver konfigurációs hiba: Hiányzó Service Role Key' }
    }

    // 1. Manually Cascade Delete Reports
    await adminClient.from('reports').delete().eq('event_id', eventId)
    
    // 2. Soft Delete Event
    const { error } = await adminClient.from('events').update({ deleted_at: new Date().toISOString() }).eq('id', eventId)

    if (error) {
      console.error('Delete failed:', error)
      return { error: 'Törlés sikertelen: ' + error.message }
    }

    // Audit log
    await adminClient.from('event_audit_logs').insert({
      event_id: eventId,
      user_id: user.id,
      action: 'delete',
      details: {},
      created_at: new Date().toISOString()
    })

    // Notification to owner
    const { data: event } = await adminClient.from('events').select('creator_id').eq('id', eventId).single()
    if (event?.creator_id) {
      await adminClient.from('notifications').insert({
        user_id: event.creator_id,
        event_id: eventId,
        message: 'Az esemény törlésre került admin által. Visszaállítható 7 napig.',
        created_at: new Date().toISOString()
      })
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  }

  export async function toggleUserBanAction(formData: FormData) {
  const userId = formData.get('id') as string;
  if (!userId) {
    return { error: 'Missing user ID' };
  }
  const supabase = await createClient();
  // Fetch current ban status
  const { data: profile, error } = await supabase.from('profiles').select('is_banned').eq('id', userId).single();
  if (error) {
    return { error: 'User lookup failed' };
  }
  const newStatus = !profile?.is_banned;
  const { error: updateError } = await supabase.from('profiles').update({ is_banned: newStatus }).eq('id', userId);
  if (updateError) {
    return { error: 'Update failed' };
  }
  return { success: true, is_banned: newStatus };
}

export async function submitReportAction(eventId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // We insert into 'reports' table
    const { error } = await supabase.from('reports').insert({
        event_id: eventId,
        reporter_id: user?.id || null, // Can be anonymous if strict, or null
        reason: reason,
        status: 'pending' // pending review
    })

    if (error) {
        console.error('Report error:', error)
        return { error: 'Jelentés sikertelen. Kérlek próbáld újra.' }
    }

    // Send Email Notification to Admin
    try {
        const { data: event } = await supabase.from('events').select('title, slug').eq('id', eventId).single()
        const eventTitle = event?.title || 'Ismeretlen esemény'
        const eventLink = event ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/e/${event.slug}` : '#'

        await resend.emails.send({
            from: 'Predikt <noreply@predikt.hu>', // Make sure you have a valid domain or use resend default for testing
            to: ADMIN_EMAILS,
            subject: `[Predikt] ÚJ JELENTÉS: ${eventTitle}`,
            html: `
              <h2>Új tartalom jelentés érkezett</h2>
              <p>Egy felhasználó jelentette a következő eseményt:</p>
              <ul>
                 <li><strong>Esemény:</strong> ${eventTitle}</li>
                 <li><strong>Indoklás:</strong> ${reason}</li>
                 <li><strong>Jelentő:</strong> ${user?.email || 'Ismeretlen / Anonim'}</li>
                 <li><strong>Link:</strong> <a href="${eventLink}">${eventLink}</a></li>
              </ul>
              <p>Kérlek, vizsgáld ki az esetet az <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin">Admin Dashboardon</a>.</p>
            `
        })
    } catch (err) {
        console.error('Failed to send admin email:', err)
        // We don't fail the action if email fails
    }

    return { success: true }
}

