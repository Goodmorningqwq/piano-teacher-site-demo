import { createContext, use } from 'react'
import type { UiKey } from './ui'

export type Lang = 'zh' | 'en'

/** A row shape carrying `<key>_zh` / `<key>_en` columns. */
export type Bilingual<K extends string> = {
  [P in `${K}_zh` | `${K}_en`]?: string | null
}

export type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** Static UI string. */
  t: (key: UiKey) => string
  /**
   * Database content in the active language.
   *
   * English falls back to Chinese when blank — this is deliberate and
   * load-bearing: it lets the teacher publish writing only 中文 and fill
   * in English later, instead of being blocked on translating everything.
   */
  text: <K extends string>(row: Bilingual<K> | null | undefined, key: K) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLang(): LanguageContextValue {
  const ctx = use(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}

export const LANG_STORAGE_KEY = 'pj-lang'

/** `lang` attribute values; the CJK typography rules in index.css key off zh-Hant. */
export const HTML_LANG: Record<Lang, string> = {
  zh: 'zh-Hant',
  en: 'en',
}

/**
 * Language lives in the URL so each version is a distinct, linkable,
 * indexable page:  `/` is 繁體中文, `/en` is English.
 *
 * Without this both languages share one URL and differ only by browser
 * state, which Google cannot see — so only one of them would ever be
 * indexed, and a shared link would open in whichever language the
 * recipient's browser happened to pick.
 */
export const EN_PREFIX = '/en'

export function langForPath(pathname: string): Lang {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'zh'
}

/** Rewrite a path to its equivalent in the given language. */
export function pathForLang(pathname: string, lang: Lang): string {
  const base = pathname.replace(/^\/en(?=\/|$)/, '') || '/'
  if (lang === 'zh') return base
  return base === '/' ? EN_PREFIX : `${EN_PREFIX}${base}`
}

/**
 * Absolute site origin, for canonical and hreflang tags.
 *
 * These must point at the real domain even when rendered on a preview
 * deployment, so it comes from config rather than window.location.
 */
export function siteOrigin(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined
  if (configured) return configured.replace(/\/$/, '')
  return typeof window === 'undefined' ? '' : window.location.origin
}
