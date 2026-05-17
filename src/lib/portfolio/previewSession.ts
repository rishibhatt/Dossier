import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export const PREVIEW_SESSION_PREFIX = "dossier:preview:v1:"

const TTL_MS = 1000 * 60 * 30

export type PreviewSessionPayload = {
  document: PortfolioDocument
  designConfig: DesignConfig
}

type StoredEnvelope = {
  payload: PreviewSessionPayload
  created: number
}

/**
 * Persists preview payload in **localStorage** (not sessionStorage) so a tab opened
 * with `window.open` can read the same origin data — sessionStorage is per-tab only.
 */
export function writePreviewSession(id: string, payload: PreviewSessionPayload): boolean {
  if (typeof window === "undefined") return false
  try {
    const envelope: StoredEnvelope = { payload, created: Date.now() }
    window.localStorage.setItem(`${PREVIEW_SESSION_PREFIX}${id}`, JSON.stringify(envelope))
    return true
  } catch {
    return false
  }
}

export function readPreviewSession(id: string): PreviewSessionPayload | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(`${PREVIEW_SESSION_PREFIX}${id}`)
    if (!raw) return null
    const envelope = JSON.parse(raw) as StoredEnvelope
    if (!envelope?.payload?.document || !envelope?.payload?.designConfig) {
      return null
    }
    if (Date.now() - envelope.created > TTL_MS) {
      window.localStorage.removeItem(`${PREVIEW_SESSION_PREFIX}${id}`)
      return null
    }
    const { document, designConfig } = envelope.payload
    return { document, designConfig }
  } catch {
    return null
  }
}
