import { z } from "zod"

/** High-level creative / IA intent inferred from résumé text. */
export const intentProfileSchema = z.object({
  toneKeywords: z.array(z.string()).max(12),
  seniority: z.enum(["junior", "mid", "senior", "lead", "executive"]).optional(),
  /** Short phrases describing voice (e.g. "precise", "warm", "bold"). */
  personality: z.array(z.string()).max(10).optional(),
  /** One-line positioning for layout + copy rhythm. */
  positioningLine: z.string().max(220).optional(),
})

export type IntentProfile = z.infer<typeof intentProfileSchema>
