import { type NextRequest, NextResponse } from "next/server"

import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware"

const PROTECTED_PREFIXES = ["/dashboard"]

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * Refreshes the Supabase session cookie on every request and gates app pages behind login.
 * API routes enforce auth themselves (see `src/lib/api/guard.ts`).
 */
export async function proxy(request: NextRequest) {
  const client = createSupabaseMiddlewareClient(request)
  const protectedPath = isProtected(request.nextUrl.pathname)

  if (!client.supabase) {
    // Supabase not configured: only block in production. Local dev keeps working without it.
    if (protectedPath && process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return client.response
  }

  const {
    data: { user },
  } = await client.supabase.auth.getUser()

  if (protectedPath && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return client.getResponse()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
