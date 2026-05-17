import { z } from "zod"

import { buildPortfolioExportZip } from "@/lib/export/buildPortfolioExportZip"
import { portfolioDocumentSchema } from "@/lib/validations/portfolioDocument"
import { designConfigSchema } from "@/lib/validations/designConfig"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export const runtime = "nodejs"

const bodySchema = z.object({
  portfolioData: z.unknown(),
  designConfig: z.unknown(),
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

  const docParsed = portfolioDocumentSchema.safeParse(parsed.data.portfolioData)
  const cfgParsed = designConfigSchema.safeParse(parsed.data.designConfig)
  if (!docParsed.success || !cfgParsed.success) {
    return Response.json({ error: "invalid_payload" }, { status: 400 })
  }

  const document = docParsed.data as PortfolioDocument
  const designConfig = cfgParsed.data as DesignConfig
  const variationSeed = parsed.data.variationSeed ?? 0

  const blob = await buildPortfolioExportZip({
    document,
    designConfig,
    variationSeed,
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
