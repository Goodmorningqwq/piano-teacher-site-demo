import { useId, useState } from 'react'
import { useLang } from '@/i18n/language-context'
import { Input, Textarea } from '@/components/ui/Field'
import { cn } from '@/lib/cn'

type Props = {
  label: string
  hint?: string
  zhValue: string
  enValue: string
  onChange: (next: { zh: string; en: string }) => void
  multiline?: boolean
  rows?: number
  required?: boolean
  placeholder?: string
}

/**
 * One label, two languages, one control.
 *
 * The teacher writes Chinese first and often will not write English at
 * all — so English is never presented as a blocking second field. It is a
 * tab she can ignore, with a copy button and an explicit note that a blank
 * English field falls back to the Chinese text on the live site.
 */
export function BilingualField({
  label,
  hint,
  zhValue,
  enValue,
  onChange,
  multiline = false,
  rows = 4,
  required = false,
  placeholder,
}: Props) {
  const { t } = useLang()
  const [tab, setTab] = useState<'zh' | 'en'>('zh')
  const id = useId()
  const hintId = `${id}-hint`

  const value = tab === 'zh' ? zhValue : enValue
  const setValue = (next: string) =>
    onChange(tab === 'zh' ? { zh: next, en: enValue } : { zh: zhValue, en: next })

  const Control = multiline ? Textarea : Input

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1.5 text-accent">
              *
            </span>
          )}
        </label>

        <div
          role="tablist"
          aria-label={label}
          className="flex items-center gap-0.5 rounded-md border border-border p-0.5"
        >
          {(['zh', 'en'] as const).map((code) => {
            const selected = tab === code
            const filled = code === 'zh' ? zhValue.trim() : enValue.trim()
            return (
              <button
                key={code}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(code)}
                className={cn(
                  'relative rounded-sm px-3 py-1 text-xs font-medium transition-colors',
                  selected
                    ? 'bg-accent text-accent-contrast'
                    : 'text-muted hover:text-text hover:bg-surface-hover',
                )}
              >
                {code === 'zh' ? t('langZh') : t('langEn')}
                {/* A quiet dot marks which languages already have content,
                    so nothing has to be opened to check. */}
                {!selected && filled && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 size-1 rounded-full bg-accent"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}

      <Control
        id={id}
        lang={tab === 'zh' ? 'zh-Hant' : 'en'}
        rows={multiline ? rows : undefined}
        value={value}
        placeholder={placeholder}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
      />

      {tab === 'en' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-subtle">{t('enFallbackNote')}</p>
          {zhValue.trim() && (
            <button
              type="button"
              onClick={() => onChange({ zh: zhValue, en: zhValue })}
              className="rounded-sm px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft"
            >
              {t('copyFromZh')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
