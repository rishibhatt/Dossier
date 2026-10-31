import { type NextRequest, NextResponse } from "next/server"

import { safeNextPath } from "@/lib/auth/safeNext"
import { ROUTES } from "@/lib/constants/routes"
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware"

const PROTECTED_PREFIXES = ["/dashboard", "/build"]
const PUBLIC_PREFIXES = ["/api/csp-report", "/blog", "/resume-keywords", "/tools", "/og", "/p", "/u", "/faq", "/features", "/how-it-works", "/pricing", "/contact", "/privacy", "/terms", "/refund-policy"]

// Generated icons, manifest and social images: no extension in the URL, so the matcher below lets them in.
const PUBLIC_FILES = new Set(["/icon", "/apple-icon", "/manifest.webmanifest", "/opengraph-image", "/twitter-image", "/robots.txt", "/sitemap.xml"])

const startsWithPath = (pathname: string, p: string) => pathname === p || pathname.startsWith(`${p}/`)
const isProtected = (pathname: string) => PROTECTED_PREFIXES.some((p) => startsWithPath(pathname, p))
// The home page reads the session in the browser (the header), so it skips the server check too.
const isPublic = (pathname: string) =>
  pathname === "/" || PUBLIC_FILES.has(pathname) || PUBLIC_PREFIXES.some((p) => startsWithPath(pathname, p))

/** The host the request URL was built from. Not `x-forwarded-host`: a client can send that header itself. */
function hostOf(request: NextRequest) {
  return request.nextUrl.hostname.toLowerCase()
}

/**
 * One deployment serves three kinds of host:
 *  - the real domain (dossier-cv.com): the public site. /admin is hidden here (404) in production.
 *  - the admin subdomain (admin.dossier-cv.com): only /admin pages, behind login and an authenticator code.
 *  - the default dossier-cv.netlify.app address: redirected to the real domain, so there is one canonical site.
 * Then it refreshes the Supabase session cookie and gates app pages behind login. API routes check auth themselves.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = hostOf(request)
  const production = process.env.NODE_ENV === "production"

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (production && siteUrl && /^https:\/\//.test(siteUrl)) {
    const canonicalHost = new URL(siteUrl).hostname
    // Default Netlify address -> real domain. Deploy previews and branch deploys contain "--" and stay reachable.
    if (host.endsWith(".netlify.app") && !host.includes("--") && host !== canonicalHost) {
      return NextResponse.redirect(new URL(`${pathname}${search}`, siteUrl), 301)
    }
  }

  const isAdminHost = host.startsWith("admin.")
  const isAdminPath = startsWithPath(pathname, "/admin")

  if (isAdminHost && !isAdminPath) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }
  if (isAdminPath && !isAdminHost && production) {
    return new NextResponse("Not found", { status: 404 })
  }

  // Public, cacheable content never needs a session. Skipping the Supabase round trip keeps these pages fast.
  if (isPublic(pathname)) return NextResponse.next()

  const client = createSupabaseMiddlewareClient(request)
  const protectedPath = isProtected(pathname)

  if (!client.supabase) {
    // Supabase not configured: only block in production. Local dev keeps working without it.
    if (protectedPath && production) return NextResponse.redirect(new URL("/login", request.url))
    return client.response
  }

  const {
    data: { user },
  } = await client.supabase.auth.getUser()

  if (protectedPath && !user) {
    const entry = new URL(startsWithPath(pathname, "/build") ? "/signup" : "/login", request.url)
    entry.searchParams.set("next", pathname)
    return NextResponse.redirect(entry)
  }

  // Signed in already: the login and signup forms have nothing to do. Go where the visitor was headed, to
  // billing if they came from a paid plan button, else the dashboard. Refreshed session cookies go along.
  if (user && (pathname === ROUTES.login || pathname === ROUTES.signup)) {
    const plan = request.nextUrl.searchParams.get("plan")
    const fallback = plan === "starter" || plan === "pro" ? ROUTES.billing : ROUTES.dashboard
    const redirect = NextResponse.redirect(new URL(safeNextPath(request.nextUrl.searchParams.get("next"), fallback), request.url))
    for (const c of client.getResponse().cookies.getAll()) redirect.cookies.set(c)
    return redirect
  }

  const res = client.getResponse()
  if (isAdminPath) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
    res.headers.set("Cache-Control", "no-store")
  }
  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
