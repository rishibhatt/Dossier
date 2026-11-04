import { allowRate, apiError, clientIpFromHeaders, hashIp } from "@/lib/api/guard"
import { normalizeUrl } from "@/features/tools/linkPage"
import { fetchLinkMeta } from "@/lib/linkMeta"

export const runtime = "nodejs"

/**
 * GET ?url=<website>: the site's name and icon URL, for titling and badging a link in the link-in-bio editor.
 * Open to visitors (the tool works signed out), so it is throttled per IP and answers 200 with nulls on any miss.
 */
export async function GET(request: Request) {
  const href = normalizeUrl(new URL(request.url).searchParams.get("url") ?? "")
  if (!href || href.startsWith("mailto:")) return apiError("invalid_url", 400)
  if (!(await allowRate(`ip:${hashIp(clientIpFromHeaders(request.headers))}`, "link_meta", 40, "10 minutes"))) return apiError("rate_limited", 429)
  const meta = await fetchLinkMeta(href)
  // The result is public page data: a short shared cache keeps repeat pastes cheap.
  return Response.json(meta ?? { title: null, icon: null }, { headers: { "Cache-Control": "public, max-age=3600" } })
}
