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
