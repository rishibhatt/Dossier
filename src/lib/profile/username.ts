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
