import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLang } from '@/i18n/language-context'
import { useCourses, useInvalidateContent } from '@/hooks/useContent'
import { createCourse, deleteCourse, reorderCourses, saveCourse } from '@/lib/backend'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { CourseIcon, COURSE_ICONS } from '@/components/ui/CourseIcon'
import { useToast } from '@/components/ui/Toast'
import { BilingualField } from '../components/BilingualField'
import { ImageDropzone } from '../components/ImageDropzone'
import { SortableList } from '../components/SortableList'
import { PanelHeader } from '../components/Panel'
import { VisibilityToggle, DeleteButton } from '../components/RowControls'
import { useDraft } from '../useDraft'
import { cn } from '@/lib/cn'
import type { Course } from '@/lib/database.types'

export function CoursesPanel() {
  const { t, text } = useLang()
  const queryClient = useQueryClient()
  const invalidate = useInvalidateContent()
  const { showToast } = useToast()
  const { data: courses } = useCourses({ includeHidden: true })
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['courses'] })
    invalidate()
  }

  async function addCourse() {
    const nextOrder = (courses?.at(-1)?.sort_order ?? 0) + 1
    try {
      const created = await createCourse({
        title_zh: t('courseNew'),
        sort_order: nextOrder,
        is_published: false,
      })
      refresh()
      // Open the new course straight away — creating it is never the goal,
      // filling it in is.
      setEditingId(created.id)
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
    }
  }

  async function reorder(next: Course[]) {
    queryClient.setQueryData(['courses', { includeHidden: true }], next)
    try {
      await reorderCourses(next)
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
    }
    refresh()
  }

  async function setPublished(course: Course, isPublished: boolean) {
    try {
      await saveCourse(course.id, { is_published: isPublished })
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
    }
    refresh()
  }

  async function remove(course: Course) {
    try {
      await deleteCourse(course.id)
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
          // Re-insert the exact row, id included, so nothing else shifts.
          try {
            await createCourse(course)
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
      <PanelHeader title={t('coursesTitle')} intro={t('coursesIntro')} />

      {courses && courses.length > 0 ? (
        <SortableList items={courses} onReorder={(next) => void reorder(next)}>
          {(course) => (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <CourseIcon name={course.icon} className="size-4.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{text(course, 'title')}</p>
                  {text(course, 'level') && (
                    <p className="truncate text-xs text-subtle">{text(course, 'level')}</p>
                  )}
                </div>

                <VisibilityToggle
                  isPublished={course.is_published}
                  onChange={(next) => void setPublished(course, next)}
                />

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingId(editingId === course.id ? null : course.id)}
                >
                  {editingId === course.id ? t('done') : t('edit')}
                </Button>

                <DeleteButton onConfirm={() => void remove(course)} />
              </div>

              {editingId === course.id && (
                <CourseEditor
                  course={course}
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
          {t('coursesEmptyAdmin')}
        </p>
      )}

      <div className="mt-6">
        <Button onClick={() => void addCourse()}>{t('courseAdd')}</Button>
      </div>
    </>
  )
}

function CourseEditor({ course, onSaved }: { course: Course; onSaved: () => void }) {
  const { t } = useLang()
  const { draft, setField, setBilingual, dirty, commit } = useDraft<Course>(course)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!draft) return
    setSaving(true)
    setError(null)
    try {
      await saveCourse(draft.id, {
        title_zh: draft.title_zh,
        title_en: draft.title_en,
        summary_zh: draft.summary_zh,
        summary_en: draft.summary_en,
        level_zh: draft.level_zh,
        level_en: draft.level_en,
        duration_min: draft.duration_min,
        price: draft.price,
        price_note_zh: draft.price_note_zh,
        price_note_en: draft.price_note_en,
        icon: draft.icon,
        image_url: draft.image_url,
      })
      commit()
      onSaved()
    } catch (cause) {
      console.error('[admin] course save failed:', cause)
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (!draft) return null

  return (
    <div className="flex flex-col gap-5 rounded-md border border-border bg-bg p-4 sm:p-5">
      <BilingualField
        label={t('courseTitleField')}
        required
        zhValue={draft.title_zh ?? ''}
        enValue={draft.title_en ?? ''}
        onChange={(value) => setBilingual('title', value)}
      />

      <BilingualField
        label={t('courseSummary')}
        multiline
        rows={4}
        zhValue={draft.summary_zh ?? ''}
        enValue={draft.summary_en ?? ''}
        onChange={(value) => setBilingual('summary', value)}
      />

      <BilingualField
        label={t('courseLevelField')}
        hint={t('courseLevelHint')}
        zhValue={draft.level_zh ?? ''}
        enValue={draft.level_en ?? ''}
        onChange={(value) => setBilingual('level', value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('courseDurationField')}>
          {({ id }) => (
            <Input
              id={id}
              type="number"
              inputMode="numeric"
              min={1}
              max={600}
              value={draft.duration_min ?? ''}
              onChange={(e) =>
                setField('duration_min', e.target.value ? Number(e.target.value) : null)
              }
            />
          )}
        </Field>

        <Field label={t('coursePriceField')}>
          {({ id }) => (
            <Input
              id={id}
              type="number"
              inputMode="decimal"
              min={0}
              value={draft.price ?? ''}
              onChange={(e) => setField('price', e.target.value ? Number(e.target.value) : null)}
            />
          )}
        </Field>
      </div>

      <BilingualField
        label={t('coursePriceNote')}
        hint={t('coursePriceNoteHint')}
        zhValue={draft.price_note_zh ?? ''}
        enValue={draft.price_note_en ?? ''}
        onChange={(value) => setBilingual('price_note', value)}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('courseIcon')}</span>
        <div className="flex flex-wrap gap-2">
          {COURSE_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              aria-label={icon}
              aria-pressed={draft.icon === icon}
              onClick={() => setField('icon', icon)}
              className={cn(
                'inline-flex size-11 items-center justify-center rounded-md border transition-colors',
                draft.icon === icon
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border text-muted hover:border-border-strong hover:text-text',
              )}
            >
              <CourseIcon name={icon} />
            </button>
          ))}
        </div>
      </div>

      <ImageDropzone
        label={t('courseImage')}
        bucket="course-images"
        aspect="landscape"
        value={draft.image_url}
        onChange={(url) => setField('image_url', url)}
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
