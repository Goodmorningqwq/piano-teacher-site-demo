import { cn } from '@/lib/cn'

/** Neutral loading placeholder. Sized by the caller to match real content. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-sm bg-[var(--surface-hover)]',
        className,
      )}
    />
  )
}
