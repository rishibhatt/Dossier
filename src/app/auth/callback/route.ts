import { after, type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { clientIpFromHeaders } from "@/lib/api/guard"
import { safeNextPath } from "@/lib/auth/safeNext"
import { notifyAfterAuth } from "@/lib/email/events"
import { captureReferralAfterAuth } from "@/lib/referrals/server"
import { ROUTES } from "@/lib/constants/routes"
import type { Database } from "@/types/database"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const nextPath = safeNextPath(url.searchParams.get("next"))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!code || !supabaseUrl || !anonKey) {
    return NextResponse.redirect(new URL(`${ROUTES.login}?error=callback`, url.origin))
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
    return NextResponse.redirect(new URL(`${ROUTES.login}?error=callback`, url.origin))
  }

  // OAuth sign up and email confirmation both land here: attach a pending invite, if any.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await captureReferralAfterAuth({ user, cookies: cookieStore, ip: clientIpFromHeaders(request.headers) })
    after(() => notifyAfterAuth(user))
  }

  return NextResponse.redirect(new URL(nextPath, url.origin))
}
