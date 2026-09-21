import { useMutation, useQuery } from '@tanstack/react-query'
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
  courses: ['courses'] as const,
  videos: ['videos'] as const,
}

/**
 * The backend was retired (see src/lib/supabase.ts): every read resolves to
 * the bundled content. The hooks keep their shape so the sections did not
 * have to change.
 */
export function useProfile() {
  return useQuery({ queryKey: contentKeys.profile, queryFn: async (): Promise<Profile> => fallbackProfile })
}

export function useSettings() {
  return useQuery({ queryKey: contentKeys.settings, queryFn: async (): Promise<SiteSettings> => fallbackSettings })
}

export function useCourses() {
  return useQuery({
    queryKey: contentKeys.courses,
    queryFn: async (): Promise<Course[]> => fallbackCourses.filter((c) => c.is_published),
  })
}

export function useVideos() {
  return useQuery({
    queryKey: contentKeys.videos,
    queryFn: async (): Promise<Video[]> => fallbackVideos.filter((v) => v.is_published),
  })
}

export type EnquiryInput = {
  name: string
  email: string
  phone?: string
  message: string
}

/**
 * Static site: the form hands the enquiry to the visitor's mail app,
 * addressed to the teacher, with the fields filled into the body.
 */
export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: async (input: EnquiryInput) => {
      const name = input.name.trim()
      const email = input.email.trim()
      const phone = input.phone?.trim()
      const subject = encodeURIComponent(`鋼琴課程查詢 · ${name}`)
      const body = encodeURIComponent(`${input.message.trim()}

—
${name}
${email}${phone ? `
${phone}` : ''}`)
      window.location.href = `mailto:${fallbackProfile.email}?subject=${subject}&body=${body}`
    },
  })
}
