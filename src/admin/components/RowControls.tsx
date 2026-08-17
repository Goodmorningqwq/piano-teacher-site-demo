import { useState } from 'react'
import { useLang } from '@/i18n/language-context'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

/**
 * Show / hide switch.
 *
 * Offered instead of deletion for anything the teacher might want back:
 * a course not running this term should come off the site without being
 * destroyed.
 */
export function VisibilityToggle({
  isPublished,
  onChange,
}: {
  isPublished: boolean
  onChange: (next: boolean) => void
}) {
  const { t } = useLang()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPublished}
      onClick={() => onChange(!isPublished)}
      title={isPublished ? t('showOnSite') : t('hiddenFromSite')}
      className={cn(
        'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border px-2.5 text-xs transition-colors',
        isPublished
          ? 'border-accent-line bg-accent-soft text-accent'
          : 'border-border text-subtle hover:text-muted',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative h-4 w-7 rounded-full transition-colors',
          isPublished ? 'bg-accent' : 'bg-[var(--border-strong)]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-3 rounded-full bg-[var(--bg-elevated)] transition-all',
            isPublished ? 'left-3.5' : 'left-0.5',
          )}
        />
      </span>
      {isPublished ? t('visible') : t('hidden')}
    </button>
  )
}

/**
 * Delete with a plain-language confirm.
 *
 * No "type the name to confirm" ceremony — the undo toast that follows is
 * the real safety net, and it is far kinder to a non-technical user.
 */
export function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useLang()
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        aria-label={t('delete')}
        onClick={() => setConfirming(true)}
      >
        {t('delete')}
      </Button>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-muted">{t('confirmDeleteTitle')}</span>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          setConfirming(false)
          onConfirm()
        }}
      >
        {t('delete')}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        {t('cancel')}
      </Button>
    </span>
  )
}
