"use client"

import { useSyncExternalStore } from "react"

export type StudioLayout = "phone" | "tablet" | "desktop"

const TABLET = "(min-width: 768px)"
const DESKTOP = "(min-width: 1024px)"

function read(): StudioLayout {
  if (typeof window === "undefined") return "phone"
  if (window.matchMedia(DESKTOP).matches) return "desktop"
  if (window.matchMedia(TABLET).matches) return "tablet"
  return "phone"
}

function subscribe(cb: () => void) {
  const a = window.matchMedia(TABLET)
  const b = window.matchMedia(DESKTOP)
  a.addEventListener("change", cb)
  b.addEventListener("change", cb)
  return () => {
    a.removeEventListener("change", cb)
    b.removeEventListener("change", cb)
  }
}

/** Phone under 768px, tablet to 1023px, desktop from 1024px. Server render assumes phone. */
export function useStudioLayout(): StudioLayout {
  return useSyncExternalStore(subscribe, read, () => "phone")
}

/** Any media query as a boolean, safe on the server. */
export function useMedia(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
    () => fallback
  )
}
