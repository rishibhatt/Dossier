import { z } from "zod"

import { apiError, consumeQuota, resolveCaller } from "@/lib/api/guard"
import { buildPortfolioExportZip } from "@/lib/export/buildPortfolioExportZip"
import { portfolioDocumentSchema, portfolioViewSchema } from "@/lib/validations/portfolioDocument"
import { designConfigSchema } from "@/lib/validations/designConfig"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export const runtime = "nodejs"

const bodySchema = z.object({
  portfolioData: z.unknown(),
  designConfig: z.unknown(),
  variationSeed: z.number().int().optional(),
  hiddenSectionIds: z.unknown().optional(),
  sectionSurfaceOverrides: z.unknown().optional(),
})

export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user) return apiError("unauthorized", 401, { message: "Sign in to export." })
  if (!caller.limits.zipExport) {
    return apiError("plan_required", 402, { message: "ZIP export needs the Starter or Pro plan.", plan: caller.plan })
  }

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
  const cfgParsed = designConfigSchema.safeParse(parsed.data.designConfig)
  if (!docParsed.success || !cfgParsed.success) {
    return Response.json({ error: "invalid_payload" }, { status: 400 })
  }

  const document = docParsed.data as PortfolioDocument
  const designConfig = cfgParsed.data as DesignConfig
  const variationSeed = parsed.data.variationSeed ?? 0

  const blocked = await consumeQuota(request, caller, "export")
  if (blocked) return blocked

  const view = portfolioViewSchema.safeParse({
    hiddenSectionIds: parsed.data.hiddenSectionIds,
    sectionSurfaceOverrides: parsed.data.sectionSurfaceOverrides,
  })

  const blob = await buildPortfolioExportZip({
    document,
    designConfig,
    variationSeed,
    hiddenSectionIds: view.success ? view.data.hiddenSectionIds : undefined,
    sectionSurfaceOverrides: view.success ? view.data.sectionSurfaceOverrides : undefined,
  })

  const buf = Buffer.from(await blob.arrayBuffer())
  const slug = document.meta.title.replace(/[^\w\d]+/g, "-").slice(0, 48) || "portfolio"

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-export.zip"`,
    },
  })
}
