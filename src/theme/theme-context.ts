import { createContext, use } from 'react'

export type Theme = 'dark' | 'light'

export type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  /**
   * Apply the site-wide default chosen in /admin.
   *
   * Deliberately does NOT persist: it is a default, not a choice. A
   * visitor who has already picked a theme keeps theirs, and one who
   * hasn't stays free to follow their OS setting on a later visit.
   */
  applySiteDefault: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = use(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

export const THEME_STORAGE_KEY = 'pj-theme'
