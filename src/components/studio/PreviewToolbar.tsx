"use client"

import {
  ExternalLink,
  Film,
  Maximize2,
  Minus,
  Monitor,
  Newspaper,
  Plus,
  Smartphone,
  Sparkles,
  Tablet,
  Target,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { messages } from "@/config/messages"
import type { CreativeExperienceVariant } from "@/features/creative-mode/buildDefaultExperience"
import { openPortfolioPreviewInNewTab } from "@/lib/portfolio/openPortfolioPreview"
import { cn } from "@/lib/utils"
import { useCreativeModeStore } from "@/store/useCreativeModeStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioShellStore, type StudioViewport } from "@/store/useStudioShellStore"
import { toast } from "sonner"

const CREATIVE_VARIANTS: { id: CreativeExperienceVariant; label: string; icon: LucideIcon }[] = [
  { id: "cinematic", label: "Cinematic", icon: Film },
  { id: "editorial", label: "Editorial", icon: Newspaper },
  { id: "focused", label: "Focused", icon: Target },
]

export function PreviewToolbar() {
  const viewport = useStudioShellStore((s) => s.viewport)
  const setViewport = useStudioShellStore((s) => s.setViewport)
  const zoom = useStudioShellStore((s) => s.zoom)
  const setZoom = useStudioShellStore((s) => s.setZoom)
  const document = usePortfolioStore((s) => s.document)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const studio = messages.dossier.studio

  const rendererMode = useCreativeModeStore((s) => s.rendererMode)
  const creativeVariant = useCreativeModeStore((s) => s.creativeVariant)
  const enterCreativeMode = useCreativeModeStore((s) => s.enterCreativeMode)
  const exitCreativeMode = useCreativeModeStore((s) => s.exitCreativeMode)
  const setCreativeVariant = useCreativeModeStore((s) => s.setCreativeVariant)
  const applyExperiencePrompt = useCreativeModeStore((s) => s.applyExperiencePrompt)
  const [vision, setVision] = useState("")

  const openPreview = () => {
    if (!document || !designConfig) return
    const ok = openPortfolioPreviewInNewTab({ document, designConfig })
    if (!ok) toast.error(studio.previewStorageFailed)
  }

  const chip = (v: StudioViewport) =>
    cn("rounded-md p-1.5 transition-colors", viewport === v ? "bg-white text-[#101114] shadow-sm" : "text-muted-foreground hover:text-foreground")

  const modeChip = (m: "classic" | "creative") =>
    cn(
      "inline-flex min-h-7 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors",
      rendererMode === m ? "bg-[#101114] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
    )

  const variantChip = (variant: CreativeExperienceVariant) =>
    cn(
      "inline-flex min-h-7 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
      creativeVariant === variant ? "bg-[#101114] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
    )

  const switchMode = (m: "classic" | "creative") => {
    if (m === "classic") {
      exitCreativeMode()
      return
    }
    if (document) enterCreativeMode(document)
  }

  return (
    <div className="flex min-h-12 shrink-0 flex-col gap-2 border-b border-black/[0.08] bg-[#F8F6F1]/82 px-3 py-2 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Live preview</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-black/[0.08] bg-white/58 p-0.5 shadow-sm">
          <button type="button" className={modeChip("classic")} onClick={() => switchMode("classic")}>
            Classic
          </button>
          <button
            type="button"
            className={modeChip("creative")}
            disabled={!document}
            onClick={() => switchMode("creative")}
            title="Scene-based creative engine"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Creative
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {rendererMode === "creative" && document ? (
          <div className="flex items-center gap-0.5 rounded-lg border border-black/[0.08] bg-white/58 p-0.5 shadow-sm">
            {CREATIVE_VARIANTS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={variantChip(id)}
                onClick={() => setCreativeVariant(document, id)}
                title={`${label} creative layout`}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {rendererMode === "creative" && document ? (
          <form
            className="flex min-w-0 max-w-[min(100%,420px)] flex-1 items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault()
              if (!vision.trim()) return
              applyExperiencePrompt(vision)
              toast.success("Vision applied to creative config")
              setVision("")
            }}
          >
            <Input
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="e.g. sticky nav, marquee skills, smooth…"
              className="h-8 min-w-0 flex-1 text-xs"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-8 shrink-0 gap-1 px-2 text-xs">
              <Sparkles className="size-3.5" />
              Apply
            </Button>
          </form>
        ) : null}

        <div className="flex items-center gap-1 rounded-lg bg-white/58 p-1 shadow-sm ring-1 ring-black/[0.06]">
          <button type="button" className={chip("desktop")} onClick={() => setViewport("desktop")} aria-label="Desktop">
            <Monitor className="size-[15px]" />
          </button>
          <button type="button" className={chip("tablet")} onClick={() => setViewport("tablet")} aria-label="Tablet">
            <Tablet className="size-[15px]" />
          </button>
          <button type="button" className={chip("mobile")} onClick={() => setViewport("mobile")} aria-label="Mobile">
            <Smartphone className="size-[15px]" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setZoom(zoom - 10)}
          aria-label="Zoom out"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-10 text-center text-xs tabular-nums">{zoom}%</span>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setZoom(zoom + 10)}
          aria-label="Zoom in"
        >
          <Plus className="size-3.5" />
        </button>
        <button type="button" className="ml-1 rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Fullscreen">
          <Maximize2 className="size-3.5" />
        </button>
        <button
          type="button"
          className="ml-1 hidden items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 lg:inline-flex"
          onClick={openPreview}
        >
          <ExternalLink className="size-3.5" aria-hidden />
          {studio.openPreview}
        </button>
      </div>
    </div>
  )
}
