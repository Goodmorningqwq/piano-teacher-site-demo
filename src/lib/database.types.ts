/**
 * Database types, in the shape the Supabase CLI generates.
 *
 * Hand-written to match supabase/migrations/0001_init.sql. Once the
 * project exists you can regenerate this file verbatim with:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

/** One entry in `profile.credentials`. */
export type Credential = {
  year: string
  title_zh: string
  title_en?: string
}

export type VideoSource = 'youtube' | 'vimeo' | 'upload' | 'placeholder'

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          id: number
          name_zh: string
          name_en: string | null
          tagline_zh: string | null
          tagline_en: string | null
          bio_zh: string | null
          bio_en: string | null
          philosophy_zh: string | null
          philosophy_en: string | null
          portrait_url: string | null
          credentials: Credential[]
          email: string | null
          phone: string | null
          whatsapp: string | null
          instagram: string | null
          youtube: string | null
          address_zh: string | null
          address_en: string | null
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profile']['Row']>
        Update: Partial<Database['public']['Tables']['profile']['Row']>
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          sort_order: number
          is_published: boolean
          title_zh: string
          title_en: string | null
          summary_zh: string | null
          summary_en: string | null
          level_zh: string | null
          level_en: string | null
          duration_min: number | null
          price: number | null
          price_note_zh: string | null
          price_note_en: string | null
          icon: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Omit<Database['public']['Tables']['courses']['Row'], 'id'>> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['courses']['Row']>
        Relationships: []
      }
      videos: {
        Row: {
          id: string
          sort_order: number
          is_published: boolean
          title_zh: string
          title_en: string | null
          description_zh: string | null
          description_en: string | null
          source_type: VideoSource
          external_id: string | null
          storage_path: string | null
          poster_url: string | null
          duration_sec: number | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Omit<Database['public']['Tables']['videos']['Row'], 'id'>> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['videos']['Row']>
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          hero_headline_zh: string | null
          hero_headline_en: string | null
          hero_sub_zh: string | null
          hero_sub_en: string | null
          hero_image_url: string | null
          default_theme: 'dark' | 'light'
          seo_title_zh: string | null
          seo_title_en: string | null
          seo_description_zh: string | null
          seo_description_en: string | null
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['site_settings']['Row']>
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>
        Relationships: []
      }
      enquiries: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          phone: string | null
          message: string
          is_read: boolean
        }
        Insert: {
          name: string
          email: string
          phone?: string | null
          message: string
        }
        Update: Partial<Database['public']['Tables']['enquiries']['Row']>
        Relationships: []
      }
      admins: {
        Row: { email: string; created_at: string }
        Insert: { email: string }
        Update: Partial<{ email: string }>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: Record<never, never>
  }
}

// Convenience aliases used throughout the app.
export type Profile = Database['public']['Tables']['profile']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Video = Database['public']['Tables']['videos']['Row']
export type SiteSettings = Database['public']['Tables']['site_settings']['Row']
export type Enquiry = Database['public']['Tables']['enquiries']['Row']
