import { z } from "zod"

import { consumeQuota, resolveCaller } from "@/lib/api/guard"
import { mapPresetToDesignDirection } from "@/lib/designEngine"
import { DEFAULT_GENERATION_CONTEXT } from "@/lib/design/generationContext"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { DESIGN_DIRECTION_IDS } from "@/lib/design/designDirectionIds"
import { inferUserType } from "@/lib/design/inferType"
import {
  buildConfigForDirection,
  buildConfigFromTemplate,
  getTemplate,
  getTemplateSpec,
  orderSectionsForTemplate,
  reorderSectionsByTemplate,
} from "@/lib/design/templates"
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
  /** Curated template id (see src/lib/design/templates). When set, direction/preset are ignored. */
  templateId: z.string().max(64).optional(),
  /** With templateId: also reorder the document to the template's section order and return it as `portfolioData`. */
  applyTemplateOrder: z.boolean().optional(),
})

function isParsedResume(v: unknown): v is ParsedResume {
  return Boolean(v && typeof v === "object" && "signals" in (v as ParsedResume) && "name" in (v as ParsedResume))
}

export async function POST(request: Request) {
  const caller = await resolveCaller()
  const blocked = await consumeQuota(request, caller, "regenerate")
  if (blocked) return blocked

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

  const templateId = parsed.data.templateId
  if (templateId !== undefined) {
    const spec = getTemplateSpec(templateId)
    if (!getTemplate(templateId) || !spec) {
      return Response.json({ error: "invalid_template" }, { status: 400 })
    }
    // Keep the config index-aligned with the document: either the doc's current order, or the template's order applied to both.
    const reordered = parsed.data.applyTemplateOrder
      ? reorderSectionsByTemplate(portfolioData, orderSectionsForTemplate(spec, portfolioData.sections.map((s) => s.type)))
      : portfolioData
    const designConfig = buildConfigFromTemplate(parsedResume, templateId, ctx.variationSeed, {
      sectionTypes: reordered.sections.map((s) => s.type),
    })
    return Response.json({
      designConfig,
      templateId,
      ...(parsed.data.applyTemplateOrder ? { portfolioData: reordered } : {}),
    })
  }

  const dirRaw = parsed.data.designDirection
  const directionOverride =
    dirRaw && (DESIGN_DIRECTION_IDS as readonly string[]).includes(dirRaw) ? (dirRaw as DesignDirectionId) : undefined
  const direction = directionOverride ?? mapPresetToDesignDirection(ctx.portfolioStylePreset)

  // Deterministic: the seed cycles the templates of this direction, then their palettes.
  const designConfig = buildConfigForDirection(parsedResume, direction, ctx.variationSeed, {
    sectionTypes: portfolioData.sections.map((s) => s.type),
  })
  return Response.json({ designConfig })
}
