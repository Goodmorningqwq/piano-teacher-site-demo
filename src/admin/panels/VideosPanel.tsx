import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLang } from '@/i18n/language-context'
import { useInvalidateContent, useVideos } from '@/hooks/useContent'
import { createVideo, deleteVideo, reorderVideos, saveVideo } from '@/lib/backend'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { BilingualField } from '../components/BilingualField'
import { ImageDropzone } from '../components/ImageDropzone'
import { SortableList } from '../components/SortableList'
import { PanelHeader } from '../components/Panel'
import { VisibilityToggle, DeleteButton } from '../components/RowControls'
import { VideoSourcePicker, type VideoSourceValue } from '../components/VideoSourcePicker'
import { useDraft } from '../useDraft'
import { posterUrl } from '@/lib/video'
import type { Video } from '@/lib/database.types'

export function VideosPanel() {
  const { t, text } = useLang()
  const queryClient = useQueryClient()
  const invalidate = useInvalidateContent()
  const { showToast } = useToast()
  const { data: videos } = useVideos({ includeHidden: true })
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['videos'] })
    invalidate()
  }

  async function addVideo() {
    const nextOrder = (videos?.at(-1)?.sort_order ?? 0) + 1
    try {
      const created = await createVideo({
        title_zh: t('videoNew'),
        sort_order: nextOrder,
        is_published: false,
        source_type: 'placeholder',
      })
      refresh()
      setEditingId(created.id)
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
    }
  }

  async function reorder(next: Video[]) {
    queryClient.setQueryData(['videos', { includeHidden: true }], next)
    try {
      await reorderVideos(next)
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
    }
    refresh()
  }

  async function setPublished(video: Video, isPublished: boolean) {
    try {
      await saveVideo(video.id, { is_published: isPublished })
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
    }
    refresh()
  }

  async function remove(video: Video) {
    try {
      await deleteVideo(video.id)
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
      return
    }
    refresh()
    showToast({
      message: t('deleted'),
      tone: 'info',
      action: {
        label: t('undo'),
        onAction: async () => {
          try {
            await createVideo(video)
          } catch {
            showToast({ message: t('saveError'), tone: 'error' })
          }
          refresh()
        },
      },
    })
  }

  return (
    <>
      <PanelHeader title={t('videosTitle')} intro={t('videosIntro')} />

      {videos && videos.length > 0 ? (
        <SortableList items={videos} onReorder={(next) => void reorder(next)}>
          {(video) => (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Thumb video={video} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{text(video, 'title')}</p>
                  <p className="truncate text-xs text-subtle">
                    {video.source_type === 'placeholder'
                      ? t('videosEmpty')
                      : video.source_type === 'upload'
                        ? t('videoSourceUpload')
                        : video.source_type}
                  </p>
                </div>

                <VisibilityToggle
                  isPublished={video.is_published}
                  onChange={(next) => void setPublished(video, next)}
                />

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingId(editingId === video.id ? null : video.id)}
                >
                  {editingId === video.id ? t('done') : t('edit')}
                </Button>

                <DeleteButton onConfirm={() => void remove(video)} />
              </div>

              {editingId === video.id && (
                <VideoEditor
                  video={video}
                  onSaved={() => {
                    refresh()
                    showToast({ message: t('saved'), tone: 'success' })
                  }}
                />
              )}
            </div>
          )}
        </SortableList>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-muted">
          {t('videosEmptyAdmin')}
        </p>
      )}

      <div className="mt-6">
        <Button onClick={() => void addVideo()}>{t('videoAdd')}</Button>
      </div>
    </>
  )
}

function Thumb({ video }: { video: Video }) {
  const poster = posterUrl(video)
  return (
    <span className="h-11 w-16 shrink-0 overflow-hidden rounded-sm border border-border bg-bg">
      {poster ? (
        <img src={poster} alt="" className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center">
          <svg
            className="size-4 text-subtle"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden="true"
          >
            <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
            <path d="m10 9.5 5 2.5-5 2.5Z" />
          </svg>
        </span>
      )}
    </span>
  )
}

function VideoEditor({ video, onSaved }: { video: Video; onSaved: () => void }) {
  const { t } = useLang()
  const { draft, setDraft, setField, setBilingual, dirty, commit } = useDraft<Video>(video)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!draft) return

    // An uploaded video has no automatic thumbnail, so without a poster
    // the card on the site would be a black rectangle. Block that here
    // rather than let her discover it on the live page.
    if (draft.source_type === 'upload' && !draft.poster_url) {
      setError(t('videoPosterRequired'))
      return
    }

    setSaving(true)
    setError(null)
    try {
      await saveVideo(draft.id, {
        title_zh: draft.title_zh,
        title_en: draft.title_en,
        description_zh: draft.description_zh,
        description_en: draft.description_en,
        source_type: draft.source_type,
        external_id: draft.external_id,
        storage_path: draft.storage_path,
        poster_url: draft.poster_url,
      })
      commit()
      onSaved()
    } catch (cause) {
      console.error('[admin] video save failed:', cause)
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (!draft) return null

  return (
    <div className="flex flex-col gap-5 rounded-md border border-border bg-bg p-4 sm:p-5">
      <BilingualField
        label={t('videoTitleField')}
        required
        zhValue={draft.title_zh ?? ''}
        enValue={draft.title_en ?? ''}
        onChange={(value) => setBilingual('title', value)}
      />

      <BilingualField
        label={t('videoDescription')}
        multiline
        rows={3}
        zhValue={draft.description_zh ?? ''}
        enValue={draft.description_en ?? ''}
        onChange={(value) => setBilingual('description', value)}
      />

      <VideoSourcePicker
        value={{
          source_type: draft.source_type,
          external_id: draft.external_id,
          storage_path: draft.storage_path,
        }}
        onChange={(next: VideoSourceValue) =>
          setDraft((current) => (current ? { ...current, ...next } : current))
        }
      />

      <ImageDropzone
        label={t('videoPoster')}
        hint={draft.source_type === 'upload' ? t('videoPosterRequired') : undefined}
        bucket="video-posters"
        aspect="landscape"
        value={draft.poster_url}
        onChange={(url) => setField('poster_url', url)}
      />

      <div className="flex items-center justify-between gap-3">
        {error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : (
          <span className="text-sm text-muted">{dirty ? '' : t('saved')}</span>
        )}
        <Button onClick={() => void save()} disabled={!dirty} loading={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
      </div>
    </div>
  )
}
