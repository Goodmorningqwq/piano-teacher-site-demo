import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Lift and warm the border on hover — for cards that are clickable. */
  interactive?: boolean
  children: ReactNode
}

export function Card({ interactive = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg',
        'transition-all duration-300 ease-out',
        interactive && [
          'cursor-pointer',
          'hover:border-accent-line hover:-translate-y-1',
          'hover:shadow-lg hover:[box-shadow:var(--elev-lg),var(--glow-accent)]',
        ],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
