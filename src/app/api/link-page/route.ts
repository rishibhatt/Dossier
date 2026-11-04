import { apiError, resolveCaller } from "@/lib/api/guard"
import { cleanPage, linkPageBodySchema, readPage } from "@/features/tools/linkPage"
import { PRIVATE_HEADERS, isJsonRequest } from "@/lib/resume/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"

export const runtime = "nodejs"

async function signedIn() {
  const caller = await resolveCaller()
  if (!caller.user) return { error: apiError("unauthorized", 401, { message: "Sign in to publish your link page." }) } as const
  const admin = createAdminSupabaseClient()
  if (!admin) return { error: apiError("not_configured", 503, { message: "Publishing is not set up on this server yet." }) } as const
  return { user: caller.user, admin } as const
}

/**
 * The caller's username, account photo and saved link page (null when they have not published one yet).
 * Signed out is an ordinary answer here, not an error: the free tool asks on every visit.
 */
export async function GET() {
  const r = await signedIn()
  if (r.error) return r.error.status === 401 ? Response.json({ signedIn: false }, { headers: PRIVATE_HEADERS }) : r.error
  const [{ data: me }, { data: row, error }] = await Promise.all([
    r.admin.from("users").select("username, avatar_url").eq("id", r.user.id).maybeSingle(),
    r.admin.from("link_pages").select("page, published").eq("user_id", r.user.id).maybeSingle(),
  ])
  if (error) return apiError("load_failed", 503, { message: "Your saved page did not load. Your draft on this device is still here." })
  return Response.json(
    { signedIn: true, username: me?.username ?? null, avatarUrl: me?.avatar_url ?? null, page: row ? readPage(row.page) : null, published: row?.published ?? false },
    { headers: PRIVATE_HEADERS }
  )
}

/**
 * Saves the page and whether it is live. Written with the service role (users cannot write the table directly),
 * so every link has passed the http(s)/mailto check before it can reach a visitor.
 */
export async function PUT(request: Request) {
  const r = await signedIn()
  if ("error" in r) return r.error
  if (!isJsonRequest(request)) return apiError("unsupported_media_type", 415)
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const parsed = linkPageBodySchema.safeParse(json)
  if (!parsed.success) return apiError("invalid_body", 400, { message: "Add your name, then try again." })
  const clean = cleanPage(parsed.data.page)
  if (!clean.ok) return apiError("invalid_link", 400, { index: clean.badLink, message: "One link is not a web address or email. Fix it or remove it." })

  const { data: me } = await r.admin.from("users").select("username").eq("id", r.user.id).maybeSingle()
  if (!me?.username) return apiError("username_required", 409, { message: "Pick a username first. It becomes your link." })

  const { error } = await r.admin
    .from("link_pages")
    .upsert({ user_id: r.user.id, page: clean.page as unknown as Json, published: parsed.data.published })
  if (error) {
    console.error("[link-page] save failed:", error.message)
    return apiError("save_failed", 503, { message: "Your page did not save. Try again." })
  }
  return Response.json({ path: `/l/${me.username}`, published: parsed.data.published, page: clean.page }, { headers: PRIVATE_HEADERS })
}
