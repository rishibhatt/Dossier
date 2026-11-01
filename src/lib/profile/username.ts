/** Must match the `users_username_format` check constraint in the database. */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/

/** Names that would collide with routes or look official. */
const RESERVED_USERNAMES = new Set([
  "admin", "api", "app", "auth", "billing", "blog", "build", "dashboard", "dossier", "dossier-cv",
  "help", "home", "login", "logout", "p", "preview", "pricing", "privacy", "settings", "signup",
  "static", "support", "templates", "terms", "tools", "u", "www",
])

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username)
}

/** "Rishab Bhatt" -> "rishab-bhatt": lowercase, accents and symbols dropped, spaces to hyphens. Past 30 characters it
 * keeps whole words ("maya-lindqvist-featherstonehaugh" -> "maya-lindqvist"), cutting mid-word only for one long word. */
export function toUsername(raw: string): string {
  const full = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (full.length <= 30) return full
  const cut = full.slice(0, 31).lastIndexOf("-")
  return (cut >= 3 ? full.slice(0, cut) : full.slice(0, 30)).replace(/-+$/, "")
}

/** Name ideas from a full name and the name they typed, best first, valid and not reserved. */
export function usernameIdeas(fullName: string, typed: string): string[] {
  const words = toUsername(fullName).split("-").filter(Boolean)
  const first = words[0] ?? ""
  const last = words.length > 1 ? words[words.length - 1]! : ""
  const base = toUsername(typed) || words.join("-")
  const year = new Date().getFullYear()
  const raw = [
    words.join("-"),
    words.join(""),
    first && last ? `${first[0]}${last}` : "",
    first && last ? `${first}-${last[0]}` : "",
    `${base}-cv`,
    `${base}-portfolio`,
    `${base}-${year}`,
    first ? `${first}-cv` : "",
    `${base}-1`,
  ]
  return [...new Set(raw)].filter((u) => USERNAME_PATTERN.test(u) && !isReservedUsername(u) && u !== base)
}
