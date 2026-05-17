import { type NextRequest, NextResponse } from "next/server"

/**
 * Temporary: allow all routes (no auth gating). Restore Supabase session checks when auth is re-enabled.
 */
export function middleware(request: NextRequest) {
  void request
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
