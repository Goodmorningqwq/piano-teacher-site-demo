import { requireSupabase } from './supabase'
import {
  isDemoMode,
  demoDeleteCourse,
  demoDeleteEnquiry,
  demoDeleteVideo,
  demoGetProfile,
  demoGetSettings,
  demoInsertCourse,
  demoInsertEnquiry,
  demoInsertVideo,
  demoListCourses,
  demoListEnquiries,
  demoListVideos,
  demoUpdateCourse,
  demoUpdateEnquiry,
  demoUpdateProfile,
  demoUpdateSettings,
  demoUpdateVideo,
} from './demo-store'
import type { Course, Enquiry, Profile, SiteSettings, Video } from './database.types'

/**
 * Single data-access layer for the whole app.
 *
 * Every read and write goes through here so the demo store and Supabase are
 * interchangeable, and so no component needs to know which one is live.
 * The demo branches are stripped from production builds along with
 * `isDemoMode`.
 */

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message)
  return result.data as T
}

function assertOk(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message)
}

// ---------- profile ----------

export async function fetchProfile(): Promise<Profile> {
  if (isDemoMode) return demoGetProfile()
  return unwrap(
    await requireSupabase().from('profile').select('*').eq('id', 1).single(),
  ) as Profile
}

export async function saveProfile(patch: Partial<Profile>): Promise<void> {
  if (isDemoMode) return demoUpdateProfile(patch)
  assertOk(await requireSupabase().from('profile').update(patch).eq('id', 1))
}

// ---------- site settings ----------

export async function fetchSettings(): Promise<SiteSettings> {
  if (isDemoMode) return demoGetSettings()
  return unwrap(
    await requireSupabase().from('site_settings').select('*').eq('id', 1).single(),
  ) as SiteSettings
}

export async function saveSettings(patch: Partial<SiteSettings>): Promise<void> {
  if (isDemoMode) return demoUpdateSettings(patch)
  assertOk(await requireSupabase().from('site_settings').update(patch).eq('id', 1))
}

// ---------- courses ----------

export async function fetchCourses(includeHidden: boolean): Promise<Course[]> {
  if (isDemoMode) return demoListCourses(includeHidden)

  let query = requireSupabase().from('courses').select('*').order('sort_order')
  if (!includeHidden) query = query.eq('is_published', true)
  return (unwrap(await query) ?? []) as Course[]
}

export async function createCourse(course: Partial<Course>): Promise<Course> {
  if (isDemoMode) return demoInsertCourse(course)
  return unwrap(
    await requireSupabase().from('courses').insert(course).select().single(),
  ) as Course
}

export async function saveCourse(id: string, patch: Partial<Course>): Promise<void> {
  if (isDemoMode) return demoUpdateCourse(id, patch)
  assertOk(await requireSupabase().from('courses').update(patch).eq('id', id))
}

export async function deleteCourse(id: string): Promise<void> {
  if (isDemoMode) return demoDeleteCourse(id)
  assertOk(await requireSupabase().from('courses').delete().eq('id', id))
}

export async function reorderCourses(ordered: Course[]): Promise<void> {
  if (isDemoMode) {
    ordered.forEach((course, index) => demoUpdateCourse(course.id, { sort_order: index + 1 }))
    return
  }
  const results = await Promise.all(
    ordered.map((course, index) =>
      requireSupabase().from('courses').update({ sort_order: index + 1 }).eq('id', course.id),
    ),
  )
  for (const result of results) assertOk(result)
}

// ---------- videos ----------

export async function fetchVideos(includeHidden: boolean): Promise<Video[]> {
  if (isDemoMode) return demoListVideos(includeHidden)

  let query = requireSupabase().from('videos').select('*').order('sort_order')
  if (!includeHidden) query = query.eq('is_published', true)
  return (unwrap(await query) ?? []) as Video[]
}

export async function createVideo(video: Partial<Video>): Promise<Video> {
  if (isDemoMode) return demoInsertVideo(video)
  return unwrap(
    await requireSupabase().from('videos').insert(video).select().single(),
  ) as Video
}

export async function saveVideo(id: string, patch: Partial<Video>): Promise<void> {
  if (isDemoMode) return demoUpdateVideo(id, patch)
  assertOk(await requireSupabase().from('videos').update(patch).eq('id', id))
}

export async function deleteVideo(id: string): Promise<void> {
  if (isDemoMode) return demoDeleteVideo(id)
  assertOk(await requireSupabase().from('videos').delete().eq('id', id))
}

export async function reorderVideos(ordered: Video[]): Promise<void> {
  if (isDemoMode) {
    ordered.forEach((video, index) => demoUpdateVideo(video.id, { sort_order: index + 1 }))
    return
  }
  const results = await Promise.all(
    ordered.map((video, index) =>
      requireSupabase().from('videos').update({ sort_order: index + 1 }).eq('id', video.id),
    ),
  )
  for (const result of results) assertOk(result)
}

// ---------- enquiries ----------

export async function fetchEnquiries(): Promise<Enquiry[]> {
  if (isDemoMode) return demoListEnquiries()
  return (unwrap(
    await requireSupabase().from('enquiries').select('*').order('created_at', { ascending: false }),
  ) ?? []) as Enquiry[]
}

export async function createEnquiry(input: {
  name: string
  email: string
  phone?: string | null
  message: string
}): Promise<void> {
  if (isDemoMode) return demoInsertEnquiry(input)
  assertOk(await requireSupabase().from('enquiries').insert(input))
}

export async function saveEnquiry(id: string, patch: Partial<Enquiry>): Promise<void> {
  if (isDemoMode) return demoUpdateEnquiry(id, patch)
  assertOk(await requireSupabase().from('enquiries').update(patch).eq('id', id))
}

export async function deleteEnquiry(id: string): Promise<void> {
  if (isDemoMode) return demoDeleteEnquiry(id)
  assertOk(await requireSupabase().from('enquiries').delete().eq('id', id))
}
