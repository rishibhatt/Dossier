"use client"

import { PortfolioView } from "@/components/portfolio/page/PortfolioView"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export type PublishedPayload = {
  document: PortfolioDocument
  designConfig: DesignConfig
  /** Sections the owner hid in the studio (never rendered publicly). */
  hiddenSectionIds?: string[]
  sectionSurfaceOverrides?: Record<string, { bg?: string }>
}

/** Server-rendered published portfolio (no store hydration, so the first paint is the real page). */
export function PublishedPortfolioClient({ payload, showBadge = true, slug }: { payload: PublishedPayload; showBadge?: boolean; slug?: string }) {
  return (
    <main className="min-h-screen">
      <PortfolioView
        document={payload.document}
        config={payload.designConfig}
        hidden={payload.hiddenSectionIds ?? []}
        surfaces={payload.sectionSurfaceOverrides}
        credit={{ show: showBadge, slug }}
      />
    </main>
  )
}
