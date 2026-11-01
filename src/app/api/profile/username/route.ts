import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { SLUG_PATTERN } from "@/lib/portfolio/published"
import { HOLD_DAYS, suggestUsernames, usernameStatus } from "@/lib/profile/usernameServer"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const NO_STORE = { "Cache-Control": "private, no-store" }

const FORMAT_MESSAGE = "Use 3-30 characters: lowercase letters, numbers, hyphens. Start with a letter or number."
const HELD_MESSAGE = `Someone used this name until recently. It stays with them for ${HOLD_DAYS} days so their old links keep working. Try another.`

async function signedIn() {
  const caller = await resolveCaller()
  if (!caller.user) return { error: apiError("unauthorized", 401) } as const
  const admin = createAdminSupabaseClient()
  if (!admin) return { error: apiError("update_failed", 503, { message: "This is not set up on this server yet." }) } as const
  return { user: caller.user, admin } as const
}

/** The link a site gets: /u/<username> when it is the owner's only site, else its own /p/<slug>. */
async function pathFor(admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>, userId: string, username: string | null, slug: string) {
  const { count } = await admin.from("published_portfolios").select("id", { count: "exact", head: true }).eq("user_id", userId)
  return { path: username && (count ?? 0) <= 1 ? `/u/${username}` : `/p/${slug}`, siteCount: count ?? 0 }
}

/**
 * Without `check`: the caller's username and how many sites they have (the name-link prompt shows only for a
 * site still on a /p/ link and an account without a username).
 * With `check`: whether that name is free for them right now, and up to three free names when it is not.
 */
export async function GET(request: Request) {
  const r = await signedIn()
  if ("error" in r) return r.error
  const params = new URL(request.url).searchParams
  const check = (params.get("check") ?? "").trim().toLowerCase().slice(0, 40)

  if (!check) {
    const [{ data: me }, { count }] = await Promise.all([
      r.admin.from("users").select("username").eq("id", r.user.id).maybeSingle(),
      r.admin.from("published_portfolios").select("id", { count: "exact", head: true }).eq("user_id", r.user.id),
    ])
    return Response.json({ username: me?.username ?? null, siteCount: count ?? 0 }, { headers: NO_STORE })
  }

  const status = await usernameStatus(r.admin, r.user.id, check)
  const suggestions = status === "available" || status === "yours" ? [] : await suggestUsernames(r.admin, r.user.id, (params.get("name") ?? "").slice(0, 120), check)
  return Response.json({ status, suggestions }, { headers: NO_STORE })
}

const bodySchema = z.object({ username: z.string().trim().toLowerCase(), slug: z.string().regex(SLUG_PATTERN).optional() })

/**
 * Sets the username. The previous one goes into username_history, so /u/<old> links redirect to the new name and
 * nobody else can take it for HOLD_DAYS. With `slug`, the reply also carries that site's link under the new name.
 */
export async function PATCH(request: Request) {
  const r = await signedIn()
  if ("error" in r) return r.error

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return apiError("invalid_body", 400)
  const { username, slug } = parsed.data

  const status = await usernameStatus(r.admin, r.user.id, username)
  if (status === "invalid") return apiError("invalid_username", 400, { message: FORMAT_MESSAGE })
  if (status === "reserved") return apiError("username_reserved", 400)
  if (status === "taken") return apiError("username_taken", 409)
  if (status === "held") return apiError("username_held", 409, { message: HELD_MESSAGE })

  const { data: me } = await r.admin.from("users").select("username").eq("id", r.user.id).maybeSingle()
  const previous = me?.username ?? null

  if (previous !== username) {
    // The name is free (or their own old one): clear any old history row for it before claiming it.
    await r.admin.from("username_history").delete().eq("username", username)
    // Users cannot write this column themselves (migration 20261102120000), so the checks above always apply.
    const { error } = await r.admin.from("users").update({ username }).eq("id", r.user.id)
    if (error) {
      // 23505 = unique_violation: someone took it between the check and the write.
      if (error.code === "23505") return apiError("username_taken", 409)
      console.error("[username] update failed:", error.message)
      return apiError("update_failed", 503, { message: "Your username did not save. Try again." })
    }
    if (previous) await r.admin.from("username_history").upsert({ username: previous, user_id: r.user.id, released_at: new Date().toISOString() })
  }

  const link = slug ? await pathFor(r.admin, r.user.id, username, slug) : null
  return Response.json({ username, previous, ...(link ?? {}) })
}
