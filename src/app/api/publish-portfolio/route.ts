import { nanoid } from "nanoid"
import { after } from "next/server"
import { z } from "zod"

import { apiError, consumeQuota, resolveCaller } from "@/lib/api/guard"
import { notifyCreditsEarned } from "@/lib/email/events"
import { qualifyReferralAfterFirstPublish } from "@/lib/referrals/server"
import { designConfigSchema } from "@/lib/validations/designConfig"
import { portfolioDocumentSchema, portfolioViewSchema } from "@/lib/validations/portfolioDocument"
import type { Json } from "@/types/database"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export const runtime = "nodejs"

/** Reject oversized snapshots (e.g. inlined base64 images) before they hit the database. */
const MAX_PAYLOAD_BYTES = 1_000_000

const bodySchema = z.object({
  portfolioData: z.unknown(),
  designConfig: z.unknown(),
  /** Optional owner view settings; invalid values are dropped, not fatal. */
  hiddenSectionIds: z.unknown().optional(),
  sectionSurfaceOverrides: z.unknown().optional(),
})

export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user || !caller.supabase) {
    return apiError("unauthorized", 401, { message: "Sign in to publish your portfolio." })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return apiError("invalid_body", 400)

  const docParsed = portfolioDocumentSchema.safeParse(parsed.data.portfolioData)
  const cfgParsed = designConfigSchema.safeParse(parsed.data.designConfig)
  if (!docParsed.success || !cfgParsed.success) return apiError("invalid_payload", 400)

  const document = docParsed.data as PortfolioDocument
  const designConfig = cfgParsed.data as DesignConfig
  const view = portfolioViewSchema.safeParse({
    hiddenSectionIds: parsed.data.hiddenSectionIds,
    sectionSurfaceOverrides: parsed.data.sectionSurfaceOverrides,
  })
  const ids = new Set(document.sections.map((s) => s.id))
  const hiddenSectionIds = view.success ? (view.data.hiddenSectionIds ?? []).filter((id) => ids.has(id)) : []
  const sectionSurfaceOverrides = view.success
    ? Object.fromEntries(Object.entries(view.data.sectionSurfaceOverrides ?? {}).filter(([id]) => ids.has(id)))
    : {}
  const payload = { document, designConfig, hiddenSectionIds, sectionSurfaceOverrides } as unknown as Json

  if (JSON.stringify(payload).length > MAX_PAYLOAD_BYTES) return apiError("payload_too_large", 413)

  const blocked = await consumeQuota(request, caller, "publish")
  if (blocked) return blocked

  const { supabase, user, limits } = caller

  // A person with a username gets a readable link (/u/name). Otherwise the random /p/ link is used.
  const { data: profile } = await supabase.from("users").select("username").eq("id", user.id).maybeSingle()
  const linkFor = (slug: string) => (profile?.username ? `/u/${profile.username}` : `/p/${slug}`)

  const { data: owned, error: ownedError } = await supabase
    .from("published_portfolios")
    .select("id, slug")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (ownedError) return apiError("publish_failed", 503, { message: ownedError.message })

  if (owned.length >= limits.portfolios) {
    // Plans with a single portfolio republish over it, so edits go live without a new link.
    if (limits.portfolios === 1 && owned[0]) {
      const { data, error } = await supabase
        .from("published_portfolios")
        .update({ payload })
        .eq("id", owned[0].id)
        .eq("user_id", user.id)
        .select("slug")
        .single()

      if (error) return apiError("publish_failed", 503, { message: error.message })
      return Response.json({ slug: data.slug, url: linkFor(data.slug), updated: true })
    }

    return apiError("portfolio_limit", 403, {
      message: "Portfolio limit reached for your plan.",
      limit: limits.portfolios,
      plan: caller.plan,
    })
  }

  const { data, error } = await supabase
    .from("published_portfolios")
    .insert({ slug: nanoid(10), payload, user_id: user.id })
    .select("slug")
    .single()

  if (error) return apiError("publish_failed", 503, { message: error.message })

  // First portfolio ever for this account: an invite that brought them here now counts. Idempotent.
  const firstPublish = owned.length === 0
  if (firstPublish) {
    await qualifyReferralAfterFirstPublish(user.id)
    after(() => notifyCreditsEarned(user.id))
  }

  return Response.json({ slug: data.slug, url: linkFor(data.slug), updated: false, firstPublish })
}
