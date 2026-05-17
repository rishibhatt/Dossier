import { z } from "zod"

import { generateDesignSpec } from "@/features/design-intelligence/designOrchestrator"
import { designSpecToGenerationIntent } from "@/features/design-intelligence/designSpecAdapter"
import { getFallbackExecutable } from "@/features/jsx-engine/jsxCompiler"
import { generatePortfolioSectionJsx } from "@/features/jsx-engine/jsxGenerator"
import { PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"

export const runtime = "nodejs"
export const maxDuration = 120

const bodySchema = z.object({
  sectionType: z.enum(["projects", "hero", "about"]),
  sectionData: z.unknown(),
  userPrompt: z.string().min(1).max(2000),
  designIntentHint: z.string().max(800).optional(),
  portfolioStylePreset: z.enum(PORTFOLIO_STYLE_PRESETS).optional(),
  variationSeed: z.number().int().optional(),
})

export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "invalid_body" }, { status: 400 })
  }

  const { sectionType, sectionData, userPrompt, designIntentHint, portfolioStylePreset, variationSeed } =
    parsed.data

  const fusedUserText = [userPrompt, designIntentHint, variationSeed != null ? `variation:${variationSeed}` : ""]
    .filter(Boolean)
    .join("\n")

  const designSpec = generateDesignSpec(fusedUserText, {
    activeSection: sectionType,
    portfolioStylePreset: portfolioStylePreset as PortfolioStylePreset | undefined,
  })

  const intent = designSpecToGenerationIntent(designSpec)

  try {
    const result = await generatePortfolioSectionJsx({
      sectionType,
      sectionData,
      designSpec,
      portfolioStylePreset: portfolioStylePreset as PortfolioStylePreset | undefined,
    })
    return Response.json({
      ok: true,
      fallback: false,
      compiledExecutable: result.compiledExecutable,
      sanitizedSource: result.sanitizedSource,
      attempts: result.attempts,
      intent,
      designSpec,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown"
    const groqMissing = msg.includes("GROQ_API_KEY") || msg.includes("not configured")
    if (groqMissing) {
      return Response.json({ error: "groq_missing" }, { status: 503 })
    }
    const fallback = getFallbackExecutable(sectionType)
    return Response.json({
      ok: true,
      fallback: true,
      compiledExecutable: fallback,
      intent,
      designSpec,
      error: "generation_failed",
    })
  }
}
