import type { LayoutSpec } from "@/types/design"

import type { ParsedDesignIntent } from "@/features/design-intelligence/intentParser"

export type DesignSignals = {
  /** Fine-grained layout tweaks merged on top of layoutSystem() */
  layoutOverlay: Partial<Pick<LayoutSpec, "projectsPresentation" | "asymmetryBias">>
  /** Short labels for spec.sections when parser hints are sparse */
  defaultSectionFocus: string[]
}

/**
 * Maps parsed keywords into concrete UI signals (composable with layoutSystem).
 */
export function mapIntentToDesignSignals(parsed: ParsedDesignIntent): DesignSignals {
  const k = parsed.keywords
  const layoutOverlay: DesignSignals["layoutOverlay"] = {}

  if (k.has("grid") && !k.has("avoid")) {
    layoutOverlay.asymmetryBias = "low"
  }
  if (k.has("asymmetric") || k.has("asymmetry") || k.has("offset")) {
    layoutOverlay.asymmetryBias = "high"
  }

  if (k.has("horizontal") || k.has("gallery") || k.has("carousel")) {
    layoutOverlay.projectsPresentation = "horizontal-scroll"
  } else if (k.has("hover") || k.has("reveal") || k.has("layer")) {
    layoutOverlay.projectsPresentation = "hover-reveal"
  } else if (k.has("split")) {
    layoutOverlay.projectsPresentation = "split-media"
  }

  const defaultSectionFocus =
    parsed.sectionHints.size > 0 ? Array.from(parsed.sectionHints).slice(0, 5) : ["hero", "projects", "about"]

  return { layoutOverlay, defaultSectionFocus }
}

export function mergeLayoutSignals(base: LayoutSpec, overlay: DesignSignals["layoutOverlay"]): LayoutSpec {
  return {
    ...base,
    ...(overlay.projectsPresentation ? { projectsPresentation: overlay.projectsPresentation } : {}),
    ...(overlay.asymmetryBias ? { asymmetryBias: overlay.asymmetryBias } : {}),
  }
}
