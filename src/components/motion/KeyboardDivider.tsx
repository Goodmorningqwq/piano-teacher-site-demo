import { cn } from '@/lib/cn'

/** Black keys sit at these white-key boundaries within an octave (C D E F G A B). */
const BLACK_KEY_BOUNDARIES = [1, 2, 4, 5, 6]
const WHITE_PER_OCTAVE = 7
/** A real piano has 52 white keys; enough octaves to overflow any viewport. */
const OCTAVES = 8

/**
 * The signature motif: a strip of piano keys used as a section divider.
 *
 * Keys depress under the pointer. It is decorative only, so the whole
 * strip is hidden from assistive tech — and the key width is fluid, so a
 * phone shows a handful of keys and a desktop shows a couple of octaves.
 */
export function KeyboardDivider({
  className,
  height = 56,
}: {
  className?: string
  height?: number
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative w-full overflow-hidden select-none', className)}
      style={{ height }}
    >
      {/* Fade the strip out at both ends so it reads as a fragment of a
          much longer keyboard rather than a boxed-in widget. */}
      <div
        className="absolute inset-0 flex justify-center"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        }}
      >
        {Array.from({ length: OCTAVES }, (_, octave) => (
          <Octave key={octave} height={height} />
        ))}
      </div>

      {/* Hairline where the keys meet the page */}
      <div className="absolute inset-x-0 top-0 h-px bg-[var(--border)]" />
    </div>
  )
}

function Octave({ height }: { height: number }) {
  const whiteWidth = 'clamp(15px, 2.4vw, 30px)'

  return (
    <div
      className="relative shrink-0"
      style={{
        width: `calc(${whiteWidth} * ${WHITE_PER_OCTAVE})`,
        height,
      }}
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: WHITE_PER_OCTAVE }, (_, i) => (
          <div
            key={i}
            className={cn(
              'group relative flex-1 origin-top',
              'border-r border-b transition-transform duration-100 ease-out',
              'hover:scale-y-[0.94]',
            )}
            style={{
              background: 'var(--key-white)',
              borderColor: 'var(--key-white-edge)',
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        {BLACK_KEY_BOUNDARIES.map((boundary) => {
          const unit = 100 / WHITE_PER_OCTAVE
          return (
            <div
              key={boundary}
              className={cn(
                'absolute top-0 origin-top',
                'transition-transform duration-100 ease-out hover:scale-y-[0.9]',
              )}
              style={{
                left: `calc(${boundary * unit}% - ${unit * 0.29}%)`,
                width: `${unit * 0.58}%`,
                height: height * 0.62,
                background: 'var(--key-black)',
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                boxShadow: '0 2px 4px rgb(0 0 0 / 0.35)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
