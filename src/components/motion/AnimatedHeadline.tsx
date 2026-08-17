import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

/**
 * Split text into animatable tokens.
 *
 * CJK is split per character, Latin per word. Animating English
 * letter-by-letter reads as a ransom note, and the English headline is a
 * full sentence — whereas Chinese characters are already discrete units
 * and reveal beautifully one at a time, like notes in a phrase.
 */
function tokenise(text: string): string[] {
  return text.match(/[　-〿㐀-䶿一-鿿豈-﫿＀-￯]|[A-Za-z0-9''’-]+|\s+|./gu) ?? []
}

type Props = {
  text: string
  className?: string
  /** Seconds to wait before the first character sounds. */
  delay?: number
}

/**
 * The hero headline: characters rise and glow in sequence like a played
 * phrase, then a slow brass shimmer drifts across the settled text.
 */
export function AnimatedHeadline({ text, className, delay = 0.2 }: Props) {
  const reduceMotion = useReducedMotion()
  const tokens = useMemo(() => tokenise(text), [text])
  const [revealed, setRevealed] = useState(false)
  const [fontReady, setFontReady] = useState(false)

  // Wait for the webfont before animating.
  //
  // WenKai is ~1MB of sliced WOFF2 and loads with font-display: swap, so
  // without this the reveal would start in the fallback face and every
  // character would visibly jump as the real font swaps in. The timeout
  // guarantees the headline still appears on a slow connection.
  useEffect(() => {
    let cancelled = false
    const done = () => {
      if (!cancelled) setFontReady(true)
    }
    const timer = setTimeout(done, 600)
    document.fonts?.ready.then(done).catch(done)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  // Re-run cleanly if the teacher edits the headline in /admin.
  useEffect(() => {
    setRevealed(false)
  }, [text])

  if (reduceMotion) {
    return (
      <motion.h1
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {text}
      </motion.h1>
    )
  }

  const totalDuration = delay + tokens.length * 0.07 + 0.6

  return (
    <h1
      // The spans below are hidden from assistive tech, so the real string
      // lives here — otherwise a screen reader spells the headline out one
      // character at a time.
      aria-label={text}
      className={cn(className, revealed && 'shimmer-text')}
    >
      <motion.span
        key={text}
        aria-hidden="true"
        className="inline"
        initial="hidden"
        animate={fontReady ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07, delayChildren: delay } },
        }}
        onAnimationComplete={() => setRevealed(true)}
      >
        {tokens.map((token, i) =>
          /^\s+$/.test(token) ? (
            // Whitespace must not animate, or word spacing collapses.
            <span key={i}> </span>
          ) : (
            <motion.span
              key={i}
              className="inline-block will-change-transform"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 14,
                  color: 'var(--accent)',
                  textShadow: '0 0 18px var(--shimmer-glow)',
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  color: 'var(--text)',
                  textShadow: '0 0 0px rgba(0,0,0,0)',
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {token}
            </motion.span>
          ),
        )}
      </motion.span>

      {/* Belt and braces: if onAnimationComplete never fires (interrupted
          by a route change, a language switch mid-reveal), the shimmer
          still takes over rather than the headline sitting inert. */}
      <ShimmerFallback after={totalDuration} onDone={() => setRevealed(true)} active={fontReady} />
    </h1>
  )
}

function ShimmerFallback({
  after,
  onDone,
  active,
}: {
  after: number
  onDone: () => void
  active: boolean
}) {
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(onDone, after * 1000 + 300)
    return () => clearTimeout(timer)
  }, [after, onDone, active])
  return null
}
