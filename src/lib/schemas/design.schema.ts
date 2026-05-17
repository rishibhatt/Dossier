import { z } from "zod"

/**
 * Optional LLM-suggested token patch (kept small — merged heuristically later).
 * Not yet wired to `DesignConfig` merge; validated for forward compatibility.
 */
export const designTokenPatchSchema = z.object({
  accentHint: z.string().optional(),
  backgroundHint: z.string().optional(),
  motionHint: z.enum(["subtle", "medium", "expressive"]).optional(),
})

export type DesignTokenPatch = z.infer<typeof designTokenPatchSchema>
