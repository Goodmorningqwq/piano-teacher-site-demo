import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { THEME_STORAGE_KEY, ThemeContext, type Theme } from './theme-context'

/** Must match --dur-theme in tokens.css. */
const THEME_TRANSITION_MS = 520

/**
 * Resolution order: explicit user choice (localStorage) → OS preference → dark.
 * Dark is the design default, so it wins any ambiguity.
 */
function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  /**
   * Run a theme change as a page-wide cross-fade.
   *
   * The class goes on synchronously, before React re-renders and the effect
   * above flips `data-theme`, so the new colours are already transitioning
   * by the time they apply. It is removed afterwards so the transition
   * never affects ordinary hover states.
   *
   * Used only for deliberate switches — the site default resolving on load
   * applies instantly, since a fade there would look like a glitch.
   */
  const crossFade = useCallback((apply: () => void) => {
    const root = document.documentElement

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply()
      return
    }

    root.classList.add('theme-transition')

    // Force a style flush before the colours change.
    //
    // A transition only starts if the *before-change* style already had
    // transition-property set. Without this read, the class and the new
    // colours land in the same style recalculation, the browser sees no
    // transition in the previous style, and everything snaps instead.
    void root.offsetWidth

    apply()

    clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => {
      root.classList.remove('theme-transition')
    }, THEME_TRANSITION_MS + 60)
  }, [])

  useEffect(() => () => clearTimeout(transitionTimer.current), [])

  // Follow the OS only while the visitor has not expressed a preference.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem(THEME_STORAGE_KEY)) return
      setThemeState(event.matches ? 'light' : 'dark')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback(
    (next: Theme) => {
      crossFade(() => {
        window.localStorage.setItem(THEME_STORAGE_KEY, next)
        setThemeState(next)
      })
    },
    [crossFade],
  )

  const toggleTheme = useCallback(() => {
    crossFade(() => {
      setThemeState((current) => {
        const next = current === 'dark' ? 'light' : 'dark'
        window.localStorage.setItem(THEME_STORAGE_KEY, next)
        return next
      })
    })
  }, [crossFade])

  const applySiteDefault = useCallback((next: Theme) => {
    // A stored preference always outranks the site default.
    if (window.localStorage.getItem(THEME_STORAGE_KEY)) return
    setThemeState(next)
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, applySiteDefault }),
    [theme, setTheme, toggleTheme, applySiteDefault],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
