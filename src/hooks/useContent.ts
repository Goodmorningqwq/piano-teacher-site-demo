import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo-store'
import {
  createEnquiry,
  fetchCourses,
  fetchEnquiries,
  fetchProfile,
  fetchSettings,
  fetchVideos,
} from '@/lib/backend'
import {
  fallbackCourses,
  fallbackProfile,
  fallbackSettings,
  fallbackVideos,
} from '@/lib/fallback-content'
import type { Course, Profile, SiteSettings, Video } from '@/lib/database.types'

export const contentKeys = {
  profile: ['profile'] as const,
  settings: ['site_settings'] as const,
  courses: (includeHidden: boolean) => ['courses', { includeHidden }] as const,
  videos: (includeHidden: boolean) => ['videos', { includeHidden }] as const,
  enquiries: ['enquiries'] as const,
}

/** A backend exists when either Supabase is configured or demo mode is on. */
const hasBackend = isSupabaseConfigured || isDemoMode

/**
 * Public reads fall back to bundled content on any failure.
 *
 * A visitor should never see an error screen because the database blipped —
 * the placeholder copy is always better than nothing. Admin reads
 * (`includeHidden`) deliberately do NOT get this treatment: the teacher must
 * see a real error rather than edit content that silently failed to load.
 */
async function withFallback<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasBackend) return fallback
  try {
    return await load()
  } catch (error) {
    console.error('[content] falling back to bundled content:', error)
    return fallback
  }
}

export function useProfile() {
  return useQuery({
    queryKey: contentKeys.profile,
    queryFn: () => withFallback<Profile>(fetchProfile, fallbackProfile),
  })
}

export function useSettings() {
  return useQuery({
    queryKey: contentKeys.settings,
    queryFn: () => withFallback<SiteSettings>(fetchSettings, fallbackSettings),
  })
}

export function useCourses({ includeHidden = false } = {}) {
  return useQuery({
    queryKey: contentKeys.courses(includeHidden),
    queryFn: () =>
      includeHidden
        ? fetchCourses(true)
        : withFallback<Course[]>(() => fetchCourses(false), fallbackCourses),
  })
}

export function useVideos({ includeHidden = false } = {}) {
  return useQuery({
    queryKey: contentKeys.videos(includeHidden),
    queryFn: () =>
      includeHidden
        ? fetchVideos(true)
        : withFallback<Video[]>(() => fetchVideos(false), fallbackVideos),
  })
}

export function useEnquiries() {
  return useQuery({
    queryKey: contentKeys.enquiries,
    queryFn: fetchEnquiries,
    enabled: hasBackend,
  })
}

export type EnquiryInput = {
  name: string
  email: string
  phone?: string
  message: string
}

export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: (input: EnquiryInput) =>
      createEnquiry({
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim() || null,
        message: input.message.trim(),
      }),
  })
}

/** Invalidate every content query — used after admin writes. */
export function useInvalidateContent() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['profile'] })
    void queryClient.invalidateQueries({ queryKey: ['site_settings'] })
    void queryClient.invalidateQueries({ queryKey: ['courses'] })
    void queryClient.invalidateQueries({ queryKey: ['videos'] })
  }
}
