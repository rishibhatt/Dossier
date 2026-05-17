"use client"

import { useMemo } from "react"

import { useDesignEngine } from "@/context/DesignEngineContext"
import { abstractGradientCss, getDirectionImageOverlayStyle, hashString } from "@/lib/portfolio/portfolioImageSystem"
import { cn } from "@/lib/utils"

type AbstractAiPlaceholderProps = {
  /** Stable string for gradient variation */
  seed: string
  className?: string
}

/**
 * No remote images — generative-style mesh + gradients for hero / project placeholders.
 */
export function AbstractAiPlaceholder({ seed, className }: AbstractAiPlaceholderProps) {
  const { designConfig } = useDesignEngine()
  const direction = designConfig.meta.direction
  const primary = designConfig.tokens.colors.primary
  const accent = designConfig.tokens.colors.accent
  const h = hashString(seed)
  const gradient = useMemo(
    () => abstractGradientCss(direction, primary, accent, h),
    [direction, primary, accent, h]
  )
  const overlay = useMemo(() => getDirectionImageOverlayStyle(direction, primary), [direction, primary])

  return (
    <div className={cn("relative size-full overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-0" style={{ background: gradient }} />
      <div className="de-abstract-ai-layer pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at ${20 + (h % 40)}% ${15 + (h % 30)}%, white, transparent 45%),
            radial-gradient(circle at ${70 + (h % 25)}% ${60 + (h % 20)}%, color-mix(in srgb, ${primary} 80%, transparent), transparent 50%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0" style={overlay} />
    </div>
  )
}
