import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-contrast hover:bg-accent-hover shadow-sm hover:shadow-md hover:-translate-y-px',
  secondary:
    'bg-transparent text-text border border-border-strong hover:border-accent hover:text-accent',
  ghost: 'bg-transparent text-muted hover:text-text hover:bg-surface-hover',
  danger: 'bg-danger-soft text-danger border border-danger/30 hover:bg-danger hover:text-white',
}

const sizes: Record<Size, string> = {
  // min-h keeps every control at a comfortable touch target — the teacher
  // will be using the admin panel on an iPad.
  sm: 'text-sm px-3 min-h-9 gap-1.5 rounded-sm',
  md: 'text-sm px-5 min-h-11 gap-2 rounded-md',
  lg: 'text-base px-7 min-h-13 gap-2.5 rounded-md',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-150 ease-out',
        'disabled:opacity-45 disabled:pointer-events-none',
        'active:translate-y-0 active:scale-[0.99]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : iconLeft}
      {children}
      {iconRight}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
