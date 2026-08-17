import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo-store'

/** Local test credentials. Dev-only — see the note on DEMO_* below. */
export const DEMO_USERNAME = 'admin'
export const DEMO_PASSWORD = '8888'
const DEMO_SESSION_KEY = 'pj-demo-session'

type AdminUser = { email: string }

type AuthState = {
  user: AdminUser | null
  /** Signed in AND on the admin allowlist. Only this grants edit access. */
  isAdmin: boolean
  /** True until the initial session check settles — avoids a login flash. */
  loading: boolean
  signInWithEmail: (email: string) => Promise<void>
  /** Demo mode only; throws if called against a real backend. */
  signInWithDemo: (username: string, password: string) => boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Ask the database, never the client, whether this account may edit.
  // is_admin() is the same function the RLS policies use, so the UI can
  // never disagree with what the server will actually permit.
  const refreshAdmin = useCallback(async (signedIn: boolean) => {
    if (!signedIn || !supabase) {
      setIsAdmin(false)
      return
    }
    const { data, error } = await supabase.rpc('is_admin')
    if (error) {
      console.error('[auth] is_admin check failed:', error)
      setIsAdmin(false)
      return
    }
    setIsAdmin(Boolean(data))
  }, [])

  useEffect(() => {
    if (isDemoMode) {
      // Restore a demo session across reloads so editing is not interrupted.
      const active = sessionStorage.getItem(DEMO_SESSION_KEY) === 'true'
      if (active) {
        setUser({ email: `${DEMO_USERNAME} (demo)` })
        setIsAdmin(true)
      }
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setUser(data.session ? { email: data.session.user.email ?? '' } : null)
      await refreshAdmin(Boolean(data.session))
      if (active) setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setUser(next ? { email: next.user.email ?? '' } : null)
      void refreshAdmin(Boolean(next))
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [refreshAdmin])

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        // The teacher's account is created for her; a typo in the email
        // should fail rather than silently make a second empty account.
        shouldCreateUser: false,
      },
    })
    if (error) throw error
  }, [])

  const signInWithDemo = useCallback((username: string, password: string) => {
    // Guard, not just a convention: if this ever ran outside demo mode it
    // would be an auth bypass, so it refuses rather than trusting callers.
    if (!isDemoMode) return false
    if (username.trim() !== DEMO_USERNAME || password !== DEMO_PASSWORD) return false

    sessionStorage.setItem(DEMO_SESSION_KEY, 'true')
    setUser({ email: `${DEMO_USERNAME} (demo)` })
    setIsAdmin(true)
    return true
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      sessionStorage.removeItem(DEMO_SESSION_KEY)
      setUser(null)
      setIsAdmin(false)
      return
    }
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }, [])

  const value = useMemo(
    () => ({ user, isAdmin, loading, signInWithEmail, signInWithDemo, signOut }),
    [user, isAdmin, loading, signInWithEmail, signInWithDemo, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
