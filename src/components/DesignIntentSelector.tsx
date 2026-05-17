"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ParsedResume } from "@/lib/parseResume"
import { suggestDesignDirection } from "@/lib/parseResume"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { DesignConfig } from "@/types/designEngine"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"
import { cn } from "@/lib/utils"

const DIRECTIONS: {
  id: DesignDirectionId
  title: string
  line: string
  traits: string[]
  swatch: string
}[] = [
  {
    id: "EDITORIAL_MONO",
    title: "Editorial",
    line: "Type as art.",
    traits: ["Typographic Hierarchy", "Black & White Tension", "Print-Inspired Grid"],
    swatch: "linear-gradient(135deg,#0a0a0a 0%,#fafafa 100%)",
  },
  {
    id: "LUMINOUS_DARK",
    title: "Luminous",
    line: "Glow from within.",
    traits: ["Deep Space Palette", "Neon Accent Glow", "Glass Surfaces"],
    swatch: "linear-gradient(135deg,#08080f 0%,#7c3aed 40%,#06b6d4 100%)",
  },
  {
    id: "ORGANIC_GRADIENT",
    title: "Organic",
    line: "Color as emotion.",
    traits: ["Mesh Gradient System", "Fluid Typography", "Motion-Forward"],
    swatch: "linear-gradient(120deg,#312e81,#4c1d95,#0f172a)",
  },
  {
    id: "BRUTALIST_GRID",
    title: "Brutalist",
    line: "Structure as statement.",
    traits: ["Raw Grid Exposure", "High Contrast Type", "No Decoration"],
    swatch: "repeating-linear-gradient(90deg,#000 0 1px,transparent 1px 12px),#fafafa",
  },
  {
    id: "LIQUID_ENTERPRISE",
    title: "Enterprise",
    line: "Authority with depth.",
    traits: ["Deep Navy System", "Structured Hierarchy", "Trusted Typography"],
    swatch: "linear-gradient(180deg,#0b1224 0%,#1e3a5f 100%)",
  },
  {
    id: "CHROMATIC_CHAOS",
    title: "Chromatic",
    line: "Rules are suggestions.",
    traits: ["Unexpected Color Splits", "Asymmetric Layout", "Kinetic Energy"],
    swatch: "conic-gradient(from 180deg,#ec4899,#34d399,#818cf8,#ec4899)",
  },
]

type DesignIntentSelectorProps = {
  parsedResume: ParsedResume
  variationSeed: number
  onApplied: () => void
  className?: string
}

export function DesignIntentSelector({ parsedResume, variationSeed, onApplied, className }: DesignIntentSelectorProps) {
  const [vision, setVision] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggested = useMemo(() => suggestDesignDirection(parsedResume.signals), [parsedResume.signals])

  const applyDirection = async (direction: DesignDirectionId) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/build-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedResume,
          direction,
          variationSeed,
          visionNote: vision.trim() || undefined,
        }),
      })
      const body = (await res.json()) as { designConfig?: unknown; error?: string }
      if (!res.ok || !body.designConfig) {
        setError(body.error ?? "Could not apply design direction.")
        return
      }
      usePortfolioStore.getState().setDesignConfig(body.designConfig as DesignConfig)
      onApplied()
    } catch {
      setError("Network error.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={cn("rounded-lg border border-border bg-muted/20 p-3", className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Design intent</p>
        <Button type="button" variant="secondary" size="sm" className="h-7 shrink-0 px-2 text-[11px]" disabled={busy} onClick={() => void applyDirection(suggested)}>
          AI: {suggested.replace(/_/g, " ")}
        </Button>
      </div>

      <details className="group mb-2 rounded-md border border-border/60 bg-background/50 px-2 py-1.5">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
          <ChevronDown className="size-3.5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
          Vision notes (optional)
        </summary>
        <p className="mb-1.5 mt-2 text-[10px] leading-snug text-muted-foreground">
          Applied when you pick a mood or AI suggest. Use ⌘K in the canvas area for quick tweaks anytime.
        </p>
        <Textarea
          id="vision-notes"
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          placeholder="e.g. warmer, more pink, Swiss grid…"
          className="min-h-[4.5rem] resize-none text-xs"
          maxLength={2000}
        />
      </details>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:thin]">
        {DIRECTIONS.map((d) => (
          <motion.button
            key={d.id}
            type="button"
            disabled={busy}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            title={`${d.title} — ${d.line}`}
            onClick={() => void applyDirection(d.id)}
            className={cn(
              "flex w-[5.75rem] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md",
              suggested === d.id && "ring-2 ring-primary/50"
            )}
          >
            <div className="h-11 w-full" style={{ background: d.swatch }} aria-hidden />
            <div className="px-1.5 py-1.5">
              <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-foreground">{d.title}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </section>
  )
}
