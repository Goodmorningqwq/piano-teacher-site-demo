import { useRef, useState, type DragEvent } from 'react'
import { useLang } from '@/i18n/language-context'
import { ACCEPTED_IMAGE_TYPES, isAcceptedImage, isWithinInputLimit, uploadImage } from '@/lib/image'
import { cn } from '@/lib/cn'

type Props = {
  label: string
  hint?: string
  bucket: string
  value: string | null
  onChange: (url: string | null) => void
  /** Shape of the preview box — match it to where the image is used. */
  aspect?: 'portrait' | 'landscape' | 'square'
}

const ASPECT: Record<NonNullable<Props['aspect']>, string> = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-video',
  square: 'aspect-square',
}

export function ImageDropzone({
  label,
  hint,
  bucket,
  value,
  onChange,
  aspect = 'landscape',
}: Props) {
  const { t } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState<'idle' | 'compressing' | 'uploading'>('idle')
  const [error, setError] = useState<string | null>(null)

  const busy = stage !== 'idle'

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)

    if (!isAcceptedImage(file)) {
      setError(t('imageWrongType'))
      return
    }
    if (!isWithinInputLimit(file)) {
      setError(t('imageTooLarge'))
      return
    }

    try {
      const url = await uploadImage(bucket, file, setStage)
      onChange(url)
    } catch (cause) {
      console.error('[upload] image failed:', cause)
      setError(t('saveError'))
    } finally {
      setStage('idle')
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (busy) return
    void handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text">{label}</span>
      {hint && <p className="text-xs text-muted">{hint}</p>}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          ASPECT[aspect],
          dragging ? 'border-accent bg-accent-soft' : 'border-border hover:border-border-strong',
          value && 'border-solid',
        )}
      >
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center"
          >
            <svg
              className="size-8 text-subtle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9.5" r="1.5" />
              <path d="m4 17 5-5 4 4 3-2 4 4" />
            </svg>
            <span className="text-sm text-muted">{t('imageDrop')}</span>
          </button>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-bg/85 backdrop-blur-sm">
            <span className="size-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
            <span className="text-sm text-text">
              {stage === 'compressing' ? t('imageCompressing') : t('imageUploading')}
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      {value && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-sm px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft disabled:opacity-50"
          >
            {t('imageReplace')}
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={busy}
            className="rounded-sm px-2 py-1 text-xs font-medium text-muted hover:bg-surface-hover disabled:opacity-50"
          >
            {t('imageRemove')}
          </button>
        </div>
      )}
    </div>
  )
}
