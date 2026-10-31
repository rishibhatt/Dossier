import { nanoid } from "nanoid"
import { after } from "next/server"
import { z } from "zod"

import { apiError, consumeQuota, resolveCaller } from "@/lib/api/guard"
import { notifyCreditsEarned, notifyPublished } from "@/lib/email/events"
import { SLUG_PATTERN } from "@/lib/portfolio/published"
import { qualifyReferralAfterFirstPublish } from "@/lib/referrals/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
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
  /** The site this editor was opened from or last published to. Its link stays the same when it is updated. */
  slug: z.string().regex(SLUG_PATTERN).optional(),
})

const failed = (e: { message: string }) => {
  console.error("[publish] failed:", e.message)
  return apiError("publish_failed", 503, { message: "Publishing did not work. Your work is still saved on this device. Try again." })
}

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
  // Writes go through the service role: users cannot write this table directly (see migration 20261101120000).
  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("publish_unavailable", 503, { message: "Publishing is not set up on this server yet." })

  const { data: profile } = await supabase.from("users").select("username").eq("id", user.id).maybeSingle()

  const { data: owned, error: ownedError } = await supabase
    .from("published_portfolios")
    .select("id, slug, indexable")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (ownedError) return failed(ownedError)

  // /u/<name> shows the newest site, so it is a stable link only for someone with one site. With several, each
  // keeps its own /p/ link.
  const linkFor = (slug: string) => (profile?.username && owned.length <= 1 ? `/u/${profile.username}` : `/p/${slug}`)
  const update = async (target: { id: string }) => {
    const { data, error } = await admin.from("published_portfolios").update({ payload }).eq("id", target.id).eq("user_id", user.id).select("slug, indexable").single()
    if (error) return failed(error)
    return Response.json({ slug: data.slug, url: linkFor(data.slug), updated: true, indexable: data.indexable })
  }

  // Editing a site that is already live: update that one, so its link and visit count stay. Any plan.
  const target = parsed.data.slug ? owned.find((r) => r.slug === parsed.data.slug) : undefined
  if (target) return update(target)

  if (owned.length >= limits.portfolios) {
    // Plans with a single site republish over it, so edits go live without a new link.
    if (limits.portfolios === 1 && owned[0]) return update(owned[0])

    return apiError("portfolio_limit", 403, {
      message: "Portfolio limit reached for your plan.",
      limit: limits.portfolios,
      plan: caller.plan,
    })
  }

  const { data, error } = await admin
    .from("published_portfolios")
    .insert({ slug: nanoid(10), payload, user_id: user.id })
    .select("slug, indexable")
    .single()

  if (error) return failed(error)

  // First portfolio ever for this account: an invite that brought them here now counts. Idempotent.
  const firstPublish = owned.length === 0
  if (firstPublish) {
    await qualifyReferralAfterFirstPublish(user.id)
    after(() => notifyCreditsEarned(user.id))
    after(() => notifyPublished(user.id))
  }

  return Response.json({ slug: data.slug, url: linkFor(data.slug), updated: false, firstPublish, indexable: data.indexable })
}
