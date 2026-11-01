import { revalidatePath } from "next/cache"
import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { ROUTES } from "@/lib/constants/routes"
import { SLUG_PATTERN } from "@/lib/portfolio/published"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const NO_STORE = { "Cache-Control": "private, no-store" }

async function ownedSite(slug: string | null) {
  const caller = await resolveCaller()
  if (!caller.user) return { error: apiError("unauthorized", 401) } as const
  if (!slug || !SLUG_PATTERN.test(slug)) return { error: apiError("invalid_slug", 400) } as const
  const admin = createAdminSupabaseClient()
  if (!admin) return { error: apiError("unavailable", 503) } as const
  const { data } = await admin.from("published_portfolios").select("id, gallery_status").eq("slug", slug).eq("user_id", caller.user.id).maybeSingle()
  if (!data) return { error: apiError("not_found", 404) } as const
  return { admin, site: data } as const
}

/** The owner's gallery state for one of their sites. */
export async function GET(request: Request) {
  const r = await ownedSite(new URL(request.url).searchParams.get("slug"))
  if ("error" in r) return r.error
  return Response.json({ status: r.site.gallery_status }, { headers: NO_STORE })
}

const bodySchema = z.object({ slug: z.string(), optIn: z.boolean() })

/**
 * Opt in to (or out of) the public examples gallery. Opting in queues the site for review; an admin approves it
 * in the console before it is shown. Opting out removes it at once, whatever its state.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return apiError("invalid_body", 400)
  const r = await ownedSite(parsed.data.slug)
  if ("error" in r) return r.error
  const current = r.site.gallery_status
  // Already reviewed sites keep their verdict when the owner ticks the box again.
  const status = parsed.data.optIn ? (current === "approved" || current === "rejected" ? current : "pending") : null
  const { error } = await r.admin
    .from("published_portfolios")
    .update({ gallery_status: status, gallery_requested_at: parsed.data.optIn ? new Date().toISOString() : null })
    .eq("id", r.site.id)
  if (error) return apiError("save_failed", 503)
  // An approved site that opts out leaves the public page now, not at the next hourly refresh.
  if (current === "approved" && status !== "approved") revalidatePath(ROUTES.portfolioExamples)
  return Response.json({ status }, { headers: NO_STORE })
}
