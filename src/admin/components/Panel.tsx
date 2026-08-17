import { useEffect, type ReactNode } from 'react'
import { useLang } from '@/i18n/language-context'
import { Button } from '@/components/ui/Button'

export function PanelHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="mb-8">
      <h1 className="display-md">{title}</h1>
      {intro && <p className="measure mt-2 text-muted">{intro}</p>}
    </header>
  )
}

export function PanelSection({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-border bg-bg-elevated p-5 sm:p-7">
      {title && (
        <h2 className="text-sm font-semibold tracking-[0.14em] uppercase text-subtle">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

/**
 * Sticky save bar.
 *
 * Pinned to the bottom so the button is reachable without scrolling back
 * up a long form, and disabled until something actually changed — which
 * doubles as the answer to "did my edit register?".
 */
export function SaveBar({
  dirty,
  saving,
  onSave,
  error,
}: {
  dirty: boolean
  saving: boolean
  onSave: () => void
  error?: string | null
}) {
  const { t } = useLang()

  // Warn before a reload or tab close drops unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  return (
    <div className="sticky bottom-0 z-30 -mx-5 mt-8 border-t border-border bg-bg-elevated/95 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {error ? (
            <span className="text-danger">{error}</span>
          ) : dirty ? (
            t('unsavedChanges')
          ) : (
            t('saved')
          )}
        </p>
        <Button size="lg" onClick={onSave} disabled={!dirty} loading={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
      </div>
    </div>
  )
}
