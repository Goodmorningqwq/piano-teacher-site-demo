import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Whether a backend is wired up.
 *
 * The site is designed to render fully without one: when this is false the
 * content hooks serve the bundled placeholder content instead. That keeps
 * local development unblocked before the Supabase project exists, and means
 * a backend outage degrades the live site to static content rather than a
 * blank page.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Narrowing helper for the many call sites that require a live client. */
export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
    )
  }
  return supabase
}

/** Public URL for an object in a storage bucket. */
export function publicStorageUrl(bucket: string, path: string): string {
  if (!supabase) return ''
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
