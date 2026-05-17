import type { DesignConfig } from "@/types/designEngine"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"
import { backgroundTypeForDirection } from "@/lib/designEngine"

export function resolveBackgroundType(config: DesignConfig): NonNullable<DesignConfig["layout"]["backgroundType"]> {
  return config.layout.backgroundType ?? backgroundTypeForDirection(config.meta.direction)
}

/** Alternating section surface — uses token CSS variables on the canvas. */
export function getSectionBackgroundCss(index: number, config: DesignConfig): string {
  if (config.layout.type === "asymmetric") {
    return "transparent"
  }
  const isAlt = index % 2 === 1
  return isAlt ? "var(--color-bg-secondary, var(--de-elevated))" : "var(--color-bg, var(--de-bg))"
}

export function getSectionSeparatorClass(direction: DesignDirectionId): string {
  switch (direction) {
    case "LUMINOUS_DARK":
      return "border-t border-white/5"
    case "EDITORIAL_MONO":
      return "border-t-2 border-[color-mix(in_oklab,var(--color-text)_85%,transparent)]"
    case "ORGANIC_GRADIENT":
      return ""
    case "BRUTALIST_GRID":
      return "border-t-4 border-[color-mix(in_oklab,var(--color-text)_90%,transparent)]"
    case "LIQUID_ENTERPRISE":
      return "border-t border-[color-mix(in_oklab,var(--color-border)_80%,transparent)]"
    case "CHROMATIC_CHAOS":
      return "border-t-2 border-[color-mix(in_oklab,var(--color-primary)_55%,transparent)]"
    default:
      return "border-t border-[var(--color-border,var(--de-border))]"
  }
}

export function sectionHeadingClass(direction: DesignDirectionId): string {
  switch (direction) {
    case "EDITORIAL_MONO":
    case "BRUTALIST_GRID":
      return "de-heading-lg de-font-display de-section-heading"
    case "CHROMATIC_CHAOS":
      return "de-heading-lg de-font-display font-black uppercase italic tracking-tight de-section-heading-chaos"
    default:
      return "de-heading-lg de-font-display de-section-heading-accent"
  }
}
