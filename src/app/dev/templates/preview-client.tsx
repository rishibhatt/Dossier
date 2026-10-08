"use client"

import { PortfolioView } from "@/components/portfolio/page/PortfolioView"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

/** One document + config through the real published renderer. `compact` caps hero height for contact sheets. */
export function TemplatePreviewClient({ document, designConfig, compact, motion = true }: { document: PortfolioDocument; designConfig: DesignConfig; compact?: boolean; motion?: boolean }) {
  return (
    <main className="min-h-screen">
      {compact ? <style>{`.pf-sec--hero{padding-block:3rem !important}`}</style> : null}
      <PortfolioView document={document} config={designConfig} credit={{ show: true, slug: "dev" }} motion={motion} />
    </main>
  )
}
