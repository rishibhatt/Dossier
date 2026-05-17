import type { PortfolioStylePreset } from "@/lib/design/stylePrompts"
import type { Mode } from "@/lib/llm/types"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

export type PortfolioGenerationContext = {
  portfolioStylePreset: PortfolioStylePreset
  designNotes: string
  /** Increments on “Regenerate design” to nudge alternate layouts. */
  variationSeed: number
  /** When set, overrides style-preset → direction mapping for the resolved engine. */
  designDirection?: DesignDirectionId | null
  /** Routes multi-LLM orchestration (registry) — defaults in the pipeline. */
  llmMode?: Mode
}

export const DEFAULT_GENERATION_CONTEXT: PortfolioGenerationContext = {
  portfolioStylePreset: "minimal_dev",
  designNotes: "",
  variationSeed: 0,
}
