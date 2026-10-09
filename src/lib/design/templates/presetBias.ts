import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"

/** Upload-flow style preset -> template ids it softly favours (see DesignBrief.prefer). */
export const STYLE_PRESET_TEMPLATE_BIAS: Record<PortfolioStylePreset, string[]> = {
  minimal_dev: ["plain", "terminal", "essential"],
  creative_dev: ["nocturne", "terminal", "campaign"],
  designer: ["studio", "atelier", "independent"],
  editorial: ["atelier", "scholar", "chambers", "plain"],
  experimental: ["nocturne", "campaign", "studio"],
}
