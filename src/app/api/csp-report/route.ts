import { allowRate, clientIpFromHeaders, hashIp } from "@/lib/api/guard"

export const runtime = "nodejs"

/** Keep only the fields that say what was blocked and where, cut short. Reports are untrusted input. */
function summarize(r: Record<string, unknown>) {
  const pick = (k: string) => (typeof r[k] === "string" ? (r[k] as string).slice(0, 200) : undefined)
  return {
    page: pick("document-uri") ?? pick("documentURL"),
    directive: pick("effective-directive") ?? pick("effectiveDirective") ?? pick("violated-directive"),
    blocked: pick("blocked-uri") ?? pick("blockedURL"),
    source: pick("source-file") ?? pick("sourceFile"),
  }
}

/**
 * Content Security Policy violation reports (next.config.ts). Both formats: `report-uri` posts
 * `{"csp-report": {...}}`, the Reporting API posts an array of `{type, body}`. Logged, never stored.
 */
export async function POST(request: Request) {
  const ip = hashIp(clientIpFromHeaders(request.headers))
  if (!(await allowRate(`ip:${ip}`, "csp", 30, "1 hour"))) return new Response(null, { status: 204 })
  const text = (await request.text().catch(() => "")).slice(0, 20_000)
  try {
    const json = JSON.parse(text) as unknown
    const reports = Array.isArray(json)
      ? json.filter((x) => x?.type === "csp-violation").map((x) => x.body as Record<string, unknown>)
      : [((json as Record<string, unknown>)?.["csp-report"] ?? {}) as Record<string, unknown>]
    for (const r of reports.slice(0, 10)) console.warn("[csp]", JSON.stringify(summarize(r ?? {})))
  } catch {
    /* not JSON: ignore */
  }
  return new Response(null, { status: 204 })
}
