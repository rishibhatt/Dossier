"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { messages } from "@/config/messages"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { PORTFOLIO_STYLE_LABELS, PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { cn } from "@/lib/utils"

type PortfolioStyleConfigureCardProps = {
  file: File
  onGenerate: (ctx: PortfolioGenerationContext) => void
  onPickDifferent: () => void
  busy: boolean
}

const presetDescriptions: Record<PortfolioStylePreset, string> = {
  minimal_dev: "Clean layouts, structured information, and sharp readability.",
  creative_dev: "Bold contrast, motion accents, and expressive visuals.",
  designer: "Balanced, modern, and focused on clarity and craft.",
  editorial: "Elegant typography, spacious layouts, and editorial feel.",
  experimental: "Unique layouts, playful structure, and creative exploration.",
}

const presetPreview: Record<PortfolioStylePreset, string> = {
  minimal_dev: "linear-gradient(135deg,#F4F0E8 0 42%,#101114 42% 46%,#FFFFFF 46% 100%)",
  creative_dev: "radial-gradient(circle at 72% 28%,#6D5CF6 0 16%,transparent 17%),linear-gradient(135deg,#080A0F,#31333A)",
  designer: "linear-gradient(135deg,#FFFFFF 0 36%,#EEE9DF 36% 62%,#101114 62% 100%)",
  editorial: "linear-gradient(90deg,#F4F0E8 0 58%,#FFFFFF 58% 100%)",
  experimental: "conic-gradient(from 220deg,#101114,#F4F0E8,#6D5CF6,#101114)",
}

export function PortfolioStyleConfigureCard({ file, onGenerate, onPickDifferent, busy }: PortfolioStyleConfigureCardProps) {
  const copy = messages.dossier.buildStyle
  const [preset, setPreset] = useState<PortfolioStylePreset>("minimal_dev")

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/70 p-3 shadow-sm">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{copy.fileLabel}</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB - PDF</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="ghost" size="sm" className="rounded-xl text-xs" disabled={busy} onClick={onPickDifferent}>
            {copy.changeFile}
          </Button>
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#101114] text-white shadow-[0_12px_28px_rgba(8,10,15,0.16)]">
            <FileText className="size-5" aria-hidden />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground">{copy.presetHeading}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.presetHint}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PORTFOLIO_STYLE_PRESETS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={busy}
            onClick={() => setPreset(key)}
            className={cn(
              "group relative flex min-h-[5.75rem] items-center gap-3 overflow-hidden rounded-xl border p-3 text-left text-sm transition-all",
              preset === key
                ? "border-[#101114] bg-black/[0.035] shadow-[0_18px_42px_rgba(8,10,15,0.08)]"
                : "border-black/10 bg-white/60 hover:border-black/25 hover:bg-white"
            )}
          >
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full border",
                preset === key ? "border-[#101114] bg-[#101114] text-white" : "border-black/12 bg-white"
              )}
            >
              {preset === key ? <CheckCircle2 className="size-3.5" aria-hidden /> : null}
            </span>
            <span className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-[#F4F0E8] p-1.5">
              <span className="block h-1.5 w-7 rounded-full bg-black/20" />
              <span className="mt-2 block h-1.5 w-8 rounded-full bg-black/10" />
              <span className="mt-2 block h-6 rounded" style={{ background: presetPreview[key] }} />
            </span>
            <span>
              <span className="block font-semibold text-foreground">{PORTFOLIO_STYLE_LABELS[key]}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{presetDescriptions[key]}</span>
            </span>
          </button>
        ))}
      </div>

      <Button
        type="button"
        className="mt-5 w-full gap-2 rounded-xl bg-[#101114] text-white shadow-[0_18px_42px_rgba(8,10,15,0.20)] hover:bg-[#1d2028] sm:mt-6"
        size="lg"
        disabled={busy}
        onClick={() =>
          onGenerate({
            portfolioStylePreset: preset,
            designNotes: "",
            variationSeed: Math.floor(Math.random() * 1_000_000),
          })
        }
      >
        {copy.generateCta}
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </motion.div>
  )
}
