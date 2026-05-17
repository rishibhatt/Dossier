"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useEffect, useMemo, type CSSProperties } from "react"

import { CanvasAmbientBackground } from "@/components/portfolio/backgrounds/CanvasAmbientBackground"
import { LayoutRenderer } from "@/components/portfolio/composer/LayoutRenderer"
import { SectionRenderer } from "@/components/portfolio/composer/SectionRenderer"
import { SortableSectionShell } from "@/components/portfolio/composer/SortableSectionShell"
import { PortfolioPreviewBackToTop } from "@/components/studio/PortfolioPreviewBackToTop"
import { ScrollProgress } from "@/components/ui/ScrollProgress"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { buildDesignTokens, mergeCanvasCssVars } from "@/lib/design/buildDesignTokens"
import { logPortfolioDesignSnapshot } from "@/lib/debug/portfolioDesignDebug"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { DesignSectionPlan } from "@/types/designEngine"
import type { PortfolioSection } from "@/types/dossier"

type PortfolioDesignSurfaceProps = {
  standalone?: boolean
  /** Drives palette / mesh uniqueness; defaults to 0 for static preview sessions */
  variationSeed?: number
}

export function PortfolioDesignSurface({
  standalone,
  variationSeed = 0,
}: PortfolioDesignSurfaceProps) {
  const { document: portfolioDocument, designConfig } = useDesignEngine()
  const editMode = usePortfolioStore((s) => s.editMode)
  const reorderSections = usePortfolioStore((s) => s.reorderSections)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sectionPairs = useMemo(() => {
    const pairs: { plan: DesignSectionPlan; section: PortfolioSection }[] = []
    const n = Math.min(designConfig.sections.length, portfolioDocument.sections.length)
    for (let i = 0; i < n; i++) {
      const plan = designConfig.sections[i]!
      const section = portfolioDocument.sections[i]!
      if (plan.type === section.type) pairs.push({ plan, section })
    }
    return pairs
  }, [designConfig.sections, portfolioDocument.sections])

  const sortableIds = useMemo(() => sectionPairs.map((p) => p.section.id), [sectionPairs])

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    reorderSections(String(active.id), String(over.id))
  }

  const tokens = useMemo(
    () => buildDesignTokens(designConfig, variationSeed),
    [designConfig, variationSeed]
  )

  const tokenStyle = useMemo(
    () =>
      ({
        ...mergeCanvasCssVars(designConfig, tokens),
        fontFamily: tokens.typography.fontBody,
      }) as CSSProperties,
    [designConfig, tokens]
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    window.document.title = portfolioDocument.meta.title
    const meta = window.document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute("content", portfolioDocument.meta.description)
    }
  }, [portfolioDocument])

  useEffect(() => {
    logPortfolioDesignSnapshot({
      designConfig,
      tokens,
      variationSeed,
    })
  }, [designConfig, tokens, variationSeed])

  useEffect(() => {
    if (typeof document === "undefined") return
    const ty = designConfig.tokens.typography
    const unique = [...new Set([ty.displayFont, ty.bodyFont, ty.monoFont].filter(Boolean))]
    const id = "dossier-google-fonts"
    document.getElementById(id)?.remove()
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    const families = unique.map((f) => `${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800`).join("&family=")
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`
    document.head.appendChild(link)
    return () => {
      link.remove()
    }
  }, [designConfig])

  const stack = editMode ? (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        {sectionPairs.map(({ plan, section }, index) => (
          <SortableSectionShell key={section.id} id={section.id}>
            {({ dragAttributes, dragListeners }) => (
              <SectionRenderer
                plan={plan}
                section={section}
                sectionIndex={index}
                editChrome={{ dragAttributes, dragListeners }}
              />
            )}
          </SortableSectionShell>
        ))}
      </SortableContext>
    </DndContext>
  ) : (
    sectionPairs.map(({ plan, section }, index) => (
      <SectionRenderer key={section.id} plan={plan} section={section} sectionIndex={index} />
    ))
  )

  return (
    <div
      style={tokenStyle}
      className={cn(
        "scroll-smooth de-surface relative text-[var(--de-fg)]",
        standalone ? "min-h-screen" : "min-h-full overflow-visible rounded-xl border border-[var(--de-border)] shadow-xl"
      )}
      data-de-layout={designConfig.layout.type}
      data-de-direction={designConfig.meta.direction}
      data-de-hero-variant={designConfig.layout.heroVariant}
      data-de-motion-preset={designConfig.motion.preset}
      data-preview-theme="light"
      data-portfolio-embedded={standalone ? "false" : "true"}
      data-canvas-edit={editMode ? "on" : "off"}
    >
      {standalone ? <ScrollProgress variant="window" /> : null}
      {standalone ? <PortfolioPreviewBackToTop mode="window" /> : null}
      <div className={cn("dossier-portfolio-canvas relative", standalone ? "min-h-screen" : "")}>
        <CanvasAmbientBackground designConfig={designConfig} />
        <div className="relative z-10">
          <LayoutRenderer>{stack}</LayoutRenderer>
        </div>
      </div>
    </div>
  )
}
