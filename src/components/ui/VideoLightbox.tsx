import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLang } from '@/i18n/language-context'
import { embedUrl, posterUrl, uploadedVideoUrl } from '@/lib/video'
import { cn } from '@/lib/cn'
import type { Video } from '@/lib/database.types'

type Props = {
  videos: Video[]
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

export function VideoLightbox({ videos, index, onClose, onNavigate }: Props) {
  const { t, text } = useLang()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const open = index !== null
  const video = open ? videos[index] : null

  const goPrev = useCallback(() => {
    if (index === null) return
    onNavigate((index - 1 + videos.length) % videos.length)
  }, [index, videos.length, onNavigate])

  const goNext = useCallback(() => {
    if (index === null) return
    onNavigate((index + 1) % videos.length)
  }, [index, videos.length, onNavigate])

  // Keyboard: escape closes, arrows move between videos.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, goPrev, goNext])

  // Lock the page and move focus into the dialog.
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open])

  // Keep Tab inside the dialog while it is open.
  const onKeyDownTrap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], iframe, video, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const embed = video ? embedUrl(video) : null
  const fileUrl = video ? uploadedVideoUrl(video) : null

  return (
    <AnimatePresence>
      {open && video && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onKeyDown={onKeyDownTrap}
        >
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={text(video, 'title')}
            className="relative z-10 w-full max-w-5xl"
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-xl text-white sm:text-2xl">
                  {text(video, 'title')}
                </h2>
                {text(video, 'description') && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/70">
                    {text(video, 'description')}
                  </p>
                )}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t('videoClose')}
                className="shrink-0 inline-flex size-10 items-center justify-center rounded-md border border-white/25 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="overflow-hidden rounded-lg bg-black shadow-lg">
              <div className="aspect-video w-full">
                {embed ? (
                  <iframe
                    key={video.id}
                    src={embed}
                    title={text(video, 'title')}
                    className="size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : fileUrl ? (
                  <video
                    key={video.id}
                    src={fileUrl}
                    poster={posterUrl(video) ?? undefined}
                    controls
                    autoPlay
                    playsInline
                    className="size-full"
                  />
                ) : null}
              </div>
            </div>

            {videos.length > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <LightboxNav direction="prev" label={t('videoPrev')} onClick={goPrev} />
                <p className="text-sm text-white/50 tabular-nums">
                  {index + 1} / {videos.length}
                </p>
                <LightboxNav direction="next" label={t('videoNext')} onClick={goNext} />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LightboxNav({
  direction,
  label,
  onClick,
}: {
  direction: 'prev' | 'next'
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm',
        'text-white/70 hover:bg-white/10 hover:text-white transition-colors',
      )}
    >
      {direction === 'prev' && <Chevron className="rotate-180" />}
      {label}
      {direction === 'next' && <Chevron />}
    </button>
  )
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
}
