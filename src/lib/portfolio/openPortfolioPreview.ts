import { writePreviewSession } from "@/lib/portfolio/previewSession"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export function openPortfolioPreviewInNewTab(payload: {
  document: PortfolioDocument
  designConfig: DesignConfig
}): boolean {
  if (typeof window === "undefined") return false
  const id = crypto.randomUUID()
  const ok = writePreviewSession(id, payload)
  if (!ok) return false
  window.open(`/preview/${id}`, "_blank", "noopener,noreferrer")
  return true
}
