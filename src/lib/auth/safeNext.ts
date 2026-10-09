import { ROUTES } from "@/lib/constants/routes"

/**
 * Accept only same-site relative paths for post-login redirects.
 * Blocks open redirects such as `//evil.com`, `/\evil.com` and absolute URLs.
 */
export function safeNextPath(raw: string | null | undefined, fallback: string = ROUTES.dashboard): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback
  return raw
}
