import { z } from "zod"

/**
 * The link-in-bio page: one shape for the editor draft (kept in localStorage), the saved row
 * (`link_pages.page`) and the public page at /l/<username>. Pure, so the browser and the server share it.
 * No image is ever stored: the photo and favicons are https URLs the browser loads from their own hosts.
 */

export const MAX_LINKS = 12

/**
 * Five looks. Each owns its palette (like a look owns its plate); type stays Dossier's. `motion` looks run a GSAP
 * moment on top of the same markup and fall back to their still state under reduced motion.
 */
export const THEMES = {
  specimen: { label: "Specimen", motion: false, bg: "#f7f5f0", ink: "#101114", mute: "#4f5562", btn: "#fffefb", btnInk: "#101114", line: "rgba(16, 17, 20, 0.2)", flood: "#101114", floodInk: "#f7f5f0", accent: "#6d5cf6", focus: "#5847e8" },
  ink: { label: "Ink", motion: false, bg: "#0d0e12", ink: "#f3f1ea", mute: "#a3a7b3", btn: "#16171d", btnInk: "#f3f1ea", line: "rgba(243, 241, 234, 0.16)", flood: "#6d5cf6", floodInk: "#ffffff", accent: "#8b7dff", focus: "#a99cff" },
  card: { label: "Press card", motion: false, bg: "#e4dfd2", ink: "#101114", mute: "#4a4f5a", btn: "transparent", btnInk: "#101114", line: "rgba(16, 17, 20, 0.14)", flood: "#101114", floodInk: "#f7f5f0", accent: "#6d5cf6", focus: "#5847e8" },
  marquee: { label: "Marquee", motion: true, bg: "#f7f5f0", ink: "#101114", mute: "#4f5562", btn: "#101114", btnInk: "#f7f5f0", line: "#101114", flood: "#6d5cf6", floodInk: "#ffffff", accent: "#6d5cf6", focus: "#5847e8" },
  highlight: { label: "Highlight", motion: true, bg: "#0d0e12", ink: "#f3f1ea", mute: "#a3a7b3", btn: "transparent", btnInk: "#f3f1ea", line: "rgba(243, 241, 234, 0.16)", flood: "#f3f1ea", floodInk: "#101114", accent: "#7a6bff", focus: "#a99cff" },
} as const

export type ThemeId = keyof typeof THEMES
export const THEME_IDS = Object.keys(THEMES) as ThemeId[]

/**
 * `icon`: show it in the row of logos under the buttons instead of as a button (known profiles only).
 * `favicon`: an https icon URL read from the site's own tags when the link was added (websites only).
 */
export type LinkItem = { id: string; title: string; url: string; on: boolean; icon: boolean; favicon?: string }

/** `photo` on: show `photoUrl`, or the account photo when `photoUrl` is empty. */
export type LinkPage = { name: string; bio: string; theme: ThemeId; photo: boolean; photoUrl: string; links: LinkItem[] }

export const blankPage = (): LinkPage => ({ name: "", bio: "", theme: "specimen", photo: false, photoUrl: "", links: [] })

