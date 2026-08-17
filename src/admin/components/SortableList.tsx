import type { ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useLang } from '@/i18n/language-context'
import { cn } from '@/lib/cn'

type Identifiable = { id: string }

/**
 * Drag-to-reorder list.
 *
 * Sensors are configured for a touch-first user: an 8px activation
 * distance so a tap to edit is never mistaken for a drag, plus full
 * keyboard support since drag-and-drop alone is not accessible.
 */
export function SortableList<T extends Identifiable>({
  items,
  onReorder,
  children,
}: {
  items: T[]
  onReorder: (items: T[]) => void
  children: (item: T) => ReactNode
}) {
  const { t } = useLang()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = items.findIndex((item) => item.id === active.id)
    const to = items.findIndex((item) => item.id === over.id)
    if (from < 0 || to < 0) return
    onReorder(arrayMove(items, from, to))
  }

  return (
    <>
      <p className="mb-3 text-xs text-subtle">{t('dragToReorder')}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <SortableRow key={item.id} id={item.id}>
                {children(item)}
              </SortableRow>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  )
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { t } = useLang()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-stretch gap-2 rounded-lg border border-border bg-surface',
        isDragging && 'z-10 opacity-90 shadow-lg',
      )}
    >
      {/* Generous grab column — this has to be comfortable on an iPad. */}
      <button
        type="button"
        aria-label={t('dragToReorder')}
        {...attributes}
        {...listeners}
        className={cn(
          'flex w-11 shrink-0 cursor-grab touch-none items-center justify-center',
          'rounded-l-lg text-subtle hover:bg-surface-hover hover:text-accent',
          'active:cursor-grabbing',
        )}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>

      <div className="min-w-0 flex-1 py-3 pr-3">{children}</div>
    </li>
  )
}
