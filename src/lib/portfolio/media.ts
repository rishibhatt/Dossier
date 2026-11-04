/** Media links: which video links can be embedded, and whether an image link is usable. Pure. */

export type VideoEmbed = { provider: "youtube" | "vimeo"; src: string; poster: string | null }

const YT_ID = /^[\w-]{11}$/

function parse(raw: string): URL | null {
  const t = raw.trim()
  if (!t) return null
  try {
    return new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`)
  } catch {
    return null
  }
}

/**
 * YouTube (watch, youtu.be, shorts, embed, live) and Vimeo links become a privacy-friendly embed URL.
 * Anything else returns null and is shown as a link card instead.
 */
export function videoEmbed(raw: string): VideoEmbed | null {
  const u = parse(raw)
  if (!u) return null
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, "")
  if (host === "youtu.be" || host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const fromPath = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)?.[1]
    const id = host === "youtu.be" ? u.pathname.slice(1, 12) : (u.searchParams.get("v") ?? fromPath)
    if (!id || !YT_ID.test(id)) return null
    return { provider: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`, poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.match(/\/(?:video\/)?(\d{6,12})(?:\/|$)/)?.[1]
    if (!id) return null
    return { provider: "vimeo", src: `https://player.vimeo.com/video/${id}?dnt=1`, poster: null }
  }
  return null
}

/** An image the page can show: an https link or a small inline upload. Drive and Dropbox share pages are not images. */
export function isImageSrc(raw: string | null | undefined): raw is string {
  const t = raw?.trim()
  if (!t) return false
  if (/^data:image\//i.test(t)) return true
  return /^https:\/\/\S+$/i.test(t)
}

/** Share links that open a viewer page, not the picture itself. The studio warns and explains how to get a direct link. */
export function shareLinkHint(raw: string): string | null {
  const u = parse(raw)
  if (!u) return null
  const host = u.hostname.toLowerCase()
  if (host === "drive.google.com") return "Google Drive links open a viewer page, not the picture. Use a public image link instead, for example from Instagram, Behance or your own site."
  if (host.endsWith("dropbox.com") && !u.searchParams.has("raw")) return "Dropbox share links open a viewer page. Change the end of the link to ?raw=1 so it points at the picture."
  if (host === "photos.app.goo.gl" || host === "photos.google.com") return "Google Photos links open an album page, not the picture. Use a direct image link."
  return null
}
