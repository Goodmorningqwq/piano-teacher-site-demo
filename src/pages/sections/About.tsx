import { useLang } from '@/i18n/language-context'
import { useProfile } from '@/hooks/useContent'
import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Credential } from '@/lib/database.types'

export function About() {
  const { t, lang, text } = useLang()
  const { data: profile, isPending } = useProfile()

  const bio = text(profile, 'bio')
  const philosophy = text(profile, 'philosophy')
  const credentials = profile?.credentials ?? []

  return (
    <section id="about" className="section-pad scroll-mt-20">
      <div className="content-frame">
        <SectionHeading eyebrow={t('aboutEyebrow')} title={text(profile, 'name')} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <Reveal>
            <Portrait url={profile?.portrait_url ?? null} alt={text(profile, 'name')} />
          </Reveal>

          <div className="flex flex-col gap-10">
            <Reveal delay={0.1}>
              {isPending ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ) : (
                <div className="flex flex-col gap-5 text-[1.0625rem] leading-relaxed text-muted">
                  {bio
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                </div>
              )}
            </Reveal>

            {philosophy && (
              <Reveal delay={0.15}>
                <figure className="border-l-2 border-accent pl-6">
                  <p className="eyebrow mb-3">{t('aboutPhilosophy')}</p>
                  <blockquote className="font-display text-2xl leading-snug text-text sm:text-[1.75rem]">
                    {philosophy}
                  </blockquote>
                </figure>
              </Reveal>
            )}

            {credentials.length > 0 && (
              <Reveal delay={0.2}>
                <div>
                  <p className="eyebrow mb-5">{t('aboutCredentials')}</p>
                  <CredentialTimeline items={credentials} lang={lang} />
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CredentialTimeline({ items, lang }: { items: Credential[]; lang: 'zh' | 'en' }) {
  return (
    <ol className="relative flex flex-col gap-6 border-l border-border pl-6">
      {items.map((item, i) => (
        <li key={`${item.year}-${i}`} className="relative">
          {/* Node on the timeline rail */}
          <span
            aria-hidden="true"
            className="absolute top-2 -left-[1.6875rem] size-2 rounded-full bg-accent ring-4 ring-[var(--bg)]"
          />
          <p className="font-display text-lg text-accent">{item.year}</p>
          <p className="text-muted">
            {(lang === 'en' && item.title_en?.trim()) || item.title_zh}
          </p>
        </li>
      ))}
    </ol>
  )
}

function Portrait({ url, alt }: { url: string | null; alt: string }) {
  return (
    <div className="relative">
      {/* Offset brass frame — the photo sits proud of it */}
      <div
        aria-hidden="true"
        className="absolute -bottom-4 -left-4 h-full w-full rounded-lg border border-accent-line"
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-surface">
        {url ? (
          <img src={url} alt={alt} loading="lazy" className="size-full object-cover" />
        ) : (
          <PortraitPlaceholder />
        )}
      </div>
    </div>
  )
}

/** Designed stand-in so a missing photo still looks deliberate. */
function PortraitPlaceholder() {
  return (
    <div
      className="flex size-full items-center justify-center"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 25%, var(--accent-soft), transparent 65%),
          linear-gradient(160deg, var(--surface), var(--bg))
        `,
      }}
    >
      <svg
        className="size-24 text-[var(--border-strong)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="9" r="3.5" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </svg>
    </div>
  )
}
