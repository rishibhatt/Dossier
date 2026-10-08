import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { buildConfigForDirection } from "@/lib/design/templates/build"
import type { ParsedResume } from "@/lib/parseResume"
import type { DesignCanvasBackgroundType, DesignConfig, DesignDirectionId, LayoutType } from "@/types/resolvedDesignConfig"

export type { DesignDirectionId } from "@/types/resolvedDesignConfig"
export { HERO_SCALE_TIERS, motionBlock, mulberry32, professionSpecifics, seededRandom } from "@/lib/design/enginePrimitives"

/**
 * Design engine entry points. Curated templates are the single source of design: the old random
 * palette/font banks are gone. `buildDesignConfig` keeps its signature for existing callers and
 * now picks a template in the direction deterministically (seed cycles template, then palette).
 */

/** Upload style preset -> design direction. */
export function mapPresetToDesignDirection(preset: PortfolioStylePreset): DesignDirectionId {
  switch (preset) {
    case "minimal_dev":
    case "editorial":
      return "EDITORIAL_MONO"
    case "designer":
    case "experimental":
      return "ORGANIC_GRADIENT"
    case "creative_dev":
    default:
      return "LUMINOUS_DARK"
  }
}

export function buildDesignConfig(parsed: ParsedResume, direction: DesignDirectionId, variationSeed: number): DesignConfig {
  return buildConfigForDirection(parsed, direction, variationSeed)
}

export function getDesignSectionPlans(config: DesignConfig) {
  return config.sections
}

export function backgroundTypeForDirection(direction: DesignDirectionId): DesignCanvasBackgroundType {
  switch (direction) {
    case "LUMINOUS_DARK":
      return "CLEAN_DARK"
    case "BRUTALIST_GRID":
      return "BRUTALIST_RAW"
    case "LIQUID_ENTERPRISE":
      return "ENTERPRISE_GRADIENT"
    default:
      return "EDITORIAL_FLAT"
  }
}

/** Resolved layout -> shell key (stack / rail / wide in the renderer). */
export function layoutTypeToShellKey(layoutType: LayoutType): "sidebar" | "centered" | "asymmetric" {
  if (layoutType === "split-fixed") return "sidebar"
  if (layoutType === "single-column") return "centered"
  return "asymmetric"
}
