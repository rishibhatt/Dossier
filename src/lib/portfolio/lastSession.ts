import type { ParsedResume } from "@/lib/parseResume"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export const LAST_SESSION_KEY = "dossier:last:v1"
const KEY = LAST_SESSION_KEY

/** The live site this work was published to (or opened from), so the editor updates it instead of making a new one. */
export type SessionSite = { slug: string; path: string; indexable?: boolean }

export type LastSession = {
  document: PortfolioDocument
  designConfig: DesignConfig
  parsedResume: ParsedResume | null
  hiddenSectionIds: Record<string, boolean>
  sectionSurfaceOverrides?: Record<string, { bg?: string }>
  site?: SessionSite | null
  /** Edited since the last publish. Only meaningful with `site`. */
  unpublished?: boolean
  savedAt: string
}

/** Remembers the newest portfolio on this device so a reload or a sign-in round trip does not lose the work. */
export function saveLastSession(session: Omit<LastSession, "savedAt">): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...session, savedAt: new Date().toISOString() }))
  } catch {
    /* storage full or blocked: the in-memory session still works */
  }
}

/** Validates a stored snapshot. Returns null for anything missing, old or malformed. */
export function parseLastSession(raw: string | null): LastSession | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as LastSession
    if (!parsed?.document?.sections?.length || !parsed?.designConfig?.sections) return null
    return parsed
  } catch {
    return null
  }
}

/** Raw stored value, for useSyncExternalStore. Stable between reads, so React does not loop. */
export function readLastSessionRaw(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearLastSession(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

const INTENT_KEY = "dossier:after-auth"

/** What to do when the person comes back from signing up or in: reopen the work, and publish it if that was the ask. */
export type AfterAuthIntent = "publish" | "continue"

export function setAfterAuthIntent(intent: AfterAuthIntent): void {
  try {
    window.sessionStorage.setItem(INTENT_KEY, intent)
  } catch {
    /* blocked storage: the person can press Continue and Publish themselves */
  }
}

/** Reads and clears the intent, so it runs once. */
export function takeAfterAuthIntent(): AfterAuthIntent | null {
  try {
    const v = window.sessionStorage.getItem(INTENT_KEY)
    window.sessionStorage.removeItem(INTENT_KEY)
    return v === "publish" || v === "continue" ? v : null
  } catch {
    return null
  }
}

export function peekAfterAuthIntent(): AfterAuthIntent | null {
  try {
    const v = window.sessionStorage.getItem(INTENT_KEY)
    return v === "publish" || v === "continue" ? v : null
  } catch {
    return null
  }
}
