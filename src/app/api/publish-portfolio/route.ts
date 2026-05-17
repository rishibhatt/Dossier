import { nanoid } from "nanoid"
import { z } from "zod"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { designConfigSchema } from "@/lib/validations/designConfig"
import { portfolioDocumentSchema } from "@/lib/validations/portfolioDocument"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export const runtime = "nodejs"

const bodySchema = z.object({
  portfolioData: z.unknown(),
  designConfig: z.unknown(),
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
  const slug = nanoid(10)

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("published_portfolios")
      .insert({
        slug,
        payload: {
          document,
          designConfig,
        },
      })
      .select("slug")
      .single()

    if (error) {
      return Response.json({ error: "publish_failed", message: error.message }, { status: 503 })
    }

    return Response.json({ slug: data.slug, url: `/p/${data.slug}` })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    return Response.json({ error: "publish_unconfigured", message: msg }, { status: 503 })
  }
}
