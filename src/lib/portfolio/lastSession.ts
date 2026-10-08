import type { ParsedResume } from "@/lib/parseResume"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export const LAST_SESSION_KEY = "dossier:last:v1"
const KEY = LAST_SESSION_KEY

export type LastSession = {
  document: PortfolioDocument
  designConfig: DesignConfig
  parsedResume: ParsedResume | null
  hiddenSectionIds: Record<string, boolean>
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
