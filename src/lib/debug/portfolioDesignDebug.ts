import type { DesignConfig } from "@/types/designEngine"
import type { DesignTokens } from "@/types/designTokens"

const PREFIX = "[Dossier:design-engine]"

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(...args)
  }
}

function devGroupCollapsed(label: string) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.groupCollapsed(label)
  }
}

function devGroupEnd() {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.groupEnd()
  }
}

function devTable(data: unknown) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.table(data)
  }
}

export function logPortfolioDesignSnapshot(input: {
  designConfig: DesignConfig
  tokens: DesignTokens
  variationSeed: number
}) {
  if (process.env.NODE_ENV !== "development") return

  const { designConfig, tokens, variationSeed } = input

  devGroupCollapsed(`${PREFIX} snapshot (seed ${variationSeed}, light)`)
  devLog("direction", designConfig.meta.direction, "layout", designConfig.layout.type, "hero", designConfig.layout.heroVariant)
  devLog("motion", designConfig.motion.preset, "fonts", designConfig.tokens.typography.displayFont)
  devTable(
    designConfig.sections.map((s) => ({
      type: s.type,
      variant: s.variant,
    }))
  )
  devLog("token colors", tokens.colors)
  devLog("motion", tokens.motion)
  devGroupEnd()
}
