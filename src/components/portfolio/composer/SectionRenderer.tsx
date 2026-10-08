"use client"

import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import type { ReactNode } from "react"

import { SectionEditToolbar } from "@/components/portfolio/editor/SectionEditToolbar"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { DesignSectionPlan } from "@/types/designEngine"
import type { PortfolioSection } from "@/types/dossier"

type Props = {
  node: ReactNode
  section: PortfolioSection
  plan: DesignSectionPlan
  hidden: boolean
  dragAttributes?: DraggableAttributes
  dragListeners?: DraggableSyntheticListeners
}

/** Studio edit chrome around one rendered section: toolbar, hidden placeholder. */
export function SectionRenderer({ node, section, plan, hidden, dragAttributes, dragListeners }: Props) {
  const toggleSectionHidden = usePortfolioStore((s) => s.toggleSectionHidden)
  return (
    <div className="group relative">
      {dragAttributes ? (
        <SectionEditToolbar section={section} plan={plan} dragAttributes={dragAttributes} dragListeners={dragListeners} />
      ) : null}
      {hidden ? (
        <div className="flex flex-wrap items-center justify-center gap-3 border-y border-dashed border-[var(--de-border)] px-4 py-6 text-center text-sm text-[var(--de-muted)]">
          <span>{getPortfolioSectionLabel(section.type)} is hidden on your published page.</span>
          <button
            type="button"
            className="min-h-11 rounded-full border border-[var(--de-border)] px-4 font-medium text-[var(--de-fg)] hover:border-[var(--de-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--de-primary)]"
            onClick={() => toggleSectionHidden(section.id)}
          >
            Show again
          </button>
        </div>
      ) : (
        node
      )}
    </div>
  )
}
