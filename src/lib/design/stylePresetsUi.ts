import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"

export type StylePresetUi = {
  name: string
  note: string
  bg: string
  ink: string
  accent: string
}

/**
 * Plain-language names and swatches for the five starting styles.
 * The builder's style picker and the marketing demos both read this, so they cannot drift apart.
 */
export const STYLE_PRESET_UI: Record<PortfolioStylePreset, StylePresetUi> = {
  minimal_dev: { name: "Clean and simple", note: "Lots of white space. Easy to read.", bg: "#f7f5f0", ink: "#101114", accent: "#6d5cf6" },
  creative_dev: { name: "Bold and lively", note: "Strong colour and some movement.", bg: "#12141b", ink: "#f3f1ea", accent: "#9b8cff" },
  designer: { name: "Visual and balanced", note: "Work first, with room for images.", bg: "#ffffff", ink: "#17231b", accent: "#2f6b45" },
  editorial: { name: "Magazine style", note: "Large type and a calm, spacious layout.", bg: "#f2ede4", ink: "#111111", accent: "#e5412d" },
  experimental: { name: "Unusual", note: "Unexpected layouts. Not for everyone.", bg: "#e6eee4", ink: "#101114", accent: "#101114" },
}
