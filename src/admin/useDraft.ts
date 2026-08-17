import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Local editing buffer over a server record.
 *
 * The form edits a draft copy, never the cached query data, so a
 * background refetch cannot overwrite what is being typed. `dirty` is a
 * deep comparison against the last-synced baseline, which is what drives
 * the save button and the unsaved-changes guard.
 */
export function useDraft<T extends object>(source: T | undefined) {
  const [draft, setDraft] = useState<T | null>(null)
  const baseline = useRef<string>('')

  // Adopt the server record once, and again after a save changes it.
  useEffect(() => {
    if (!source) return
    const serialised = JSON.stringify(source)
    if (baseline.current === '' || baseline.current === serialised) {
      baseline.current = serialised
      setDraft(structuredClone(source))
    }
  }, [source])

  const dirty = useMemo(
    () => draft !== null && JSON.stringify(draft) !== baseline.current,
    [draft],
  )

  /** Update one field. */
  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
  }, [])

  /** Update a `_zh`/`_en` column pair from a BilingualField. */
  const setBilingual = useCallback((base: string, value: { zh: string; en: string }) => {
    setDraft((current) =>
      current ? { ...current, [`${base}_zh`]: value.zh, [`${base}_en`]: value.en } : current,
    )
  }, [])

  /** Call after a successful save so the current draft becomes the baseline. */
  const commit = useCallback(() => {
    setDraft((current) => {
      if (current) baseline.current = JSON.stringify(current)
      return current
    })
  }, [])

  return { draft, setDraft, setField, setBilingual, dirty, commit }
}
