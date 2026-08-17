import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dictionaries, type UiKey } from './ui'
import {
  HTML_LANG,
  LANG_STORAGE_KEY,
  LanguageContext,
  type Bilingual,
  type Lang,
} from './language-context'

/**
 * Resolution order: explicit choice → browser language → Chinese.
 *
 * Chinese wins the default because the teacher's students are in Hong Kong;
 * an English-speaking visitor only needs one tap to switch.
 */
function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'zh'

  const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
  if (stored === 'zh' || stored === 'en') return stored

  const prefersEnglish = window.navigator.languages.some(
    (tag) => tag.toLowerCase().startsWith('en') && !tag.toLowerCase().includes('hk'),
  )
  const prefersChinese = window.navigator.languages.some((tag) =>
    tag.toLowerCase().startsWith('zh'),
  )

  if (prefersChinese) return 'zh'
  return prefersEnglish ? 'en' : 'zh'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang]
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    window.localStorage.setItem(LANG_STORAGE_KEY, next)
    setLangState(next)
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((current) => {
      const next = current === 'zh' ? 'en' : 'zh'
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
      return next
    })
  }, [])

  const t = useCallback((key: UiKey) => dictionaries[lang][key], [lang])

  const text = useCallback(
    <K extends string>(row: Bilingual<K> | null | undefined, key: K): string => {
      if (!row) return ''
      const record = row as Record<string, string | null | undefined>
      const zhValue = record[`${key}_zh`]?.trim() ?? ''
      if (lang === 'zh') return zhValue
      const enValue = record[`${key}_en`]?.trim() ?? ''
      return enValue || zhValue
    },
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, text }),
    [lang, setLang, toggleLang, t, text],
  )

  return <LanguageContext value={value}>{children}</LanguageContext>
}
