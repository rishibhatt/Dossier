import { after, type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { AUTH_EVENT_COOKIE } from "@/lib/analytics"
import { clientIpFromHeaders } from "@/lib/api/guard"
import { publicOrigin } from "@/lib/auth/publicOrigin"
import { safeNextPath } from "@/lib/auth/safeNext"
import { notifyAfterAuth } from "@/lib/email/events"
import { captureReferralAfterAuth } from "@/lib/referrals/server"
import { ROUTES } from "@/lib/constants/routes"
import type { Database } from "@/types/database"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const nextPath = safeNextPath(url.searchParams.get("next"))
  const origin = publicOrigin(request)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!code || !supabaseUrl || !anonKey) {
    return NextResponse.redirect(new URL(`${ROUTES.login}?error=callback`, origin))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`${ROUTES.login}?error=callback`, origin))
  }

  // OAuth sign up and email confirmation both land here: attach a pending invite, if any.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await captureReferralAfterAuth({ user, cookies: cookieStore, ip: clientIpFromHeaders(request.headers) })
    after(() => notifyAfterAuth(user))
  }

  const response = NextResponse.redirect(new URL(nextPath, origin))
  // Google sign in and email confirmation both finish here. A password reset link also does, and is not counted.
  if (user && nextPath !== ROUTES.resetPassword) {
    const provider = user.app_metadata?.provider ?? "email"
    const isNew = Date.now() - new Date(user.created_at).getTime() < 10 * 60 * 1000
    const event = provider === "email" ? "email_confirmed" : isNew ? "sign_up" : "login"
    response.cookies.set(AUTH_EVENT_COOKIE, `${event}.${provider}`, {
      path: "/",
      maxAge: 120,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }
  return response
}
