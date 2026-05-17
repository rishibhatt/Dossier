"use client"

import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import { motion, useReducedMotion } from "framer-motion"

import { renderComposerSection } from "@/components/portfolio/composer/sectionRegistry"
import { SectionEditToolbar } from "@/components/portfolio/editor/SectionEditToolbar"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { useSectionAnimation } from "@/lib/animations/useAnimation"
import { getSectionBackgroundCss, getSectionSeparatorClass } from "@/lib/portfolio/canvasSectionRhythm"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { DesignSectionPlan } from "@/types/designEngine"
import type { PortfolioSection } from "@/types/dossier"

type Props = {
  plan: DesignSectionPlan
  section: PortfolioSection
  /** Order in the layout stack — drives staggered Framer reveals on regen. */
  sectionIndex?: number
  editChrome?: {
    dragAttributes: DraggableAttributes
    dragListeners?: DraggableSyntheticListeners
  }
}

export function SectionRenderer({ plan, section, sectionIndex = 0, editChrome }: Props) {
  const { designConfig } = useDesignEngine()
  const reduce = useReducedMotion()
  const preset = useSectionAnimation(designConfig, sectionIndex)
  const node = renderComposerSection(section, plan.variant, designConfig, sectionIndex)

  const editMode = usePortfolioStore((s) => s.editMode)
  const hiddenSectionIds = usePortfolioStore((s) => s.hiddenSectionIds)
  const toggleSectionHidden = usePortfolioStore((s) => s.toggleSectionHidden)
  const sectionSurfaceOverrides = usePortfolioStore((s) => s.sectionSurfaceOverrides)

  const hidden = Boolean(hiddenSectionIds[section.id])
  const overrideBg = sectionSurfaceOverrides[section.id]?.bg
  const rhythmBg = getSectionBackgroundCss(sectionIndex, designConfig)
  const topRule = sectionIndex > 0 ? getSectionSeparatorClass(designConfig.meta.direction) : ""
  const surfaceStyle = overrideBg
    ? { backgroundColor: overrideBg }
    : { backgroundColor: rhythmBg }

  if (hidden && !editMode) {
    return null
  }

  if (hidden && editMode) {
    return (
      <div
        className="scroll-mt-8 rounded-lg border border-dashed border-[var(--de-border)] bg-[color-mix(in_oklab,var(--de-fg)_4%,transparent)] px-[var(--de-pad-x)] py-4 text-center"
        style={surfaceStyle}
      >
        <p className="text-xs font-medium text-[var(--de-muted)]">Section hidden on preview</p>
        <button
          type="button"
          className="mt-2 text-sm font-semibold text-[var(--de-accent)] underline-offset-2 hover:underline"
          onClick={() => toggleSectionHidden(section.id)}
        >
          Show again
        </button>
      </div>
    )
  }

  const toolbar =
    editMode && editChrome ? (
      <SectionEditToolbar
        section={section}
        plan={plan}
        dragAttributes={editChrome.dragAttributes}
        dragListeners={editChrome.dragListeners}
      />
    ) : null

  const shellClass = cn("group relative scroll-mt-8", topRule)

  if (reduce) {
    return (
      <div className={shellClass} style={surfaceStyle}>
        {toolbar}
        {node}
      </div>
    )
  }

  return (
    <motion.div
      key={section.id}
      className={cn(shellClass)}
      style={surfaceStyle}
      initial={preset.initial}
      whileInView={preset.animate}
      viewport={{ once: true, margin: "-80px 0px", amount: 0.15 }}
      transition={preset.transition}
    >
      {toolbar}
      {node}
    </motion.div>
  )
}
