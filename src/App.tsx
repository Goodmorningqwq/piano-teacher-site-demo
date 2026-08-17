import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import StyleGuide from '@/pages/StyleGuide'

// The admin panel and its editor dependencies are code-split, so a visitor
// to the public site never downloads any of it.
const AdminApp = lazy(() => import('@/admin/AdminApp'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/styleguide" element={<StyleGuide />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminLoading />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}

function AdminLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <div className="size-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
    </div>
  )
}
