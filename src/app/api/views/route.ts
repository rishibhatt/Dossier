import { z } from "zod"

import { BOT_UA } from "@/lib/analytics"
import { resolveCaller } from "@/lib/api/guard"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const bodySchema = z.object({ slug: z.string().regex(/^[\w-]{4,40}$/) })

/**
 * Counts one visit to a published portfolio (the page sends it once per browser per day, after a scroll or tap).
 * The owner's own visits and bot user agents are not counted.
 * shortcut: no per-IP cap, so a determined script can inflate a count; add one via usage_events if that happens.
 */
export async function POST(request: Request) {
  if (BOT_UA.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  const admin = createAdminSupabaseClient()
  if (!parsed.success || !admin) return new Response(null, { status: 204 })

  const { data: site } = await admin.from("published_portfolios").select("user_id").eq("slug", parsed.data.slug).maybeSingle()
  if (!site) return new Response(null, { status: 204 })
  const caller = await resolveCaller()
  if (caller.user && caller.user.id === site.user_id) return new Response(null, { status: 204 })

  await admin.rpc("bump_portfolio_view", { p_slug: parsed.data.slug })
  return new Response(null, { status: 204 })
}
