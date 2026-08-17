import type { ReactNode } from 'react'
import { NavLink, Link, Outlet } from 'react-router-dom'
import { useLang } from '@/i18n/language-context'
import { LangToggle, ThemeToggle } from '@/components/ui/Toggles'
import { useEnquiries } from '@/hooks/useContent'
import { isDemoMode, resetDemo } from '@/lib/demo-store'
import { useAuth } from './auth'
import { cn } from '@/lib/cn'
import type { UiKey } from '@/i18n/ui'

type NavItem = {
  to: string
  key: UiKey
  icon: ReactNode
}

const NAV: NavItem[] = [
  {
    to: '/admin',
    key: 'adminNavProfile',
    icon: (
      <>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
  },
  {
    to: '/admin/courses',
    key: 'adminNavCourses',
    icon: (
      <>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5Z" />
        <path d="M4 16h15" />
      </>
    ),
  },
  {
    to: '/admin/videos',
    key: 'adminNavVideos',
    icon: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="m10 9.5 5 2.5-5 2.5Z" />
      </>
    ),
  },
  {
    to: '/admin/messages',
    key: 'adminNavEnquiries',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 6.5 8.5 6 8.5-6" />
      </>
    ),
  },
  {
    to: '/admin/settings',
    key: 'adminNavSettings',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1.7a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 3.4 7.5a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V1.7a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.1 1.6Z" />
      </>
    ),
  },
]

export function AdminLayout() {
  const { t } = useLang()
  const { user, signOut } = useAuth()
  const { data: enquiries } = useEnquiries()
  const unread = (enquiries ?? []).filter((e) => !e.is_read).length

  return (
    <div className="min-h-dvh bg-bg lg:flex">
      {/* ---- desktop sidebar ---- */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-elevated lg:flex lg:flex-col">
        <div className="border-b border-border px-6 py-5">
          <p className="eyebrow">{t('adminTitle')}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              badge={item.key === 'adminNavEnquiries' ? unread : 0}
            />
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-border p-4">
          <div className="flex gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
          {user?.email && (
            <p className="truncate text-xs text-subtle" title={user.email}>
              {t('adminSignedInAs')} {user.email}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              className="rounded-sm px-2 py-1.5 text-sm text-muted hover:bg-surface-hover hover:text-accent"
            >
              {t('adminViewSite')}
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-sm px-2 py-1.5 text-left text-sm text-muted hover:bg-surface-hover hover:text-danger"
            >
              {t('adminSignOut')}
            </button>
          </div>
        </div>
      </aside>

      {/* ---- mobile / iPad top bar ---- */}
      <div className="sticky top-0 z-40 border-b border-border bg-bg-elevated/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="eyebrow">{t('adminTitle')}</p>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-md border border-border px-3 py-2 text-sm text-muted hover:text-danger"
            >
              {t('adminSignOut')}
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => (
            <TabLink
              key={item.to}
              item={item}
              badge={item.key === 'adminNavEnquiries' ? unread : 0}
            />
          ))}
        </nav>
      </div>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:py-12">
          {isDemoMode && <DemoBanner />}
          <Outlet />
        </div>
      </main>
    </div>
  )
}

/**
 * Standing reminder that nothing here is real.
 *
 * Without it, it is genuinely easy to spend ten minutes writing content in
 * demo mode and assume it went to a database.
 */
function DemoBanner() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--accent-line)] bg-accent-soft px-4 py-3">
      <p className="text-sm text-text">
        <span className="font-medium">Demo mode</span>
        <span className="text-muted">
          {' '}
          — changes are saved in this browser only, not to a database.
        </span>
      </p>
      <button
        type="button"
        onClick={() => {
          resetDemo()
          window.location.reload()
        }}
        className="shrink-0 rounded-sm px-2 py-1 text-sm font-medium text-accent hover:bg-accent-soft"
      >
        Reset demo data
      </button>
    </div>
  )
}

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="size-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-semibold text-accent-contrast">
      {count}
    </span>
  )
}

function SidebarLink({ item, badge }: { item: NavItem; badge: number }) {
  const { t } = useLang()
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      className={({ isActive }) =>
        cn(
          'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors',
          isActive
            ? 'bg-accent-soft text-accent font-medium'
            : 'text-muted hover:bg-surface-hover hover:text-text',
        )
      }
    >
      <NavIcon>{item.icon}</NavIcon>
      {t(item.key)}
      <Badge count={badge} />
    </NavLink>
  )
}

function TabLink({ item, badge }: { item: NavItem; badge: number }) {
  const { t } = useLang()
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      className={({ isActive }) =>
        cn(
          'flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm whitespace-nowrap transition-colors',
          isActive
            ? 'bg-accent-soft text-accent font-medium'
            : 'text-muted hover:bg-surface-hover',
        )
      }
    >
      <NavIcon>{item.icon}</NavIcon>
      {t(item.key)}
      <Badge count={badge} />
    </NavLink>
  )
}
