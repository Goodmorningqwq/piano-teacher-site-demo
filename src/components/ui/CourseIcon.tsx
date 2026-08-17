import { cn } from '@/lib/cn'

/** The icon set offered in the admin panel's course editor. */
export const COURSE_ICONS = ['note', 'star', 'medal', 'book', 'metronome', 'heart'] as const
export type CourseIconName = (typeof COURSE_ICONS)[number]

const paths: Record<CourseIconName, React.ReactNode> = {
  note: (
    <>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </>
  ),
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
  medal: (
    <>
      <circle cx="12" cy="14.5" r="5.5" />
      <path d="M8.5 9 6 2h12l-2.5 7" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v18H5.5A1.5 1.5 0 0 1 4 19.5Z" />
      <path d="M4 17h15" />
    </>
  ),
  metronome: (
    <>
      <path d="M10 3h4l4 18H6L10 3Z" />
      <path d="m15 8-6 8" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />
  ),
}

export function CourseIcon({
  name,
  className,
}: {
  name?: string | null
  className?: string
}) {
  const key: CourseIconName = COURSE_ICONS.includes(name as CourseIconName)
    ? (name as CourseIconName)
    : 'note'

  return (
    <svg
      className={cn('size-6', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[key]}
    </svg>
  )
}
