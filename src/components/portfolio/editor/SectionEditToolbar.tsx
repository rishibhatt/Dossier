"use client"

import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import {
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Layers,
  Palette,
  Trash2,
} from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SECTION_VARIANT_CYCLE } from "@/lib/portfolio/sectionVariantPools"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { DesignSectionPlan } from "@/types/designEngine"
import type { PortfolioSection } from "@/types/dossier"

type Props = {
  section: PortfolioSection
  plan: DesignSectionPlan
  dragAttributes: DraggableAttributes
  dragListeners?: DraggableSyntheticListeners
}

export function SectionEditToolbar({ section, plan, dragAttributes, dragListeners }: Props) {
  const heroFileRef = useRef<HTMLInputElement>(null)
  const projectFileRef = useRef<HTMLInputElement>(null)
  const toggleSectionHidden = usePortfolioStore((s) => s.toggleSectionHidden)
  const deleteSection = usePortfolioStore((s) => s.deleteSection)
  const cycleSectionVariant = usePortfolioStore((s) => s.cycleSectionVariant)
  const setSectionSurfaceOverride = usePortfolioStore((s) => s.setSectionSurfaceOverride)
  const updateSection = usePortfolioStore((s) => s.updateSection)
  const updateProjectItem = usePortfolioStore((s) => s.updateProjectItem)
  const hiddenSectionIds = usePortfolioStore((s) => s.hiddenSectionIds)
  const overrides = usePortfolioStore((s) => s.sectionSurfaceOverrides)
  const hidden = Boolean(hiddenSectionIds[section.id])
  const bg = overrides[section.id]?.bg ?? ""

  const onHeroImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || section.type !== "hero") return
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : null
      if (url) updateSection("hero", { imageUrl: url })
    }
    reader.readAsDataURL(f)
    e.target.value = ""
  }

  const onProject0Image = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || section.type !== "projects") return
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : null
      if (url) updateProjectItem(0, { imageUrl: url })
    }
    reader.readAsDataURL(f)
    e.target.value = ""
  }

  const pool = SECTION_VARIANT_CYCLE[section.type]
  const variantHint = `${plan.variant.slice(0, 24)}${plan.variant.length > 24 ? "…" : ""} · ${pool.length} styles`

  return (
    <div
      className={cn(
        "pointer-events-auto absolute right-2 top-2 z-20 flex flex-wrap items-center gap-1 rounded-lg border border-[var(--de-border)] bg-[var(--de-elevated)]/95 p-1 shadow-md backdrop-blur-sm",
        "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {dragListeners ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 cursor-grab touch-none text-[var(--de-muted)] active:cursor-grabbing"
          aria-label="Drag to reorder section"
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="size-4" />
        </Button>
      ) : null}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 text-[var(--de-fg)]"
        title={variantHint}
        aria-label="Cycle section layout variant"
        onClick={() => cycleSectionVariant(section.id)}
      >
        <Layers className="size-4" />
      </Button>
      <label className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-[color-mix(in_oklab,var(--de-fg)_10%,transparent)]">
        <Palette className="size-4 text-[var(--de-fg)]" aria-hidden />
        <input
          type="color"
          className="sr-only"
          value={bg || "#000000"}
          onChange={(e) => setSectionSurfaceOverride(section.id, { bg: e.target.value })}
          aria-label="Section background tint"
        />
      </label>
      {bg ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-1 text-[10px] text-[var(--de-muted)]"
          onClick={() => setSectionSurfaceOverride(section.id, null)}
        >
          clear
        </Button>
      ) : null}
      {section.type === "hero" ? (
        <>
          <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={onHeroImage} />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 text-[var(--de-fg)]"
            title="Upload hero image"
            aria-label="Upload hero image"
            onClick={() => heroFileRef.current?.click()}
          >
            <ImagePlus className="size-4" />
          </Button>
        </>
      ) : null}
      {section.type === "projects" ? (
        <>
          <input ref={projectFileRef} type="file" accept="image/*" className="hidden" onChange={onProject0Image} />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 text-[var(--de-fg)]"
            title="Cover image for first project (unlocks spotlight layouts)"
            aria-label="Upload first project image"
            onClick={() => projectFileRef.current?.click()}
          >
            <ImagePlus className="size-4" />
          </Button>
        </>
      ) : null}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 text-[var(--de-fg)]"
        title={hidden ? "Show section" : "Hide section on canvas"}
        aria-label={hidden ? "Show section" : "Hide section"}
        onClick={() => toggleSectionHidden(section.id)}
      >
        {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 text-red-600 hover:text-red-600 dark:text-red-400"
        title="Remove section"
        aria-label="Delete section"
        onClick={() => {
          if (typeof window !== "undefined" && !window.confirm("Remove this section from the portfolio?")) return
          deleteSection(section.id)
        }}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
