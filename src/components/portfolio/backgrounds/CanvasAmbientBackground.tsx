"use client"

import { useMemo } from "react"

import { NoiseBg } from "@/components/ui/NoiseBg"
import { cn } from "@/lib/utils"
import { resolveBackgroundType } from "@/lib/portfolio/canvasSectionRhythm"
import type { DesignConfig } from "@/types/designEngine"

type Props = {
  designConfig: DesignConfig
  className?: string
}

/**
 * Direction-driven ambient canvas — supporting visuals only (no dominant patterns).
 */
export function CanvasAmbientBackground({ designConfig, className }: Props) {
  const bg = resolveBackgroundType(designConfig)
  const primary = "var(--color-primary, var(--dt-accent))"
  const bgVar = "var(--color-bg, var(--dt-bg))"
  const bg2 = "var(--color-bg-secondary, var(--dt-elevated))"

  const layers = useMemo(() => {
    switch (bg) {
      case "CLEAN_DARK":
        return (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: bgVar,
            }}
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 80% 55% at 50% -8%, color-mix(in srgb, ${primary} 14%, transparent), transparent 72%)`,
              }}
            />
          </div>
        )
      case "GRADIENT_MESH":
        return (
          <div
            className="de-mesh-drift pointer-events-none absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(ellipse 55% 45% at 18% 42%, color-mix(in srgb, ${primary} 22%, transparent) 0%, transparent 52%),
                radial-gradient(ellipse 50% 40% at 82% 18%, color-mix(in srgb, var(--color-accent, var(--dt-accent-soft)) 18%, transparent) 0%, transparent 50%),
                radial-gradient(ellipse 45% 38% at 52% 88%, color-mix(in srgb, ${primary} 14%, transparent) 0%, transparent 48%),
                ${bgVar}
              `,
            }}
            aria-hidden
          />
        )
      case "EDITORIAL_FLAT":
        return (
          <div className="pointer-events-none absolute inset-0 z-0" style={{ background: bgVar }} aria-hidden />
        )
      case "BRUTALIST_RAW":
        return (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundColor: bgVar,
              backgroundImage: `linear-gradient(var(--color-border, var(--de-border)) 1px, transparent 1px), linear-gradient(90deg, var(--color-border, var(--de-border)) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
              opacity: 0.08,
            }}
            aria-hidden
          />
        )
      case "ENTERPRISE_GRADIENT":
        return (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: `linear-gradient(135deg, ${bgVar} 0%, ${bg2} 100%)`,
            }}
            aria-hidden
          />
        )
      default:
        return null
    }
  }, [bg, primary, bgVar, bg2])

  /** Film grain only on mesh canvases — CLEAN_DARK stays pattern-free. */
  const showNoise = bg === "GRADIENT_MESH"

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)} aria-hidden>
      {layers}
      {showNoise ? <NoiseBg opacity={0.022} className="absolute inset-0 z-[1]" /> : null}
    </div>
  )
}
