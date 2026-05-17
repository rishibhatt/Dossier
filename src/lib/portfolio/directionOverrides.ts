import { cn } from "@/lib/utils"
import { sectionHeadingClass } from "@/lib/portfolio/canvasSectionRhythm"
import type { DesignConfig, ComponentCardStyle } from "@/types/designEngine"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

/**
 * Direction-specific render flags (Part 10) — card variant wins over `config.components.card`
 * for mood-true differentiation in the canvas.
 */
export type DirectionRenderOverrides = {
  cardVariant: ComponentCardStyle
  sectionHeadingExtraClass: string
  showSectionNumbers: boolean
  showGridLines: boolean
  showGlowAccents: boolean
  showGradientAccents: boolean
  showStructuredDividers: boolean
  showOffsetShadows: boolean
}

const TABLE: Record<DesignDirectionId, DirectionRenderOverrides> = {
  EDITORIAL_MONO: {
    cardVariant: "flat",
    sectionHeadingExtraClass: "font-black leading-none tracking-tight",
    showSectionNumbers: true,
    showGridLines: false,
    showGlowAccents: false,
    showGradientAccents: false,
    showStructuredDividers: false,
    showOffsetShadows: false,
  },
  BRUTALIST_GRID: {
    cardVariant: "brutalist",
    sectionHeadingExtraClass: "font-black uppercase leading-none",
    showSectionNumbers: false,
    showGridLines: true,
    showGlowAccents: false,
    showGradientAccents: false,
    showStructuredDividers: false,
    showOffsetShadows: false,
  },
  LUMINOUS_DARK: {
    cardVariant: "glass",
    sectionHeadingExtraClass: "font-bold leading-tight",
    showSectionNumbers: false,
    showGridLines: false,
    showGlowAccents: true,
    showGradientAccents: false,
    showStructuredDividers: false,
    showOffsetShadows: false,
  },
  LIQUID_ENTERPRISE: {
    cardVariant: "solid",
    sectionHeadingExtraClass: "font-semibold leading-snug",
    showSectionNumbers: false,
    showGridLines: false,
    showGlowAccents: false,
    showGradientAccents: false,
    showStructuredDividers: true,
    showOffsetShadows: false,
  },
  ORGANIC_GRADIENT: {
    cardVariant: "glass",
    sectionHeadingExtraClass: "font-bold leading-tight",
    showSectionNumbers: false,
    showGridLines: false,
    showGlowAccents: false,
    showGradientAccents: true,
    showStructuredDividers: false,
    showOffsetShadows: false,
  },
  CHROMATIC_CHAOS: {
    cardVariant: "bordered",
    sectionHeadingExtraClass: "leading-none",
    showSectionNumbers: false,
    showGridLines: false,
    showGlowAccents: false,
    showGradientAccents: true,
    showStructuredDividers: false,
    showOffsetShadows: true,
  },
}

export function getDirectionOverrides(config: DesignConfig): DirectionRenderOverrides {
  return TABLE[config.meta.direction]
}

/** Card shell variant for portfolio sections — direction mood table (Part 10). */
export function resolvePortfolioCardVariant(config: DesignConfig): ComponentCardStyle {
  return getDirectionOverrides(config).cardVariant
}

/** Full className for static section titles (rhythm + direction modifier). */
export function sectionTitleClassName(config: DesignConfig): string {
  const extra = getDirectionOverrides(config).sectionHeadingExtraClass
  return cn(sectionHeadingClass(config.meta.direction), extra)
}
