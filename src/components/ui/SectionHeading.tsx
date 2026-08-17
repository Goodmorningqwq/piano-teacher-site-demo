import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Reveal } from '@/components/motion/Reveal'

/** Brass eyebrow over a serif display heading — the rhythm every section opens with. */
export function SectionHeading({
  eyebrow,
  title,
  children,
  align = 'left',
  className,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-lg">{title}</h2>
      {children && (
        <div className={cn('measure text-muted', align === 'center' && 'mx-auto')}>
          {children}
        </div>
      )}
    </Reveal>
  )
}
