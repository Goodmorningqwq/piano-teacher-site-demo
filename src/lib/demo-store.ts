import {
  fallbackCourses,
  fallbackProfile,
  fallbackSettings,
  fallbackVideos,
} from './fallback-content'
import { isSupabaseConfigured } from './supabase'
import type { Course, Enquiry, Profile, SiteSettings, Video } from './database.types'

/**
 * Demo mode — a local stand-in for Supabase, for development only.
 *
 * Gated on `import.meta.env.DEV`, so every branch that reads this constant
 * is dead code in a production build and gets stripped: the demo login and
 * this store cannot exist in the deployed site. It also switches itself off
 * the moment real Supabase credentials are present, so configuring the
 * backend is all it takes to leave demo mode behind.
 */
export const isDemoMode = import.meta.env.DEV && !isSupabaseConfigured

const STORAGE_KEY = 'pj-demo-data'

export type DemoData = {
  profile: Profile
  settings: SiteSettings
  courses: Course[]
  videos: Video[]
  enquiries: Enquiry[]
}

function seed(): DemoData {
  // Deep-clone: the fallback content is shared module state and must not
  // be mutated by edits made in the demo panel.
  return structuredClone({
    profile: fallbackProfile,
    settings: fallbackSettings,
    courses: fallbackCourses,
    videos: fallbackVideos,
    enquiries: [] as Enquiry[],
  })
}

let cache: DemoData | null = null

export function loadDemo(): DemoData {
  if (cache) return cache

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    cache = raw ? (JSON.parse(raw) as DemoData) : seed()
  } catch {
    cache = seed()
  }
  return cache
}

function persist(data: DemoData) {
  cache = data
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    // Most likely the 5MB quota, blown by base64 image data URLs.
    console.warn('[demo] could not persist — changes are session-only:', error)
  }
}

function mutate(fn: (data: DemoData) => void) {
  const data = structuredClone(loadDemo())
  fn(data)
  persist(data)
}

/** Wipe local edits and start again from the seeded placeholder content. */
export function resetDemo() {
  cache = null
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

const timestamp = () => new Date().toISOString()

// ---------- profile / settings ----------

export function demoGetProfile(): Profile {
  return loadDemo().profile
}

export function demoUpdateProfile(patch: Partial<Profile>) {
  mutate((data) => {
    data.profile = { ...data.profile, ...patch, updated_at: timestamp() }
  })
}

export function demoGetSettings(): SiteSettings {
  return loadDemo().settings
}

export function demoUpdateSettings(patch: Partial<SiteSettings>) {
  mutate((data) => {
    data.settings = { ...data.settings, ...patch, updated_at: timestamp() }
  })
}

// ---------- courses ----------

export function demoListCourses(includeHidden: boolean): Course[] {
  const all = [...loadDemo().courses].sort((a, b) => a.sort_order - b.sort_order)
  return includeHidden ? all : all.filter((course) => course.is_published)
}

export function demoInsertCourse(course: Partial<Course>): Course {
  const created: Course = {
    id: crypto.randomUUID(),
    sort_order: course.sort_order ?? 0,
    is_published: course.is_published ?? false,
    title_zh: course.title_zh ?? '',
    title_en: course.title_en ?? null,
    summary_zh: course.summary_zh ?? null,
    summary_en: course.summary_en ?? null,
    level_zh: course.level_zh ?? null,
    level_en: course.level_en ?? null,
    duration_min: course.duration_min ?? null,
    price: course.price ?? null,
    price_note_zh: course.price_note_zh ?? null,
    price_note_en: course.price_note_en ?? null,
    icon: course.icon ?? 'note',
    image_url: course.image_url ?? null,
    created_at: timestamp(),
    updated_at: timestamp(),
    // Preserve the id when a delete is being undone.
    ...(course.id ? { id: course.id } : {}),
  }
  mutate((data) => {
    data.courses.push(created)
  })
  return created
}

export function demoUpdateCourse(id: string, patch: Partial<Course>) {
  mutate((data) => {
    data.courses = data.courses.map((course) =>
      course.id === id ? { ...course, ...patch, updated_at: timestamp() } : course,
    )
  })
}

export function demoDeleteCourse(id: string) {
  mutate((data) => {
    data.courses = data.courses.filter((course) => course.id !== id)
  })
}

// ---------- videos ----------

export function demoListVideos(includeHidden: boolean): Video[] {
  const all = [...loadDemo().videos].sort((a, b) => a.sort_order - b.sort_order)
  return includeHidden ? all : all.filter((video) => video.is_published)
}

export function demoInsertVideo(video: Partial<Video>): Video {
  const created: Video = {
    id: crypto.randomUUID(),
    sort_order: video.sort_order ?? 0,
    is_published: video.is_published ?? false,
    title_zh: video.title_zh ?? '',
    title_en: video.title_en ?? null,
    description_zh: video.description_zh ?? null,
    description_en: video.description_en ?? null,
    source_type: video.source_type ?? 'placeholder',
    external_id: video.external_id ?? null,
    storage_path: video.storage_path ?? null,
    poster_url: video.poster_url ?? null,
    duration_sec: video.duration_sec ?? null,
    created_at: timestamp(),
    updated_at: timestamp(),
    ...(video.id ? { id: video.id } : {}),
  }
  mutate((data) => {
    data.videos.push(created)
  })
  return created
}

export function demoUpdateVideo(id: string, patch: Partial<Video>) {
  mutate((data) => {
    data.videos = data.videos.map((video) =>
      video.id === id ? { ...video, ...patch, updated_at: timestamp() } : video,
    )
  })
}

export function demoDeleteVideo(id: string) {
  mutate((data) => {
    data.videos = data.videos.filter((video) => video.id !== id)
  })
}

// ---------- enquiries ----------

export function demoListEnquiries(): Enquiry[] {
  return [...loadDemo().enquiries].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function demoInsertEnquiry(input: {
  name: string
  email: string
  phone?: string | null
  message: string
}) {
  mutate((data) => {
    data.enquiries.push({
      id: crypto.randomUUID(),
      created_at: timestamp(),
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message,
      is_read: false,
    })
  })
}

export function demoUpdateEnquiry(id: string, patch: Partial<Enquiry>) {
  mutate((data) => {
    data.enquiries = data.enquiries.map((enquiry) =>
      enquiry.id === id ? { ...enquiry, ...patch } : enquiry,
    )
  })
}

export function demoDeleteEnquiry(id: string) {
  mutate((data) => {
    data.enquiries = data.enquiries.filter((enquiry) => enquiry.id !== id)
  })
}
