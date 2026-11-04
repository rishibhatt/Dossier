import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

/**
 * Server only (node:dns). Reads a public web page's name and icon from its own tags (og:site_name, <title>, <link rel="icon">) so the
 * link-in-bio editor can title and badge a pasted website. Only the two strings come back; no image is fetched
 * or stored. Guarded against server-side request forgery: http(s) on default ports only, every hop's host must
 * resolve to public addresses, at most 3 redirects, 4 s and 256 KB.
 * shortcut: the address is checked and then fetched separately (DNS rebinding window); pin the resolved IP if
 * this ever runs next to anything private.
 */

const MAX_BYTES = 256 * 1024
const TIMEOUT_MS = 4000

function isPrivate(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number) as [number, number]
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224
  }
  const v6 = ip.toLowerCase()
  if (v6.startsWith("::ffff:")) return isPrivate(v6.slice(7))
  return v6 === "::" || v6 === "::1" || /^(fc|fd|fe8|fe9|fea|feb)/.test(v6)
}

export async function isPublicUrl(raw: string): Promise<boolean> {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return false
  }
  if ((u.protocol !== "https:" && u.protocol !== "http:") || u.username || u.password || (u.port && u.port !== "80" && u.port !== "443")) return false
  const host = u.hostname.replace(/^\[|\]$/g, "")
  if (isIP(host)) return !isPrivate(host)
  if (!host.includes(".") || host.endsWith(".local") || host.endsWith(".internal") || host === "localhost") return false
  try {
    const addrs = await lookup(host, { all: true })
    return addrs.length > 0 && addrs.every((a) => !isPrivate(a.address))
  } catch {
    return false
  }
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1]

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()

/** Name and icon from the page's head. Pure, so it is checked without the network. */
export function parseHead(html: string, base: string): { title: string | null; icon: string | null } {
  const end = html.search(/<\/head>/i)
  const head = end > 0 ? html.slice(0, end) : html
  const metas = head.match(/<meta\b[^>]*>/gi) ?? []
  const meta = (key: string) => {
    const tag = metas.find((m) => (attr(m, "property") ?? attr(m, "name"))?.toLowerCase() === key)
    return tag ? attr(tag, "content") : undefined
  }
  const rawTitle = meta("og:site_name") ?? head.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1] ?? meta("og:title")
  const title = rawTitle ? decode(rawTitle).slice(0, 60) || null : null

  // Prefer the biggest square icon: apple-touch-icon, then sized icons, then any icon.
  const links = (head.match(/<link\b[^>]*>/gi) ?? []).filter((l) => /\bicon\b/i.test(attr(l, "rel") ?? ""))
  const score = (l: string) => (/apple-touch-icon/i.test(attr(l, "rel") ?? "") ? 1000 : 0) + Number(attr(l, "sizes")?.match(/\d+/)?.[0] ?? 16)
  const best = links.sort((a, b) => score(b) - score(a))[0]
  let icon: string | null = null
  try {
    icon = new URL(best ? decode(attr(best, "href") ?? "") : "/favicon.ico", base).href
  } catch {
    icon = null
  }
  return { title, icon: icon?.startsWith("https://") ? icon : null }
}

export async function fetchLinkMeta(url: string): Promise<{ title: string | null; icon: string | null } | null> {
  let current = url
  for (let hop = 0; hop <= 3; hop++) {
    if (!(await isPublicUrl(current))) return null
    const res = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "DossierLinkPreview/1.0 (+https://dossier-cv.com)", Accept: "text/html" },
    }).catch(() => null)
    if (!res) return null
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location")
      if (!next) return null
      current = new URL(next, current).href
      continue
    }
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html") || !res.body) return null
    const reader = res.body.getReader()
    let html = ""
    const dec = new TextDecoder()
    while (html.length < MAX_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      html += dec.decode(value, { stream: true })
      if (/<\/head>/i.test(html)) break
    }
    reader.cancel().catch(() => {})
    return parseHead(html, current)
  }
  return null
}
