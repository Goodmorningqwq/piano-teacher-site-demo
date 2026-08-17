import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

/** Shared control chrome so inputs, textareas and selects stay identical. */
export const controlClass = cn(
  'w-full bg-bg-elevated text-text placeholder:text-subtle',
  'border border-border rounded-md',
  'px-3.5 py-2.5 min-h-11',
  'transition-colors duration-150 ease-out',
  'hover:border-border-strong',
  'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
  'disabled:opacity-50 disabled:cursor-not-allowed',
)

type FieldProps = {
  label: string
  /** Explanatory text under the label — plain language, not jargon. */
  hint?: string
  error?: string
  required?: boolean
  optionalLabel?: string
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
}

/**
 * Label + hint + error scaffolding around any control.
 *
 * Render-prop shaped so the wiring (id, aria-describedby, aria-invalid)
 * is impossible to forget at the call site.
 */
export function Field({
  label,
  hint,
  error,
  required,
  optionalLabel,
  children,
}: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text flex items-baseline gap-2">
        {label}
        {required && (
          <span aria-hidden="true" className="text-accent">
            *
          </span>
        )}
        {!required && optionalLabel && (
          <span className="text-xs font-normal text-subtle">{optionalLabel}</span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-muted leading-relaxed">
          {hint}
        </p>
      )}

      {children({ id, describedBy, invalid: Boolean(error) })}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({
  className,
  invalid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(controlClass, invalid && 'border-danger focus:border-danger', className)}
      {...rest}
    />
  )
}

export function Textarea({
  className,
  invalid,
  rows = 5,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        controlClass,
        'resize-y leading-relaxed',
        invalid && 'border-danger focus:border-danger',
        className,
      )}
      {...rest}
    />
  )
}
