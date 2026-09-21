/**
 * Backend retired (2026-09-21).
 *
 * The teacher stopped updating the site, so its Supabase project was shut
 * down to free the free-tier slot. The public site is fully static now:
 * every read serves `src/lib/fallback-content.ts` (which is what the
 * database held anyway), the enquiry form hands off to email, and `/admin`
 * is gone. Nothing reads VITE_SUPABASE_* any more, so stale env vars on
 * Vercel are harmless.
 */

export const isSupabaseConfigured = false as const

export const supabase = null

/** Kept for the data layer's type signature; never reachable in the built site. */
export function requireSupabase(): never {
  throw new Error('The backend was retired; content is served from fallback-content.ts')
}

/** No storage bucket any more: every image lives in /public or inline. */
export function publicStorageUrl(_bucket: string, _path: string): string {
  return ''
}
