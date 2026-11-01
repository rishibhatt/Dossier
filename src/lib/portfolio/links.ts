/** Link helpers shared by sections, nav and the static export. Pure. */

export function linkHref(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  if (/^(mailto:|tel:|https?:\/\/)/i.test(t)) return t
  if (t.includes("@") && !/\s/.test(t) && !t.includes("/")) return `mailto:${t}`
  if (/\s/.test(t)) return null
  return `https://${t}`
}

/** "https://www.linkedin.com/in/x/" -> "linkedin.com/in/x" */
export function linkText(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "")
}

const NAMED: [RegExp, string][] = [
  [/linkedin\./i, "LinkedIn"],
  [/github\./i, "GitHub"],
  [/gitlab\./i, "GitLab"],
  [/behance\./i, "Behance"],
  [/dribbble\./i, "Dribbble"],
  [/(^|[/.])(twitter|x)\.com/i, "X"],
  [/instagram\./i, "Instagram"],
  [/medium\./i, "Medium"],
  [/scholar\.google/i, "Google Scholar"],
  [/orcid\./i, "ORCID"],
  [/youtube\./i, "YouTube"],
]

/** Short human label for a link ("LinkedIn", "Website"). */
export function linkLabel(raw: string): string {
  for (const [re, name] of NAMED) if (re.test(raw)) return name
  return "Website"
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`

/* ---------- social profiles ---------- */

export type SocialPlatform = "linkedin" | "github" | "x" | "instagram" | "behance" | "dribbble" | "youtube" | "medium" | "website"

type Spec = {
  label: string
  /** Hostnames this platform owns (www. and subdomains included). */
  hosts: RegExp
  /** Canonical origin a pasted link is rewritten to. */
  origin: string
  /** Path a bare handle maps to. */
  path: (handle: string) => string
  /** Hint shown in the studio quick-add field. */
  placeholder: string
}

const SOCIAL: Record<Exclude<SocialPlatform, "website">, Spec> = {
  linkedin: { label: "LinkedIn", hosts: /(^|\.)linkedin\.com$/, origin: "https://www.linkedin.com", path: (h) => `/in/${h}`, placeholder: "linkedin.com/in/you or you" },
  github: { label: "GitHub", hosts: /(^|\.)github\.com$/, origin: "https://github.com", path: (h) => `/${h}`, placeholder: "Username or link" },
  x: { label: "X", hosts: /(^|\.)(x|twitter)\.com$/, origin: "https://x.com", path: (h) => `/${h}`, placeholder: "@handle or link" },
  instagram: { label: "Instagram", hosts: /(^|\.)instagram\.com$/, origin: "https://www.instagram.com", path: (h) => `/${h}`, placeholder: "@handle or link" },
  behance: { label: "Behance", hosts: /(^|\.)behance\.net$/, origin: "https://www.behance.net", path: (h) => `/${h}`, placeholder: "Username or link" },
  dribbble: { label: "Dribbble", hosts: /(^|\.)dribbble\.com$/, origin: "https://dribbble.com", path: (h) => `/${h}`, placeholder: "Username or link" },
  youtube: { label: "YouTube", hosts: /(^|\.)(youtube\.com|youtu\.be)$/, origin: "https://www.youtube.com", path: (h) => `/@${h}`, placeholder: "@channel or link" },
  medium: { label: "Medium", hosts: /(^|\.)medium\.com$/, origin: "https://medium.com", path: (h) => `/@${h}`, placeholder: "@handle or link" },
}

/** Platforms the studio offers as one-tap adds, in button order. */
export const QUICK_ADD_PLATFORMS: SocialPlatform[] = ["linkedin", "github", "x", "instagram", "behance", "dribbble", "youtube", "website"]

export const socialLabel = (p: SocialPlatform) => (p === "website" ? "Website" : SOCIAL[p].label)
export const socialPlaceholder = (p: SocialPlatform) => (p === "website" ? "yoursite.com" : SOCIAL[p].placeholder)

/** Hostname of an http(s) link (or bare domain), lowercased without www. Null for anything else. */
function hostOf(raw: string): string | null {
  const href = linkHref(raw)
  if (!href || !/^https?:\/\//i.test(href)) return null
  try {
    return new URL(href).hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return null
  }
}

/** Which platform a link points at; "website" for any other web address, null for mailto/tel/junk. */
export function linkPlatform(raw: string): SocialPlatform | null {
  const host = hostOf(raw)
  if (!host || !host.includes(".")) return null
  for (const [p, s] of Object.entries(SOCIAL)) if (s.hosts.test(host)) return p as SocialPlatform
  return "website"
}

export type SocialLink = { platform: SocialPlatform; label: string; href: string }

/** Web links from the Contact section as icon-row entries, in order, duplicates dropped. */
export function socialLinks(links: readonly string[]): SocialLink[] {
  const seen = new Set<string>()
  const out: SocialLink[] = []
  for (const l of links) {
    const platform = linkPlatform(l)
    const href = platform ? linkHref(l) : null
    if (!platform || !href) continue
    const key = href.toLowerCase().replace(/\/+$/, "")
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ platform, label: socialLabel(platform), href })
  }
  return out
}

const HANDLE = /^[\w.-]{1,100}$/

/**
 * Turns what someone typed into a profile URL, or null when it cannot be one.
 * "rishab" (github) -> https://github.com/rishab; "linkedin.com/in/x" -> https://www.linkedin.com/in/x.
 * A link to some other site is kept as typed (https added), so nothing pasted is silently rewritten.
 */
export function normaliseSocial(platform: SocialPlatform, input: string): string | null {
  const t = input.trim()
  if (!t || /\s/.test(t)) return null
  // "john.doe" is an Instagram handle, "instagram.com/john.doe" a link: a scheme, a slash or the platform's own domain marks a link.
  const ownDomain = platform !== "website" && SOCIAL[platform].hosts.test(t.toLowerCase().replace(/^www\./, ""))
  const looksLikeUrl = /^https?:\/\//i.test(t) || /^[\w-]+(\.[\w-]+)+\//.test(t) || ownDomain
  if (platform === "website" || looksLikeUrl) {
    const href = linkHref(t)
    if (!href || !/^https?:\/\//i.test(href)) return null
    let u: URL
    try {
      u = new URL(href)
    } catch {
      return null
    }
    if (!u.hostname.includes(".")) return null
    if (platform === "website") return href
    const spec = SOCIAL[platform]
    if (!spec.hosts.test(u.hostname.toLowerCase().replace(/^www\./, ""))) return href
    // Same profile, canonical host; tracking queries and trailing slashes dropped.
    const path = u.pathname.replace(/\/+$/, "")
    if (!path) return null
    return platform === "youtube" && /youtu\.be$/i.test(u.hostname) ? `https://youtu.be${path}` : `${spec.origin}${path}`
  }
  const handle = t.replace(/^@/, "").replace(platform === "linkedin" ? /^in\//i : /^$/, "").replace(/\/+$/, "")
  return HANDLE.test(handle) ? `${SOCIAL[platform].origin}${SOCIAL[platform].path(handle)}` : null
}
