/**
 * First-touch signup attribution. The proxy remembers where a visitor first came from in the `dx_src` cookie;
 * the account keeps it in `users.signup_source` when it is created (see `captureReferralAfterAuth`).
 * Pure and edge-safe: the proxy and the server both import it.
 */

export const SOURCE_COOKIE = "dx_src"
export const SOURCE_COOKIE_DAYS = 90

/** Stored as JSON in the cookie and in `users.signup_source`. Every field is optional except where and when. */
export type SignupSource = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  /** `?ref=`: the portfolio slug on "Made with Dossier" badge links. */
  ref?: string
  /** Host of the external page that linked here. Host only: full referrer URLs can carry personal data. */
  referrer?: string
  /** Ad or share click id seen on the landing URL (gclid, fbclid...), name only. */
  click?: string
  /** Path of the first page seen, no query string. */
  landing: string
  /** ISO time of that first visit. */
  at: string
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const
const CLICK_IDS: Record<string, { source: string; medium: string }> = {
  gclid: { source: "google", medium: "cpc" },
  msclkid: { source: "bing", medium: "cpc" },
  fbclid: { source: "facebook", medium: "social" },
  li_fat_id: { source: "linkedin", medium: "social" },
  ttclid: { source: "tiktok", medium: "cpc" },
}

/** Keeps printable text only, capped, so a crafted URL cannot bloat the cookie or the row. */
function clean(v: string | null | undefined, max = 100): string | undefined {
  const s = v?.replace(/[^\p{L}\p{N} ._~:/@+-]/gu, "").trim().slice(0, max)
  return s || undefined
}

const bareHost = (h: string) => h.toLowerCase().replace(/^(www|m|l|lm|admin)\./, "")

/** What this request says about where the visitor came from. */
export function sourceFromRequest(url: URL, referer: string | null, now = new Date()): SignupSource {
  const q = url.searchParams
  const src: SignupSource = { landing: clean(url.pathname, 200) ?? "/", at: now.toISOString() }
  for (const k of UTM_KEYS) {
    const v = clean(q.get(k))
    if (v) src[k] = k === "utm_source" || k === "utm_medium" ? v.toLowerCase() : v
  }
  const ref = clean(q.get("ref"), 60)
  if (ref) src.ref = ref
  const click = Object.keys(CLICK_IDS).find((k) => q.has(k))
  if (click) src.click = click
  if (referer) {
    try {
      const host = bareHost(new URL(referer).hostname)
      if (host && host !== bareHost(url.hostname)) src.referrer = clean(host, 100)
    } catch {
      // Not a URL: ignore it.
    }
  }
  return src
}

/** True when the visit carries any hint of a source (a direct visit carries none). */
export function hasSource(s: SignupSource): boolean {
  return Boolean(s.utm_source || s.referrer || s.click || s.ref)
}

/** Checks a stored value (cookie JSON or the `users.signup_source` column) and keeps known, cleaned fields only. */
export function toSignupSource(v: unknown): SignupSource | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null
  const o = v as Record<string, unknown>
  if (typeof o.landing !== "string" || typeof o.at !== "string") return null
  const out: SignupSource = { landing: clean(o.landing, 200) ?? "/", at: clean(o.at, 40) ?? "" }
  for (const k of [...UTM_KEYS, "ref", "referrer", "click"] as const) {
    const val = typeof o[k] === "string" ? clean(o[k] as string) : undefined
    if (val) out[k] = val
  }
  return out
}

export function parseSignupSource(raw: string | null | undefined): SignupSource | null {
  if (!raw) return null
  try {
    return toSignupSource(JSON.parse(raw))
  } catch {
    return null
  }
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|ecosia|baidu|naver|brave)\./
const AI = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|you\.com|phind\.com)$/
const SOCIAL: [RegExp, string][] = [
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "x"],
  [/(^|\.)(facebook\.com|fb\.com)$/, "facebook"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)reddit\.com$/, "reddit"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(^|\.)t\.me$/, "telegram"],
  [/(^|\.)news\.ycombinator\.com$/, "hackernews"],
  [/(^|\.)producthunt\.com$/, "producthunt"],
  [/(^|\.)peerlist\.io$/, "peerlist"],
]

/** One readable "source / medium" line for the admin console, e.g. "google / organic" or "invite". */
export function sourceLabel(s: SignupSource | null | undefined): string {
  if (!s) return "unknown"
  if (s.utm_source) return s.utm_medium ? `${s.utm_source} / ${s.utm_medium}` : s.utm_source
  if (s.click && CLICK_IDS[s.click]) return `${CLICK_IDS[s.click].source} / ${CLICK_IDS[s.click].medium}`
  if (s.landing.startsWith("/r/")) return "invite"
  if (s.ref) return "portfolio / badge"
  const r = s.referrer
  if (r) {
    // AI first: gemini.google.com would otherwise read as Google search.
    if (AI.test(r)) return `${r} / ai`
    const engine = r.match(SEARCH)?.[2]
    if (engine) return `${engine} / organic`
    const social = SOCIAL.find(([re]) => re.test(r))
    if (social) return `${social[1]} / social`
    return `${r} / referral`
  }
  // Someone opened a user's portfolio first, then came over to Dossier.
  if (s.landing.startsWith("/p/") || s.landing.startsWith("/u/")) return "portfolio / visit"
  return "direct"
}