/** Known profiles: the name suggested as a title, and the key of its logo in brandIcons. */
const PLATFORMS: [RegExp, string, string][] = [
  [/(^|\.)linkedin\.com$/, "LinkedIn", "linkedin"],
  [/(^|\.)github\.com$/, "GitHub", "github"],
  [/(^|\.)gitlab\.com$/, "GitLab", "gitlab"],
  [/(^|\.)(x|twitter)\.com$/, "X", "x"],
  [/(^|\.)instagram\.com$/, "Instagram", "instagram"],
  [/(^|\.)threads\.(net|com)$/, "Threads", "threads"],
  [/(^|\.)bsky\.app$/, "Bluesky", "bluesky"],
  [/(^|\.)tiktok\.com$/, "TikTok", "tiktok"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube", "youtube"],
  [/(^|\.)(facebook\.com|fb\.com)$/, "Facebook", "facebook"],
  [/(^|\.)behance\.net$/, "Behance", "behance"],
  [/(^|\.)dribbble\.com$/, "Dribbble", "dribbble"],
  [/(^|\.)figma\.com$/, "Figma", "figma"],
  [/(^|\.)medium\.com$/, "Medium", "medium"],
  [/(^|\.)substack\.com$/, "Substack", "substack"],
  [/(^|\.)spotify\.com$/, "Spotify", "spotify"],
  [/(^|\.)soundcloud\.com$/, "SoundCloud", "soundcloud"],
  [/(^|\.)twitch\.tv$/, "Twitch", "twitch"],
  [/(^|\.)(discord\.gg|discord\.com)$/, "Discord", "discord"],
  [/(^|\.)(wa\.me|whatsapp\.com)$/, "WhatsApp", "whatsapp"],
  [/(^|\.)(t\.me|telegram\.me)$/, "Telegram", "telegram"],
  [/(^|\.)pinterest\.[a-z.]+$/, "Pinterest", "pinterest"],
  [/(^|\.)reddit\.com$/, "Reddit", "reddit"],
  [/(^|\.)snapchat\.com$/, "Snapchat", "snapchat"],
  [/(^|\.)codepen\.io$/, "CodePen", "codepen"],
  [/(^|\.)stackoverflow\.com$/, "Stack Overflow", "stackoverflow"],
  [/(^|\.)kaggle\.com$/, "Kaggle", "kaggle"],
  [/(^|\.)producthunt\.com$/, "Product Hunt", "producthunt"],
]

/**
 * What a typed link means as an href: `name@site.com` becomes mailto:, a bare host gets https://.
 * Anything else that is not http(s) or mailto (javascript:, data:...) returns null and is never rendered.
 */
export function normalizeUrl(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  if (/^[^\s@/:]+@[^\s@/]+\.[^\s@/]+$/.test(s)) return `mailto:${s}`
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`
  try {
    const u = new URL(withScheme)
    if (u.protocol === "mailto:") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.pathname) ? u.href : null
    if (u.protocol !== "https:" && u.protocol !== "http:") return null
    if (!u.hostname.includes(".") || u.username || u.password) return null
    return u.href
  } catch {
    return null
  }
}

/** An image URL safe to put in <img src>: https only (no mixed content, no data: or javascript:). */
export function safeImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const href = normalizeUrl(raw)
  return href?.startsWith("https://") ? href : null
}

export function platformOf(href: string): { name: string; key: string } | null {
  if (href.startsWith("mailto:")) return { name: "Email", key: "email" }
  try {
    const host = new URL(href).hostname.toLowerCase()
    const hit = PLATFORMS.find(([re]) => re.test(host))
    return hit ? { name: hit[1], key: hit[2] } : null
  } catch {
    return null
  }
}

/** A title for a freshly pasted link: the platform's name, else the bare host ("rishab.design"). */
export function guessTitle(href: string): string {
  const p = platformOf(href)
  if (p) return p.name
  try {
    return new URL(href).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

/** Short display form of a link: no scheme, no trailing slash. */
export const displayUrl = (href: string) => href.replace(/^(https?:\/\/(www\.)?|mailto:)/, "").replace(/\/$/, "")

/** `github.com/<name>.png` is the account's public avatar: a photo with nothing stored here. */
export function githubPhoto(page: LinkPage): string | null {
  for (const l of page.links) {
    const m = normalizeUrl(l.url)?.match(/^https:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]{1,39})\/?$/)
    if (m) return `https://github.com/${m[1]}.png`
  }
  return null
}

/** The live links a page shows, split into buttons and the logo row, each with a safe href. */
export function visibleLinks(page: LinkPage) {
  const live = page.links.flatMap((l) => {
    const href = l.on ? normalizeUrl(l.url) : null
    return href ? [{ ...l, href, title: l.title.trim() || guessTitle(href), platform: platformOf(href), favicon: safeImageUrl(l.favicon) }] : []
  })
  return { buttons: live.filter((l) => !(l.icon && l.platform)), icons: live.filter((l) => l.icon && l.platform) }
}

const linkSchema = z.object({
  id: z.string().regex(/^[\w-]{1,24}$/),
  title: z.string().trim().max(60),
  url: z.string().trim().max(500),
  on: z.boolean(),
  icon: z.boolean(),
  favicon: z.string().trim().max(500).optional(),
})

/** Request body for saving: the page and whether it is live. Links are normalized and checked after parsing. */
export const linkPageBodySchema = z.object({
  page: z.object({
    name: z.string().trim().min(1).max(60),
    bio: z.string().trim().max(160),
    // Older drafts used "paper" / "stock": anything unknown falls back to the first look.
    theme: z.enum(THEME_IDS as [ThemeId, ...ThemeId[]]).catch("specimen"),
    photo: z.boolean(),
    photoUrl: z.string().trim().max(500).catch(""),
    links: z.array(linkSchema).max(MAX_LINKS),
  }),
  published: z.boolean(),
})

/**
 * The page as stored: empty rows dropped, every URL normalized, image URLs kept only when https. Returns the
 * position of the first link that is not a usable http(s) or mailto address, so the editor can point at it.
 */
export function cleanPage(page: LinkPage): { ok: true; page: LinkPage } | { ok: false; badLink: number } {
  const links: LinkItem[] = []
  for (const [k, l] of page.links.entries()) {
    if (!l.url.trim()) continue
    const href = normalizeUrl(l.url)
    if (!href) return { ok: false, badLink: k }
    const favicon = safeImageUrl(l.favicon)
    links.push({ id: l.id, title: l.title, url: href, on: l.on, icon: l.icon, ...(favicon ? { favicon } : {}) })
  }
  return { ok: true, page: { ...page, photoUrl: safeImageUrl(page.photoUrl) ?? "", links } }
}

/** A stored row or saved draft read back defensively: anything that no longer parses shows as a blank page. */
export function readPage(raw: unknown): LinkPage {
  const parsed = linkPageBodySchema.shape.page.safeParse(raw)
  return parsed.success ? parsed.data : blankPage()
}

/** Drafts from before photoUrl and the new looks: fill what is missing so old drafts keep working. */
export function upgradeDraft(p: Partial<LinkPage> & Pick<LinkPage, "links">): LinkPage {
  return { ...blankPage(), ...p, theme: p.theme && p.theme in THEMES ? p.theme : "specimen", photoUrl: p.photoUrl ?? "" }
}
