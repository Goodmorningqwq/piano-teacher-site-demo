import { useRef, useState } from 'react'
import { useLang } from '@/i18n/language-context'
import { Input } from '@/components/ui/Field'
import { parseVideoLink } from '@/lib/video'
import {
  ACCEPTED_VIDEO_TYPES,
  LARGE_VIDEO_BYTES,
  MAX_VIDEO_BYTES,
  formatBytes,
  uploadVideo,
} from '@/lib/image'
import { cn } from '@/lib/cn'
import type { Video, VideoSource } from '@/lib/database.types'

export type VideoSourceValue = Pick<Video, 'source_type' | 'external_id' | 'storage_path'>

type Props = {
  value: VideoSourceValue
  onChange: (next: VideoSourceValue) => void
}

/**
 * Choose where a video comes from: a pasted link, or an uploaded file.
 *
 * The link tab is presented first and marked recommended, because it is
 * genuinely better for both sides — no storage used, no transcoding, and
 * it plays smoothly on a phone. Upload stays available, with honest
 * warnings rather than a silent bad experience.
 */
export function VideoSourcePicker({ value, onChange }: Props) {
  const { t } = useLang()
  const [tab, setTab] = useState<'link' | 'upload'>(
    value.source_type === 'upload' ? 'upload' : 'link',
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <TabButton
          active={tab === 'link'}
          onClick={() => setTab('link')}
          label={t('videoSourceLink')}
          badge={t('videoLinkRecommended')}
        />
        <TabButton
          active={tab === 'upload'}
          onClick={() => setTab('upload')}
          label={t('videoSourceUpload')}
        />
      </div>

      {tab === 'link' ? (
        <LinkTab value={value} onChange={onChange} />
      ) : (
        <UploadTab value={value} onChange={onChange} />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm transition-colors',
        active
          ? 'border-accent bg-accent-soft text-accent font-medium'
          : 'border-border text-muted hover:border-border-strong hover:text-text',
      )}
    >
      {label}
      {badge && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[0.6875rem] font-semibold text-accent-contrast">
          {badge}
        </span>
      )}
    </button>
  )
}

function LinkTab({ value, onChange }: Props) {
  const { t } = useLang()
  // Reconstruct a display URL from the saved id so reopening the editor
  // shows what she pasted rather than an empty box.
  const [raw, setRaw] = useState(() => {
    if (value.source_type === 'youtube' && value.external_id) {
      return `https://www.youtube.com/watch?v=${value.external_id}`
    }
    if (value.source_type === 'vimeo' && value.external_id) {
      return `https://vimeo.com/${value.external_id}`
    }
    return ''
  })
  const [touched, setTouched] = useState(false)

  const parsed = parseVideoLink(raw)
  const showError = touched && raw.trim().length > 0 && !parsed

  function commit(next: string) {
    setRaw(next)
    const result = parseVideoLink(next)
    if (result) {
      onChange({
        source_type: result.source as VideoSource,
        external_id: result.id,
        storage_path: null,
      })
    } else if (!next.trim()) {
      onChange({ source_type: 'placeholder', external_id: null, storage_path: null })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor="video-link">
        {t('videoLinkLabel')}
      </label>
      <Input
        id="video-link"
        type="url"
        inputMode="url"
        placeholder={t('videoLinkPlaceholder')}
        value={raw}
        invalid={showError}
        onBlur={() => setTouched(true)}
        onChange={(e) => commit(e.target.value)}
      />

      {showError && (
        <p role="alert" className="text-xs text-danger">
          {t('videoLinkInvalid')}
        </p>
      )}

      {parsed && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-bg p-2">
          {parsed.source === 'youtube' && (
            <img
              src={`https://i.ytimg.com/vi/${parsed.id}/mqdefault.jpg`}
              alt=""
              className="h-14 w-24 shrink-0 rounded-sm object-cover"
            />
          )}
          <div className="min-w-0 text-xs">
            <p className="font-medium text-accent capitalize">{parsed.source}</p>
            <p className="truncate text-subtle">{parsed.id}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function UploadTab({ value, onChange }: Props) {
  const { t } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setWarning(null)

    if (file.size > MAX_VIDEO_BYTES) {
      setError(`${t('videoUploadTooLarge')} (${formatBytes(file.size)})`)
      return
    }
    if (file.size > LARGE_VIDEO_BYTES) {
      setWarning(`${t('videoUploadLarge')} (${formatBytes(file.size)})`)
    }

    setUploading(true)
    setFileName(file.name)
    try {
      const path = await uploadVideo(file)
      onChange({ source_type: 'upload', external_id: null, storage_path: path })
    } catch (cause) {
      console.error('[upload] video failed:', cause)
      setError(t('saveError'))
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">{t('videoUploadHint')}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'flex min-h-24 flex-col items-center justify-center gap-2 rounded-md',
          'border-2 border-dashed border-border p-5 text-center transition-colors',
          'hover:border-border-strong disabled:opacity-60',
        )}
      >
        {uploading ? (
          <span className="flex items-center gap-3 text-sm">
            <span className="size-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
            {t('videoUploading')}…
          </span>
        ) : (
          <>
            <svg
              className="size-7 text-subtle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
              <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
            </svg>
            <span className="text-sm text-muted">{t('videoUploadLabel')}</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_VIDEO_TYPES.join(',')}
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {value.storage_path && !uploading && (
        <p className="truncate rounded-md border border-border bg-bg px-3 py-2 text-xs text-muted">
          {fileName ?? value.storage_path}
        </p>
      )}

      {warning && (
        <p className="rounded-md border border-[var(--accent-line)] bg-accent-soft px-3 py-2 text-xs text-text">
          {warning}
        </p>
      )}

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
