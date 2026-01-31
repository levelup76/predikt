'use server'

import { createClient } from '@/lib/supabase/server'
import { EventDetailsForm, slugify } from '@/lib/schemas'
import { redirect } from 'next/navigation'

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

export async function saveMarketsAction(eventId: string, markets: any[]) {
  const supabase = await createClient()

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
