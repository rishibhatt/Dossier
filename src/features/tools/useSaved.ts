"use client"

import { useCallback, useMemo, useState, useSyncExternalStore, type SetStateAction } from "react"

const noop = () => () => {}

/**
 * useState that survives a reload: the value is kept in this browser's localStorage under `dossier_tool_<key>`,
 * so a visitor who comes back finds what they typed. Nothing leaves the device. The server render uses
 * `initial`; the saved value appears on hydration.
 */
export function useSaved<T>(key: string, initial: T): [T, (u: SetStateAction<T>) => void] {
  const storageKey = `dossier_tool_${key}`
  const raw = useSyncExternalStore(
    noop,
    () => {
      try {
        return localStorage.getItem(storageKey)
      } catch {
        return null
      }
    },
    () => null
  )
  const saved = useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }, [raw])
  const [edited, setEdited] = useState<{ v: T } | null>(null)
  const value = edited ? edited.v : (saved ?? initial)

  const set = useCallback(
    (u: SetStateAction<T>) => {
      setEdited((prev) => {
        const base = prev ? prev.v : (saved ?? initial)
        const next = typeof u === "function" ? (u as (p: T) => T)(base) : u
        try {
          localStorage.setItem(storageKey, JSON.stringify(next))
        } catch {
          /* storage full or blocked: the tool still works, it just forgets */
        }
        return { v: next }
      })
    },
    [storageKey, saved, initial]
  )
  return [value, set]
}
