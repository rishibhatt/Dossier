import { ROUTES } from "@/lib/constants/routes"

const BASE = "https://next.invalid"

/**
 * Accept only same-site relative paths for post-login redirects.
 * Blocks open redirects such as `//evil.com`, `/\evil.com`, absolute URLs, and `/<tab>/evil.com`: the URL parser
 * deletes tabs and newlines, which would turn that last one into `//evil.com`. The path is resolved and must stay
 * on our origin; the resolved form is returned, never the raw string.
 */
export function safeNextPath(raw: string | null | undefined, fallback: string = ROUTES.dashboard): string {
  if (!raw || !raw.startsWith("/") || /[\u0000-\u001f\u007f\\]/.test(raw)) return fallback
  try {
    const url = new URL(raw, BASE)
    if (url.origin !== BASE || url.pathname.startsWith("//")) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
