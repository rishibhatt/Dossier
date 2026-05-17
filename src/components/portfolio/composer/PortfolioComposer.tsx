"use client"

import { useMemo } from "react"

import { DesignEngineProvider } from "@/context/DesignEngineContext"
import { PortfolioDesignSurface } from "@/components/portfolio/composer/PortfolioDesignSurface"
import { usePortfolioStore } from "@/store/usePortfolioStore"

type PortfolioComposerProps = {
  standalone?: boolean
}

export function PortfolioComposer({ standalone }: PortfolioComposerProps) {
  const document = usePortfolioStore((s) => s.document)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const generationVariation = usePortfolioStore((s) => s.generationVariation)

  const surfaceKey = useMemo(() => {
    if (!designConfig) return ""
    return [
      designConfig.meta.direction,
      designConfig.meta.variationSeed,
      designConfig.layout.type,
      designConfig.layout.heroVariant,
      designConfig.tokens.colors.bg,
      designConfig.tokens.typography.displayFont,
      designConfig.motion.preset,
      ...designConfig.sections.map((s) => `${s.type}:${s.variant}`),
    ].join("|")
  }, [designConfig])

  if (!document || !designConfig) {
    return null
  }

  return (
    <DesignEngineProvider value={{ document, designConfig }}>
      <PortfolioDesignSurface
        key={surfaceKey}
        standalone={standalone}
        variationSeed={generationVariation}
      />
    </DesignEngineProvider>
  )
}
