import { useState, type FormEvent } from 'react'
import { useLang } from '@/i18n/language-context'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { LangToggle, ThemeToggle } from '@/components/ui/Toggles'
import { DEMO_PASSWORD, DEMO_USERNAME, useAuth } from './auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo-store'

export function Login() {
  const { t } = useLang()

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <div className="content-frame flex justify-end gap-2 py-4">
        <LangToggle />
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-24">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-3">{t('adminTitle')}</p>
          <h1 className="display-md mb-3">{t('loginTitle')}</h1>

          {isDemoMode ? <DemoForm /> : <MagicLinkForm />}
        </div>
      </div>
    </div>
  )
}

/**
 * Local test sign-in.
 *
 * Rendered only in demo mode, which requires `import.meta.env.DEV` — this
 * whole branch is stripped from a production build, so the fixed password
 * cannot reach the deployed site. Real deployments always use the magic
 * link below.
 */
function DemoForm() {
  const { t } = useLang()
  const { signInWithDemo } = useAuth()
  const [username, setUsername] = useState(DEMO_USERNAME)
  const [password, setPassword] = useState('')
  const [failed, setFailed] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFailed(!signInWithDemo(username, password))
  }

  return (
    <>
      <div className="mb-6 rounded-lg border border-[var(--accent-line)] bg-accent-soft p-4">
        <p className="text-sm font-medium text-text">Demo mode — no backend connected</p>
        <p className="mt-1 text-sm text-muted">
          Sign in with <code className="text-accent">{DEMO_USERNAME}</code> /{' '}
          <code className="text-accent">{DEMO_PASSWORD}</code> to try the panel. Edits are
          saved in this browser only, and this login does not exist in a production build.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Field label="Username" required>
          {({ id }) => (
            <Input
              id={id}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
        </Field>

        <Field label="Password" required>
          {({ id }) => (
            <Input
              id={id}
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>

        {failed && (
          <p role="alert" className="text-sm text-danger">
            Wrong username or password.
          </p>
        )}

        <Button type="submit" size="lg">
          {t('loginSubmit')}
        </Button>
      </form>
    </>
  )
}

/**
 * Production sign-in: one email field, no password.
 *
 * The teacher receives a link by email and taps it — there is nothing for
 * her to remember and nothing to reset.
 */
function MagicLinkForm() {
  const { t } = useLang()
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    try {
      await signInWithEmail(email)
      setStatus('sent')
    } catch (cause) {
      console.error('[auth] magic link failed:', cause)
      setStatus('error')
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-5">
        <p className="text-sm text-text">
          Supabase is not configured. Copy <code>.env.example</code> to <code>.env.local</code>,
          fill in your project URL and anon key, then restart the dev server.
        </p>
      </div>
    )
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-6"
      >
        <p className="text-text">{t('loginSent')}</p>
      </div>
    )
  }

  return (
    <>
      <p className="mb-8 text-muted">{t('loginIntro')}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Field label={t('loginEmail')} required>
          {({ id, describedBy }) => (
            <Input
              id={id}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={describedBy}
            />
          )}
        </Field>

        {status === 'error' && (
          <p role="alert" className="text-sm text-danger">
            {t('loginError')}
          </p>
        )}

        <Button type="submit" size="lg" loading={status === 'sending'}>
          {status === 'sending' ? t('loginSending') : t('loginSubmit')}
        </Button>
      </form>
    </>
  )
}

/** Shown when a real account signs in but is not on the admin allowlist. */
export function NotAllowed() {
  const { t } = useLang()
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-5">
      <div className="w-full max-w-md text-center">
        <h1 className="display-md mb-3">{t('loginNotAllowed')}</h1>
        <p className="mb-8 text-muted">{user?.email}</p>
        <Button variant="secondary" onClick={() => void signOut()}>
          {t('adminSignOut')}
        </Button>
      </div>
    </div>
  )
}
