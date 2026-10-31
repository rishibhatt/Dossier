import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { SLUG_PATTERN } from "@/lib/portfolio/published"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ slug: string }> }

const PRIVATE = { "Cache-Control": "no-store" }

/** Signed-in owner, a well-formed slug, and the service-role client for writes. */
async function owner(ctx: Ctx) {
  const { slug } = await ctx.params
  const caller = await resolveCaller()
  if (!caller.user || !caller.supabase) return { error: apiError("unauthorized", 401, { message: "Sign in to manage your sites." }) } as const
  if (!SLUG_PATTERN.test(slug)) return { error: apiError("not_found", 404) } as const
  return { slug, user: caller.user, supabase: caller.supabase } as const
}

/** The saved site, so the editor can reopen it on any device (dashboard "Edit site"). Owner only (row level security). */
export async function GET(_request: Request, ctx: Ctx) {
  const o = await owner(ctx)
  if ("error" in o) return o.error
  const { data, error } = await o.supabase
    .from("published_portfolios")
    .select("slug, payload, indexable, updated_at")
    .eq("slug", o.slug)
    .eq("user_id", o.user.id)
    .maybeSingle()
  if (error) return apiError("load_failed", 503, { message: "Your site did not load. Try again." })
  if (!data) return apiError("not_found", 404, { message: "That site is not in your account." })
  // Same rule as /api/publish-portfolio: the /u/<name> link only for someone with a single site.
  const [{ data: profile }, { count }] = await Promise.all([
    o.supabase.from("users").select("username").eq("id", o.user.id).maybeSingle(),
    o.supabase.from("published_portfolios").select("id", { count: "exact", head: true }).eq("user_id", o.user.id),
  ])
  const path = profile?.username && (count ?? 0) <= 1 ? `/u/${profile.username}` : `/p/${data.slug}`
  return Response.json({ site: { ...data, path } }, { headers: PRIVATE })
}

const patchSchema = z.object({ indexable: z.boolean() })

/** Owner settings for a live site. Today: whether search engines may list it. */
export async function PATCH(request: Request, ctx: Ctx) {
  const o = await owner(ctx)
  if ("error" in o) return o.error
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return apiError("invalid_body", 400)
  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("unavailable", 503, { message: "This is not set up on this server yet." })
  const { data, error } = await admin
    .from("published_portfolios")
    .update({ indexable: parsed.data.indexable })
    .eq("slug", o.slug)
    .eq("user_id", o.user.id)
    .select("slug, indexable")
    .maybeSingle()
  if (error) return apiError("update_failed", 503, { message: "That did not save. Try again." })
  if (!data) return apiError("not_found", 404)
  return Response.json({ site: data }, { headers: PRIVATE })
}

/** Takes a site offline: the link stops working. The work stays in the editor on the device it was made on. */
export async function DELETE(_request: Request, ctx: Ctx) {
  const o = await owner(ctx)
  if ("error" in o) return o.error
  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("unavailable", 503, { message: "This is not set up on this server yet." })
  const { data, error } = await admin.from("published_portfolios").delete().eq("slug", o.slug).eq("user_id", o.user.id).select("slug")
  if (error) return apiError("delete_failed", 503, { message: "The site is still online. Try again." })
  if (!data?.length) return apiError("not_found", 404)
  await admin.from("portfolio_views").delete().eq("slug", o.slug)
  return new Response(null, { status: 204 })
}
