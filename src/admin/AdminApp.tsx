import { Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import { AuthProvider, useAuth } from './auth'
import { AdminLayout } from './AdminLayout'
import { Login, NotAllowed } from './Login'
import { ProfilePanel } from './panels/ProfilePanel'
import { CoursesPanel } from './panels/CoursesPanel'
import { VideosPanel } from './panels/VideosPanel'
import { EnquiriesPanel } from './panels/EnquiriesPanel'
import { SettingsPanel } from './panels/SettingsPanel'

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RequireAdmin>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route index element={<ProfilePanel />} />
              <Route path="courses" element={<CoursesPanel />} />
              <Route path="videos" element={<VideosPanel />} />
              <Route path="messages" element={<EnquiriesPanel />} />
              <Route path="settings" element={<SettingsPanel />} />
            </Route>
          </Routes>
        </RequireAdmin>
      </ToastProvider>
    </AuthProvider>
  )
}

/**
 * Gate for the whole panel.
 *
 * This is convenience, not security — row-level security in Postgres is
 * what actually stops a non-admin writing. Bypassing this component would
 * only reveal a UI whose every query the database refuses.
 */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
      </div>
    )
  }

  if (!user) return <Login />
  if (!isAdmin) return <NotAllowed />

  return <>{children}</>
}
