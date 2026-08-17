import { useMemo, useState } from 'react'
import { useLang } from '@/i18n/language-context'
import { useVideos } from '@/hooks/useContent'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Skeleton } from '@/components/ui/Skeleton'
import { VideoLightbox } from '@/components/ui/VideoLightbox'
import { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { formatDuration, isPlayable, posterUrl } from '@/lib/video'
import { cn } from '@/lib/cn'
import type { Video } from '@/lib/database.types'

export function Videos() {
  const { t } = useLang()
  const { data: videos, isPending } = useVideos()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // The lightbox only ever cycles through videos that can actually play,
  // so placeholder slots never appear as a blank frame.
  const playable = useMemo(() => (videos ?? []).filter(isPlayable), [videos])

  return (
    <section id="videos" className="section-pad scroll-mt-20">
      <div className="content-frame">
        <SectionHeading eyebrow={t('videosEyebrow')} title={t('navVideos')} />

        {isPending ? (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <RevealItem key={video.id}>
                <VideoCard
                  video={video}
                  onOpen={() => {
                    const target = playable.findIndex((v) => v.id === video.id)
                    if (target >= 0) setOpenIndex(target)
                  }}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="mt-14 rounded-lg border border-dashed border-border-strong p-16 text-center">
            <p className="font-display text-2xl text-muted">{t('videosEmpty')}</p>
            <p className="mt-2 text-sm text-subtle">{t('videosEmptyHint')}</p>
          </div>
        )}
      </div>

      <VideoLightbox
        videos={playable}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </section>
  )
}

function VideoCard({ video, onOpen }: { video: Video; onOpen: () => void }) {
  const { t, text } = useLang()
  const poster = posterUrl(video)
  const playable = isPlayable(video)
  const duration = formatDuration(video.duration_sec)

  const Wrapper = playable ? 'button' : 'div'

  return (
    <Wrapper
      {...(playable
        ? { type: 'button' as const, onClick: onOpen, 'aria-label': `${t('videoPlay')}: ${text(video, 'title')}` }
        : {})}
      className={cn(
        'group block w-full overflow-hidden rounded-lg border border-border bg-surface text-left',
        'transition-all duration-300 ease-out',
        playable &&
          'cursor-pointer hover:-translate-y-1 hover:border-accent-line hover:[box-shadow:var(--elev-lg),var(--glow-accent)]',
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-bg">
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <PlaceholderFrame />
        )}

        {playable && (
          <>
            <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/10" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  'inline-flex size-16 items-center justify-center rounded-full',
                  'border border-white/40 bg-black/40 backdrop-blur-sm text-white',
                  'transition-transform duration-300 ease-out group-hover:scale-110',
                )}
              >
                <svg className="ml-1 size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              </span>
            </span>
          </>
        )}

        {duration && (
          <span className="absolute right-2 bottom-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-xs text-white tabular-nums">
            {duration}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl leading-tight">{text(video, 'title')}</h3>
        {text(video, 'description') && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{text(video, 'description')}</p>
        )}
      </div>
    </Wrapper>
  )
}

/**
 * Stand-in frame for a reserved video slot.
 *
 * Deliberately designed rather than blank: the section reads as finished
 * before any video exists, which is the whole point of seeding placeholders.
 */
function PlaceholderFrame() {
  const { t } = useLang()
  return (
    <div
      className="flex size-full flex-col items-center justify-center gap-3"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 50% 35%, var(--accent-soft), transparent 70%),
          linear-gradient(160deg, var(--surface), var(--bg))
        `,
      }}
    >
      <svg
        className="size-10 text-[var(--border-strong)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="m10 9.5 5 2.5-5 2.5Z" />
      </svg>
      <p className="text-xs tracking-wide text-subtle">{t('videosEmpty')}</p>
    </div>
  )
}
