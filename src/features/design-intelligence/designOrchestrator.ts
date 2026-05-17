import { mergeLayoutSignals, mapIntentToDesignSignals } from "@/features/design-intelligence/designMapper"
import { parseDesignIntent } from "@/features/design-intelligence/intentParser"
import { enhanceDesignPrompt } from "@/features/design-intelligence/promptEnhancer"
import { getColorSystem } from "@/lib/design/colorSystem"
import { getLayoutSystem } from "@/lib/design/layoutSystem"
import { getMotionSystem } from "@/lib/design/motionSystem"
import { getTypographySystem } from "@/lib/design/typographySystem"
import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"
import type { DesignSpec } from "@/types/design"

export type OrchestrationUserData = {
  /** Section being generated in JSX route */
  activeSection?: "projects" | "hero" | "about"
  /** Optional hint for how many items appear in data */
  projectCount?: number
  /** Optional curated portfolio preset label for parser enrichment */
  portfolioStylePreset?: PortfolioStylePreset
}

function buildInteractionRules(): string[] {
  return [
    "Hero (when applicable) must dominate vertically (approximately 80–100vh) with a clear typographic focal point.",
    "Each section should feel visually distinct — alternate density, alignment, or motion pattern.",
    "At least one meaningful hover or scroll reveal per section that exposes additional content.",
    "Avoid repetitive small-card grids; prefer showcase, split, horizontal scroll, or hover-reveal archetypes.",
  ]
}

function buildConstraints(): string[] {
  return [
    "Target 4–5 primary sections in the overall portfolio narrative for this generation pass.",
    "No raw fetch, hooks, or document access in generated JSX.",
    "Maintain WCAG-minded contrast: use accent sparingly for long body text.",
    "Use whitespace as a design element; do not fill every pixel with boxes.",
  ]
}

function validateDesignSpec(spec: DesignSpec): void {
  if (!spec.enrichedPrompt.trim()) {
    throw new Error("design_spec_invalid: empty enriched prompt")
  }
  if (spec.sections.length > 6) {
    spec.sections = spec.sections.slice(0, 5)
  }
  if (spec.layout.hero && spec.layout.hero.minHeightVh < 72) {
    spec.layout.hero.minHeightVh = 80
  }
}

/**
 * Main pipeline: vague prompt → structured DesignSpec (design brain, not UI paint).
 */
export function generateDesignSpec(userPrompt: string, userData: OrchestrationUserData = {}): DesignSpec {
  const fused = [
    userPrompt,
    userData.portfolioStylePreset ? `portfolio-preset-${userData.portfolioStylePreset}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const parsed = parseDesignIntent(fused)
  const signals = mapIntentToDesignSignals(parsed)
  const baseLayout = getLayoutSystem(parsed)
  const layout = mergeLayoutSignals(baseLayout, signals.layoutOverlay)

  const color = getColorSystem(parsed.inferredStyle)
  const typography = getTypographySystem(parsed.inferredStyle)
  const motion = getMotionSystem(parsed)

  const sections = Array.from(
    new Set([
      ...(userData.activeSection ? [userData.activeSection] : []),
      ...signals.defaultSectionFocus,
    ])
  ).slice(0, 5)

  const interactionRules = buildInteractionRules()
  const constraints = buildConstraints()

  const enrichedPrompt = enhanceDesignPrompt({
    rawUserPrompt: userPrompt,
    parsed,
    layout,
    color,
    typography,
    motion,
  })

  const spec: DesignSpec = {
    style: parsed.inferredStyle,
    layout,
    color,
    typography,
    motion,
    sections,
    interactionRules,
    constraints,
    enrichedPrompt,
  }

  validateDesignSpec(spec)
  return spec
}
