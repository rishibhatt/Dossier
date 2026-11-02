import { siteConfig } from "@/config/site"

/**
 * The origin to send a visitor back to from a route handler. On Netlify, request.url inside a function can carry
 * the deploy permalink (<id>--dossier-cv.netlify.app) instead of the domain the visitor used, so redirects built
 * from it leave the real site. Only the site domain and its admin subdomain are trusted; anything else gets the site URL.
 */
export function publicOrigin(request: Request): string {
  const site = new URL(siteConfig.url)
  const host = (request.headers.get("x-forwarded-host") ?? new URL(request.url).host).split(",")[0].trim().toLowerCase()
  if (host === site.host || host === `admin.${site.host}`) return `${site.protocol}//${host}`
  return site.origin
}
