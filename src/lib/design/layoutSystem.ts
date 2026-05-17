import type { LayoutSpec } from "@/types/design"
import type { ParsedDesignIntent } from "@/features/design-intelligence/intentParser"

/**
 * Expressive layout strategies — discourages small repetitive grids at the spec level.
 */
export function getLayoutSystem(parsed: ParsedDesignIntent): LayoutSpec {
  const k = parsed.keywords
  const hints = parsed.sectionHints

  if (k.has("timeline")) {
    return {
      strategy: "vertical-timeline",
      timeline: { alignment: "alternating", connectors: "animated-line" },
      projectsPresentation: hints.has("projects") ? "hover-reveal" : "showcase",
      asymmetryBias: "high",
    }
  }

  if (k.has("split") || k.has("editorial")) {
    return {
      strategy: "split-hero",
      hero: { minHeightVh: 88, emphasis: "typography" },
      projectsPresentation: "split-media",
      asymmetryBias: "high",
    }
  }

  if (k.has("horizontal") || k.has("gallery") || k.has("carousel")) {
    return {
      strategy: "horizontal-scroll",
      hero: { minHeightVh: 92, emphasis: "balanced" },
      projectsPresentation: "horizontal-scroll",
      asymmetryBias: "medium",
    }
  }

  if (parsed.inferredStyle === "creative" || parsed.inferredStyle === "experimental") {
    return {
      strategy: "asymmetric-split",
      hero: { minHeightVh: 95, emphasis: "media" },
      projectsPresentation: "showcase",
      asymmetryBias: "high",
    }
  }

  if (parsed.inferredStyle === "corporate") {
    return {
      strategy: "showcase",
      hero: { minHeightVh: 80, emphasis: "balanced" },
      projectsPresentation: "split-media",
      asymmetryBias: "low",
    }
  }

  // minimal / editorial default
  return {
    strategy: "hero-fullscreen",
    hero: { minHeightVh: 90, emphasis: "typography" },
    projectsPresentation: hints.has("projects") ? "hover-reveal" : "showcase",
    asymmetryBias: "medium",
  }
}
