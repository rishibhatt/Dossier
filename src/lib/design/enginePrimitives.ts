import type { ParsedResume } from "@/lib/parseResume"
import type { DesignConfig, DesignMotionBlock, MotionPreset, MotionVariantJson } from "@/types/resolvedDesignConfig"

/** Deterministic building blocks shared by the template builder and legacy entry points. */

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandom(seed: number) {
  const a = Math.floor(seed) ^ 0x9e3779b9
  const b = (seed * 2654435761) >>> 0
  return mulberry32((a + b) >>> 0)
}

/** Hero display size tiers; templates pick a subset and the seed rotates through it. */
export const HERO_SCALE_TIERS = [
  "clamp(2.25rem, 5.2vw, 3.6rem)",
  "clamp(2.65rem, 6.4vw, 4.85rem)",
  "clamp(3rem, 8vw, 6rem)",
] as const

const EASE = [0.16, 1, 0.3, 1] as const

/** Serializable motion block. Rendering reads `preset` (signature) and `staggerDelay`; the rest is kept for compatibility. */
export function motionBlock(preset: MotionPreset, stagger: number, y: number): DesignMotionBlock {
  const v = (dy: number): MotionVariantJson => ({
    initial: { opacity: 0, y: dy },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [...EASE] },
  })
  return { preset, heroAnimation: v(y), cardAnimation: v(y), textAnimation: v(Math.round(y * 0.7)), transitionEase: [...EASE], staggerDelay: stagger }
}

export function professionSpecifics(parsed: ParsedResume): DesignConfig["profession_specifics"] {
  const c = parsed.signals.professionCluster
  if (c === "software")
    return {
      primaryCTA: parsed.signals.hasOpenSource ? "View GitHub" : "View projects",
      projectCardStyle: "links-tech-badges",
      socialLinks: [parsed.contact.github && "github", parsed.contact.linkedin && "linkedin"].filter(Boolean) as string[],
      metricHighlights: ["senior", "lead", "executive"].includes(parsed.signals.seniorityLevel),
    }
  if (c === "design") return { primaryCTA: "See case studies", projectCardStyle: "thumbnail", socialLinks: ["website", "linkedin"], metricHighlights: false }
  if (c === "finance") return { primaryCTA: "Get in touch", projectCardStyle: "conservative-list", socialLinks: ["linkedin"], metricHighlights: true }
  return { primaryCTA: "Get in touch", projectCardStyle: "standard", socialLinks: ["email", "linkedin"], metricHighlights: false }
}
