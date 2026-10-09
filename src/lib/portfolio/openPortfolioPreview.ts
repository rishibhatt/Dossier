import { writePreviewSession, type PreviewSessionPayload } from "@/lib/portfolio/previewSession"

/** Opens /preview/<id> in a new tab. Pass hiddenSectionIds / sectionSurfaceOverrides / credit to mirror the canvas. */
export function openPortfolioPreviewInNewTab(payload: PreviewSessionPayload): boolean {
  if (typeof window === "undefined") return false
  const id = crypto.randomUUID()
  if (!writePreviewSession(id, payload)) return false
  window.open(`/preview/${id}`, "_blank", "noopener,noreferrer")
  return true
}
