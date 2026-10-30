import { z } from "zod"

import { siteConfig } from "@/config/site"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const query = z.object({ u: z.string().uuid(), t: z.string().uuid() })

/**
 * The footer link only opens a confirm page: mail scanners (Outlook Safe Links, company filters) open every
 * link in an email, so a GET must never change anything.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = new URLSearchParams({ u: url.searchParams.get("u") ?? "", t: url.searchParams.get("t") ?? "" })
  return Response.redirect(`${siteConfig.url}/unsubscribed?${params}`, 303)
}

/**
 * Turns product and offer emails off for the user whose token matches; receipts still send. Called by the
 * confirm button and by Gmail/Yahoo one-click unsubscribe (RFC 8058, body `List-Unsubscribe=One-Click`).
 */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const parsed = query.safeParse({ u: url.searchParams.get("u"), t: url.searchParams.get("t") })
  const admin = createAdminSupabaseClient()
  let ok = false
  if (parsed.success && admin) {
    const { data } = await admin.from("users").update({ email_product: false, email_offers: false }).eq("id", parsed.data.u).eq("email_token", parsed.data.t).select("id")
    ok = Boolean(data?.length)
  }
  const oneClick = (await request.text()).includes("List-Unsubscribe=One-Click")
  if (oneClick) return new Response(null, { status: ok ? 200 : 400 })
  return Response.redirect(`${siteConfig.url}/unsubscribed?${ok ? "done=1" : "error=1"}`, 303)
}
