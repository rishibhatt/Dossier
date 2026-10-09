import { type NextRequest, NextResponse } from "next/server"

import { REFERRAL_CODE_PATTERN, REFERRAL_COOKIE, REFERRAL_WINDOW_DAYS } from "@/lib/credits/constants"
import { ROUTES } from "@/lib/constants/routes"
import { encodeReferralCookie, parseReferralCookie } from "@/lib/referrals/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/**
 * Invite link: /r/<code>. Remembers the code for 30 days in an httpOnly cookie, then sends the visitor
 * to the invite page. First click wins: a later link does not overwrite a still-valid cookie.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params
  const code = rawCode.trim().toLowerCase()
  const origin = request.nextUrl.origin

  if (!REFERRAL_CODE_PATTERN.test(code)) {
    return NextResponse.redirect(new URL(ROUTES.home, origin))
  }

  // Unknown codes still land on the invite page, but are not remembered.
  let known = true
  const admin = createAdminSupabaseClient()
  if (admin) {
    const { data } = await admin.from("referral_codes").select("code").eq("code", code).maybeSingle()
    known = Boolean(data)
  }

  const response = NextResponse.redirect(new URL(`${ROUTES.invite}?code=${encodeURIComponent(code)}`, origin))
  response.headers.set("Cache-Control", "no-store")

  const existing = parseReferralCookie(request.cookies.get(REFERRAL_COOKIE)?.value)
  if (known && !existing) {
    response.cookies.set(REFERRAL_COOKIE, encodeReferralCookie(code), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: REFERRAL_WINDOW_DAYS * 24 * 60 * 60,
    })
  }

  return response
}
