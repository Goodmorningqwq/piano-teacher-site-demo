import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  tone: ToastTone
  /** Renders an action button — used for "Deleted · Undo". */
  action?: { label: string; onAction: () => void }
}

type ToastContextValue = {
  showToast: (toast: Omit<Toast, 'id'> & { durationMs?: number }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = use(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-[var(--success)] bg-[var(--success-soft)]',
  error: 'border-[var(--danger)] bg-[var(--danger-soft)]',
  info: 'border-border bg-bg-elevated',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback<ToastContextValue['showToast']>(
    ({ durationMs, ...toast }) => {
      const id = nextId.current++
      setToasts((current) => [...current, { ...toast, id }])
      // Undo offers need longer to be noticed and acted on.
      const life = durationMs ?? (toast.action ? 7000 : 3500)
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), life),
      )
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-110 flex flex-col items-center gap-2 p-4"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'pointer-events-auto flex w-full max-w-md items-center gap-4',
                'rounded-md border px-4 py-3 shadow-lg backdrop-blur-md',
                TONE_STYLES[toast.tone],
              )}
            >
              <p className="flex-1 text-sm text-text">{toast.message}</p>

              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onAction()
                    dismiss(toast.id)
                  }}
                  className="shrink-0 rounded-sm px-2 py-1 text-sm font-medium text-accent hover:bg-accent-soft"
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  )
}
