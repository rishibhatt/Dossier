import type { CSSProperties } from "react"

import type { DesignDirectionId } from "@/types/resolvedDesignConfig"
import type { ProjectEntry } from "@/types/dossier"

export function hashString(input: string): number {
  let h = 5381
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) + h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const PROJECT_CARD_QUERIES = {
  blockchain: ["abstract", "purple", "dark"],
  ai: ["neural", "blue", "data"],
  web: ["gradient", "interface", "minimal"],
  mobile: ["app", "minimal", "gradient"],
  design: ["geometric", "color", "creative"],
  default: ["abstract", "dark", "geometric"],
} as const

export type ProjectImageCategory = keyof typeof PROJECT_CARD_QUERIES

export function inferProjectCategory(project: ProjectEntry): ProjectImageCategory {
  const blob = `${project.name} ${project.description} ${project.tech.join(" ")}`.toLowerCase()
  if (/\b(blockchain|crypto|web3|solidity|nft)\b/.test(blob)) return "blockchain"
  if (/\b(ai|ml|llm|gpt|neural|torch|tensorflow)\b/.test(blob)) return "ai"
  if (/\b(mobile|ios|android|react native|flutter)\b/.test(blob)) return "mobile"
  if (/\b(figma|brand|ui|ux|design)\b/.test(blob)) return "design"
  if (/\b(web|react|next|vue|frontend|typescript)\b/.test(blob)) return "web"
  return "default"
}

/** Deterministic picsum seed — no deprecated Unsplash source URLs. */
export function getProjectCardPicsumSeed(project: ProjectEntry, index: number, direction: DesignDirectionId): string {
  const cat = inferProjectCategory(project)
  const words = PROJECT_CARD_QUERIES[cat].join("-")
  return `dossier-${direction}-${words}-${hashString(project.name)}-${index}`.slice(0, 64)
}

export function getPicsumImageUrl(seed: string, w = 800, h = 600): string {
  const s = encodeURIComponent(seed)
  return `https://picsum.photos/seed/${s}/${w}/${h}`
}

export function abstractGradientCss(
  direction: DesignDirectionId,
  primary: string,
  accent: string,
  seed: number
): string {
  const a = primary || "#6366f1"
  const b = accent || "#06b6d4"
  const x = seed % 360
  switch (direction) {
    case "LUMINOUS_DARK":
      return `radial-gradient(ellipse 80% 60% at ${20 + (seed % 60)}% ${30 + (seed % 40)}%, color-mix(in srgb, ${a} 55%, transparent), transparent 55%),
        radial-gradient(ellipse 50% 45% at ${70 + (seed % 20)}% ${60 + (seed % 20)}%, color-mix(in srgb, ${b} 45%, transparent), transparent 50%),
        linear-gradient(145deg, #050510 0%, #0a0a1a 100%)`
    case "ORGANIC_GRADIENT":
      return `linear-gradient(${135 + (seed % 40)}deg, color-mix(in srgb, ${a} 90%, #000), color-mix(in srgb, ${b} 85%, #000), #1a0533)`
    case "EDITORIAL_MONO":
      return `linear-gradient(160deg, color-mix(in srgb, ${a} 12%, #e8e4dc), #c4b8a0 55%, #a39a88)`
    case "BRUTALIST_GRID":
      return `repeating-linear-gradient(90deg, color-mix(in srgb, ${a} 25%, #fff) 0 1px, transparent 1px 18px),
        repeating-linear-gradient(0deg, #e5e5e5 0 1px, transparent 1px 18px), #fafafa`
    case "LIQUID_ENTERPRISE":
      return `linear-gradient(135deg, #0a1628 0%, color-mix(in srgb, ${a} 35%, #1e3a5f) 100%)`
    case "CHROMATIC_CHAOS":
      return `conic-gradient(from ${x}deg, ${a}, ${b}, #ff006e, #8338ec, ${a})`
    default:
      return `linear-gradient(135deg, color-mix(in srgb, ${a} 70%, transparent), color-mix(in srgb, ${b} 70%, transparent))`
  }
}

export function heroVisualPicsumSeed(profession: string, variationSeed: number, direction: DesignDirectionId): string {
  return `dossier-hero-${direction}-${profession}-${variationSeed}`.slice(0, 64)
}

export function getDirectionImageOverlayStyle(
  direction: DesignDirectionId,
  primaryColor: string
): CSSProperties {
  const p = primaryColor || "#6366f1"
  switch (direction) {
    case "LUMINOUS_DARK":
      return {
        background: `linear-gradient(135deg, color-mix(in srgb, ${p} 35%, transparent) 0%, transparent 55%, color-mix(in srgb, #06b6d4 30%, transparent) 100%)`,
        mixBlendMode: "multiply",
      }
    case "ORGANIC_GRADIENT":
      return {
        background: `linear-gradient(135deg, color-mix(in srgb, ${p} 45%, transparent) 0%, transparent 50%)`,
        mixBlendMode: "multiply",
      }
    case "EDITORIAL_MONO":
      return { background: "rgba(0,0,0,0.22)", filter: "grayscale(100%)" }
    case "BRUTALIST_GRID":
      return { background: "rgba(0,0,0,0.15)", filter: "contrast(1.15) grayscale(25%)" }
    default:
      return { background: `color-mix(in srgb, ${p} 28%, transparent)`, mixBlendMode: "multiply" }
  }
}
