"use client"

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useEffect, useRef, type ReactNode } from "react"

import { SectionRenderer } from "@/components/portfolio/composer/SectionRenderer"
import { SortableSectionShell } from "@/components/portfolio/composer/SortableSectionShell"
import type { CreditMode } from "@/components/portfolio/DossierCredit"
import { EditableText } from "@/components/portfolio/editor/EditableText"
import { usePortfolioMotion } from "@/components/portfolio/motion/usePortfolioMotion"
import { PortfolioPage, type SectionWrapInfo } from "@/components/portfolio/page/PortfolioPage"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { usePortfolioStore } from "@/store/usePortfolioStore"

export type PortfolioDesignSurfaceProps = {
  /** Full-page render (published / preview / dev) vs. embedded studio canvas. */
  standalone?: boolean
  /** Kept for API compatibility; palette variation lives in DesignConfig now. */
  variationSeed?: number
  /** Legacy slot rendered after the sections (inside the theme). Prefer `credit`. */
  footer?: ReactNode
  /** "Made with Dossier": "free" shows it (default), "none" hides it. */
  credit?: CreditMode
  /** Studio: clicking the credit opens the upgrade sheet instead of the link. */
  onCreditClick?: () => void
  /** Published slug, added to the credit link as ?ref=. */
  slug?: string | null
}

/** Studio canvas: the pure PortfolioPage plus edit chrome (inline text, toolbar, drag to reorder) and motion. */
export function PortfolioDesignSurface({ standalone, footer, credit = "free", onCreditClick, slug }: PortfolioDesignSurfaceProps) {
  const { document: doc, designConfig } = useDesignEngine()
  const editMode = usePortfolioStore((s) => s.editMode)
  const hidden = usePortfolioStore((s) => s.hiddenSectionIds)
  const surfaces = usePortfolioStore((s) => s.sectionSurfaceOverrides)
  const reorderSections = usePortfolioStore((s) => s.reorderSections)
  const rootRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const motionKey = `${designConfig.meta.templateId}|${designConfig.meta.variationSeed}|${designConfig.motion.preset}|${doc.sections.map((s) => s.id).join(",")}`
  usePortfolioMotion(rootRef, { disabled: editMode, key: motionKey })

  useEffect(() => {
    if (!standalone) return
    window.document.title = doc.meta.title
    window.document.querySelector('meta[name="description"]')?.setAttribute("content", doc.meta.description)
  }, [doc.meta, standalone])

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) reorderSections(String(active.id), String(over.id))
  }

  const wrapSection = editMode
    ? (node: ReactNode, { section, plan, hidden: isHidden }: SectionWrapInfo) => (
        <SortableSectionShell id={section.id}>
          {({ dragAttributes, dragListeners }) => (
            <SectionRenderer node={node} section={section} plan={plan} hidden={isHidden} dragAttributes={dragAttributes} dragListeners={dragListeners} />
          )}
        </SortableSectionShell>
      )
    : undefined

  const wrapList = editMode
    ? (children: ReactNode) => (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={doc.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {children}
          </SortableContext>
        </DndContext>
      )
    : undefined

  return (
    <div className={standalone ? "min-h-screen" : "min-h-full overflow-hidden rounded-xl border border-black/10 shadow-xl"} data-portfolio-embedded={standalone ? "false" : "true"}>
      <PortfolioPage
        document={doc}
        config={designConfig}
        hidden={hidden}
        surfaces={surfaces}
        editing={editMode}
        T={EditableText}
        rootRef={rootRef}
        credit={footer !== undefined ? undefined : { show: credit !== "none", slug, onClick: onCreditClick }}
        wrapSection={wrapSection}
        wrapList={wrapList}
      />
      {footer}
    </div>
  )
}
