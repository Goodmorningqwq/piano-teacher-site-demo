import { Link } from 'react-router-dom'
import { useLang } from '@/i18n/language-context'
import { useProfile } from '@/hooks/useContent'
import { KeyboardDivider } from '@/components/motion/KeyboardDivider'

export function SiteFooter() {
  const { t, text } = useLang()
  const { data: profile } = useProfile()
  const name = text(profile, 'name')

  return (
    <footer className="relative">
      <KeyboardDivider height={40} />

      <div className="content-frame flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-subtle">
          © {new Date().getFullYear()} {name} · {t('footerRights')}
        </p>

        <Link
          to="/admin"
          className="text-sm text-subtle transition-colors hover:text-accent"
        >
          {t('footerAdmin')}
        </Link>
      </div>
    </footer>
  )
}
