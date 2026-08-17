import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { dictionaries, type UiKey } from './ui'
import {
  HTML_LANG,
  LANG_STORAGE_KEY,
  LanguageContext,
  langForPath,
  pathForLang,
  type Bilingual,
  type Lang,
} from './language-context'

/**
 * Language preference for the admin panel only.
 *
 * The public site takes its language from the URL, but /admin has no
 * language routing — it is not indexed and the teacher's choice there is
 * a personal setting, so it persists per browser instead.
 */
function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'zh'
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
  if (stored === 'zh' || stored === 'en') return stored
  return window.navigator.languages.some((tag) => tag.toLowerCase().startsWith('zh'))
    ? 'zh'
    : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [storedLang, setStoredLang] = useState<Lang>(readStoredLang)

  const isAdminRoute = location.pathname.startsWith('/admin')

  /**
   * On the public site the URL is the single source of truth.
   *
   * Note there is deliberately no automatic redirect based on browser
   * language: `/` is always Chinese and `/en` always English. Auto-
   * redirecting would mean a crawler asking for one language could be
   * bounced to the other, which is exactly how bilingual sites end up
   * with only one version indexed.
   */
  const lang: Lang = isAdminRoute ? storedLang : langForPath(location.pathname)

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang]
  }, [lang])

  const setLang = useCallback(
    (next: Lang) => {
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
      setStoredLang(next)

      if (isAdminRoute) return
      // Keep the visitor exactly where they are on the page.
      navigate(
        {
          pathname: pathForLang(location.pathname, next),
          search: location.search,
          hash: location.hash,
        },
        { replace: false },
      )
    },
    [isAdminRoute, navigate, location.pathname, location.search, location.hash],
  )

  const toggleLang = useCallback(() => {
    setLang(lang === 'zh' ? 'en' : 'zh')
  }, [lang, setLang])

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
