import { useLang } from '@/i18n/language-context'
import { useTheme } from '@/theme/theme-context'
import { cn } from '@/lib/cn'

const controlBase = cn(
  'inline-flex items-center justify-center',
  'border border-border rounded-md',
  'text-muted hover:text-accent hover:border-accent-line',
  'transition-colors duration-200 ease-out',
)

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLang()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={t('toggleTheme')}
      aria-label={t('toggleTheme')}
      className={cn(controlBase, 'size-10', className)}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

/**
 * Shows the language you would switch *to*, not the current one — this is
 * the convention bilingual HK sites use, and it means the control always
 * reads as an action.
 */
export function LangToggle({ className }: { className?: string }) {
  const { lang, toggleLang, t } = useLang()

  return (
    <button
      type="button"
      onClick={toggleLang}
      title={t('toggleLanguage')}
      aria-label={t('toggleLanguage')}
      className={cn(controlBase, 'h-10 px-3 text-sm font-medium tracking-wide', className)}
    >
      {lang === 'zh' ? 'EN' : '中'}
    </button>
  )
}

function SunIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  )
}
