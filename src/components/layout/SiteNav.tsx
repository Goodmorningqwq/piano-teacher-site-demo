import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLang } from '@/i18n/language-context'
import { LangToggle, ThemeToggle } from '@/components/ui/Toggles'
import { useProfile } from '@/hooks/useContent'
import { cn } from '@/lib/cn'
import type { UiKey } from '@/i18n/ui'

const SECTIONS: { id: string; key: UiKey }[] = [
  { id: 'about', key: 'navAbout' },
  { id: 'courses', key: 'navCourses' },
  { id: 'videos', key: 'navVideos' },
  { id: 'contact', key: 'navContact' },
]

export function SiteNav() {
  const { t, text } = useLang()
  const { data: profile } = useProfile()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Solid background once the nav leaves the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight whichever section is currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    for (const { id } of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  // Prevent the page scrolling behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Escape closes the menu — expected of anything modal.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const name = text(profile, 'name') || 'Piano'

  return (
    <>
      <a
        href="#main"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:fixed focus:top-3 focus:left-3 focus:z-[200]',
          'focus:bg-accent focus:text-accent-contrast focus:px-4 focus:py-2 focus:rounded-md',
        )}
      >
        {t('skipToContent')}
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50',
          'transition-all duration-500 ease-out',
          scrolled
            ? 'bg-bg-elevated/85 backdrop-blur-lg border-b border-border'
            : 'bg-transparent border-b border-transparent',
        )}
      >
        <nav className="content-frame flex items-center justify-between gap-4 py-3.5">
          <a
            href="#top"
            className="font-display text-xl sm:text-2xl tracking-tight hover:text-accent transition-colors"
          >
            {name}
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {SECTIONS.map(({ id, key }) => (
              <a
                key={id}
                href={`#${id}`}
                className={cn(
                  'relative px-3.5 py-2 text-sm transition-colors rounded-sm',
                  activeSection === id ? 'text-accent' : 'text-muted hover:text-text',
                )}
              >
                {t(key)}
                {activeSection === id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('navMenu')}
              aria-expanded={menuOpen}
              className={cn(
                'md:hidden inline-flex size-10 items-center justify-center',
                'rounded-md border border-border text-muted',
                'hover:text-accent hover:border-accent-line transition-colors',
              )}
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-90 bg-bg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="content-frame flex items-center justify-end py-3.5">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t('navClose')}
                className="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted hover:text-accent"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="content-frame flex flex-col gap-2 pt-8">
              {SECTIONS.map(({ id, key }, index) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-4xl py-3 border-b border-border hover:text-accent transition-colors"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * index + 0.05, duration: 0.4 }}
                >
                  {t(key)}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
