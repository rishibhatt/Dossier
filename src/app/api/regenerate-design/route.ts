import { z } from "zod"

import { buildDesignConfig, mapPresetToDesignDirection } from "@/lib/designEngine"
import { DEFAULT_GENERATION_CONTEXT } from "@/lib/design/generationContext"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { DESIGN_DIRECTION_IDS } from "@/lib/design/designDirectionIds"
import { inferUserType } from "@/lib/design/inferType"
import { portfolioDocumentSchema } from "@/lib/validations/portfolioDocument"
import { portfolioDocumentToParsedResume, type ParsedResume } from "@/lib/parseResume"
import type { PortfolioDocument } from "@/types/dossier"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"
import { PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"

export const runtime = "nodejs"
export const maxDuration = 60

const bodySchema = z.object({
  portfolioData: z.unknown(),
  parsedResume: z.unknown().optional(),
  designDirection: z.string().optional(),
  portfolioStylePreset: z.enum(PORTFOLIO_STYLE_PRESETS).optional(),
  designNotes: z.string().max(2000).optional(),
  variationSeed: z.number().int().min(0).max(2_000_000_000),
})

function isParsedResume(v: unknown): v is ParsedResume {
  return Boolean(v && typeof v === "object" && "signals" in (v as ParsedResume) && "name" in (v as ParsedResume))
}

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

  const docParsed = portfolioDocumentSchema.safeParse(parsed.data.portfolioData)
  if (!docParsed.success) {
    return Response.json({ error: "invalid_portfolio" }, { status: 400 })
  }

  const portfolioData = docParsed.data as PortfolioDocument
  const userType = inferUserType(portfolioData)

  const ctx: PortfolioGenerationContext = {
    portfolioStylePreset: (parsed.data.portfolioStylePreset ??
      DEFAULT_GENERATION_CONTEXT.portfolioStylePreset) as PortfolioStylePreset,
    designNotes: parsed.data.designNotes ?? DEFAULT_GENERATION_CONTEXT.designNotes,
    variationSeed: parsed.data.variationSeed,
  }

  const parsedResume = isParsedResume(parsed.data.parsedResume)
    ? parsed.data.parsedResume
    : portfolioDocumentToParsedResume(portfolioData, userType)

  const dirRaw = parsed.data.designDirection
  const directionOverride =
    dirRaw && (DESIGN_DIRECTION_IDS as readonly string[]).includes(dirRaw) ? (dirRaw as DesignDirectionId) : undefined
  const direction = directionOverride ?? mapPresetToDesignDirection(ctx.portfolioStylePreset)

  try {
    const designConfig = buildDesignConfig(parsedResume, direction, ctx.variationSeed)
    return Response.json({ designConfig })
  } catch {
    const designConfig = buildDesignConfig(parsedResume, "EDITORIAL_MONO", ctx.variationSeed)
    return Response.json({ designConfig, fallback: true })
  }
}
