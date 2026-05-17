import type { GenerationDesignIntent } from "@/features/jsx-engine/intentTransform"
import type { DesignIntelligenceStyle, DesignSpec } from "@/types/design"

const STYLE_LABELS: Record<DesignIntelligenceStyle, string> = {
  minimal: "Minimal Swiss / neo-grotesque",
  creative: "Bold creative studio",
  editorial: "Premium editorial magazine",
  experimental: "Experimental kinetic",
  corporate: "Confident corporate systems",
}

/**
 * Bridges DesignSpec → the compact intent knobs used by existing JSX system prompts.
 */
export function designSpecToGenerationIntent(spec: DesignSpec): GenerationDesignIntent {
  const motionProfile =
    spec.motion.stagger || spec.motion.type.includes("stagger")
      ? "experimental"
      : spec.motion.duration <= 0.42
        ? "subtle"
        : "expressive"

  const density = spec.layout.asymmetryBias === "high" || spec.style === "editorial" ? "airy" : "compact"

  return {
    styleLabel: STYLE_LABELS[spec.style],
    motionProfile,
    density,
  }
}
