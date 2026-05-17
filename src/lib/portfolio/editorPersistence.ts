import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

const PREFIX = "dossier:canvas:v1:"

export type EditorPersistedPayload = {
  document: PortfolioDocument
  designConfig: DesignConfig
  hiddenSectionIds: Record<string, boolean>
  sectionSurfaceOverrides: Record<string, { bg?: string }>
  /** ISO timestamp for debugging */
  savedAt: string
}

function fingerprint(doc: PortfolioDocument): string {
  const ids = doc.sections.map((s) => s.id).join("|")
  const t = doc.meta.title.slice(0, 80)
  return `${t}::${ids}`
}

export function editorStorageKey(doc: PortfolioDocument | null): string | null {
  if (!doc) return null
  return `${PREFIX}${encodeURIComponent(fingerprint(doc))}`
}

export function loadEditorDraft(doc: PortfolioDocument): EditorPersistedPayload | null {
  if (typeof window === "undefined") return null
  const key = editorStorageKey(doc)
  if (!key) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as EditorPersistedPayload
    if (!parsed?.document?.sections || !parsed?.designConfig?.sections) return null
    if (fingerprint(parsed.document) !== fingerprint(doc)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveEditorDraft(payload: EditorPersistedPayload): void {
  if (typeof window === "undefined") return
  const key = editorStorageKey(payload.document)
  if (!key) return
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...payload, savedAt: new Date().toISOString() })
    )
  } catch {
    /* quota */
  }
}

export function clearEditorDraft(doc: PortfolioDocument): void {
  if (typeof window === "undefined") return
  const key = editorStorageKey(doc)
  if (key) window.localStorage.removeItem(key)
}
