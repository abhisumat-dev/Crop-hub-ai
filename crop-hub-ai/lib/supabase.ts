import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { CropRow } from '@/lib/types'

export type { CropRow }

/**
 * Server-side Supabase client using the service-role key. This must only be
 * imported from Route Handlers / server code — never from a 'use client'
 * component — because the service-role key bypasses Row Level Security.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
        'See README.md for setup instructions.',
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

export async function fetchAllCrops(): Promise<CropRow[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('crops_master')
    .select('*')
    .order('crop_name', { ascending: true })

  if (error) throw new Error(`Supabase fetch failed: ${error.message}`)
  return data as CropRow[]
}
