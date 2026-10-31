import { z } from "zod"

import { BOT_UA } from "@/lib/analytics"
import { allowRate, clientIpFromHeaders, hashIp, resolveCaller } from "@/lib/api/guard"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const bodySchema = z.object({ slug: z.string().regex(/^[\w-]{4,40}$/) })

/**
 * Counts one visit to a published portfolio (the page sends it once per browser per day, after a scroll or tap).
 * The owner's own visits and bot user agents are not counted, and one address counts at most once per site per day.
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

  const ip = hashIp(clientIpFromHeaders(request.headers))
  if (!(await allowRate(`ip:${ip}:${parsed.data.slug}`, "view", 1, "24 hours"))) return new Response(null, { status: 204 })
  await admin.rpc("bump_portfolio_view", { p_slug: parsed.data.slug })
  return new Response(null, { status: 204 })
}
