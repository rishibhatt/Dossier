import { z } from "zod"

import { consumeQuota, resolveCaller } from "@/lib/api/guard"
import { applyNlDesignHints } from "@/lib/design/applyNlDesignHints"
import { PORTFOLIO_SECTION_ORDER } from "@/config/portfolioSections"
import { buildConfigForDirection, buildConfigFromTemplate, getTemplate } from "@/lib/design/templates"
import { DESIGN_DIRECTION_IDS } from "@/lib/design/designDirectionIds"
import type { ParsedResume } from "@/lib/parseResume"
import type { PortfolioSectionType } from "@/types/dossier"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

export const runtime = "nodejs"

const PORTFOLIO_SECTION_TYPES = PORTFOLIO_SECTION_ORDER as unknown as [PortfolioSectionType, ...PortfolioSectionType[]]

const bodySchema = z.object({
  parsedResume: z.unknown(),
  /** Required unless templateId is given. */
  direction: z.string().optional(),
  variationSeed: z.number().int().min(0).max(2_000_000_000).optional(),
  visionNote: z.string().max(2000).optional(),
  /** Curated template id (see src/lib/design/templates). */
  templateId: z.string().max(64).optional(),
  /** Section types of the document this config pairs with (index-aligned). Defaults to the template's order. */
  sectionTypes: z.array(z.enum(PORTFOLIO_SECTION_TYPES)).max(24).optional(),
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
  if (!parsed.success || !isParsedResume(parsed.data.parsedResume)) {
    return Response.json({ error: "invalid_body" }, { status: 400 })
  }

  const seed = parsed.data.variationSeed ?? 0
  const note = parsed.data.visionNote?.trim()
  const templateId = parsed.data.templateId

  if (templateId !== undefined) {
    if (!getTemplate(templateId)) {
      return Response.json({ error: "invalid_template" }, { status: 400 })
    }
    let designConfig = buildConfigFromTemplate(parsed.data.parsedResume, templateId, seed, {
      sectionTypes: parsed.data.sectionTypes,
    })
    if (note) designConfig = applyNlDesignHints(designConfig, note)
    return Response.json({ designConfig, templateId })
  }

  const dir = parsed.data.direction ?? ""
  if (!(DESIGN_DIRECTION_IDS as readonly string[]).includes(dir)) {
    return Response.json({ error: "invalid_direction" }, { status: 400 })
  }

  // Deterministic: the seed cycles the templates of this direction, then their palettes.
  let designConfig = buildConfigForDirection(parsed.data.parsedResume, dir as DesignDirectionId, seed, {
    sectionTypes: parsed.data.sectionTypes,
  })
  if (note) {
    designConfig = applyNlDesignHints(designConfig, note)
  }
  return Response.json({ designConfig })
}
