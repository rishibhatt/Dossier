/** Answers for the one-tap "How did you hear about Dossier?" question. Must match the users.heard_from check. */
export const HEARD_FROM = [
  { id: "google", label: "Google" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "friend", label: "A friend" },
  { id: "reddit", label: "Reddit" },
  { id: "college", label: "College" },
  { id: "ai", label: "ChatGPT or AI" },
  { id: "other", label: "Other" },
] as const

export type HeardFrom = (typeof HEARD_FROM)[number]["id"]

/** Gallery review states (published_portfolios.gallery_status). null = the owner did not opt in. */
export type GalleryStatus = "pending" | "approved" | "rejected" | null
