import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useLang } from '@/i18n/language-context'
import { useProfile, useSettings } from '@/hooks/useContent'
import { Button } from '@/components/ui/Button'
import { KeyboardDivider } from '@/components/motion/KeyboardDivider'

export function Hero() {
  const { t, text } = useLang()
  const { data: profile } = useProfile()
  const { data: settings } = useSettings()
  const reduceMotion = useReducedMotion()

  const { scrollY } = useScroll()
  // Background drifts slower than the page; text lifts and fades away.
  const bgY = useTransform(scrollY, [0, 800], [0, 160])
  const contentY = useTransform(scrollY, [0, 600], [0, -60])
  const contentOpacity = useTransform(scrollY, [0, 420], [1, 0])

  const heroImage = settings?.hero_image_url
  const headline = text(settings, 'hero_headline') || text(profile, 'name')
  const sub = text(settings, 'hero_sub') || text(profile, 'tagline')

  return (
    <section id="top" className="relative isolate flex min-h-dvh flex-col justify-center overflow-hidden">
      {/* ---- background ---- */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y: reduceMotion ? 0 : bgY }}
        aria-hidden="true"
      >
        {heroImage ? (
          <>
            <img
              src={heroImage}
              alt=""
              className="size-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0" style={{ background: 'var(--scrim)' }} />
          </>
        ) : (
          <GradientBackdrop />
        )}
      </motion.div>

      {/* ---- content ---- */}
      <motion.div
        className="content-frame relative pt-28 pb-40"
        style={{
          y: reduceMotion ? 0 : contentY,
          opacity: reduceMotion ? 1 : contentOpacity,
        }}
      >
        <div className="max-w-4xl">
          {profile?.name_zh && (
            <motion.p
              className="eyebrow mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {text(profile, 'name')}
              {text(profile, 'tagline') && ` · ${text(profile, 'tagline')}`}
            </motion.p>
          )}

          <motion.h1
            className="display-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {headline}
          </motion.h1>

          {sub && (
            <motion.p
              className="measure mt-7 text-lg text-muted sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.38 }}
            >
              {sub}
            </motion.p>
          )}

          <motion.div
            className="mt-10 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button
              size="lg"
              onClick={() =>
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {t('heroCta')}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {t('navCourses')}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* ---- keyboard edge + scroll cue ---- */}
      <div className="absolute inset-x-0 bottom-0">
        <motion.p
          className="content-frame mb-4 text-xs tracking-[0.2em] uppercase text-subtle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          {t('heroScroll')}
        </motion.p>
        <KeyboardDivider height={64} />
      </div>
    </section>
  )
}

/**
 * Fallback hero art, used until a photograph is uploaded.
 *
 * Pure CSS so it costs nothing to load and adapts to both themes: warm
 * brass light pooling in from the upper left, as if a lamp were on the
 * music stand, over a dark lacquer field.
 */
function GradientBackdrop() {
  return (
    <div className="absolute inset-0 bg-bg">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 15% 0%, var(--accent-soft), transparent 60%),
            radial-gradient(ellipse 70% 50% at 85% 20%, var(--accent-soft), transparent 55%),
            radial-gradient(ellipse 120% 80% at 50% 110%, var(--surface), transparent 70%)
          `,
        }}
      />
      {/* Faint diagonal string lines */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          background: `repeating-linear-gradient(
            115deg,
            transparent 0px,
            transparent 58px,
            var(--border) 58px,
            var(--border) 59px
          )`,
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent 75%)',
        }}
      />
      {/* Vignette so the headline always has a dark ground to sit on */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, var(--bg) 100%)',
        }}
      />
    </div>
  )
}
