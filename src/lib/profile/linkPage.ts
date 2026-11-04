import "server-only"

import { cache } from "react"

import { readPage, type LinkPage } from "@/features/tools/linkPage"
import { USERNAME_PATTERN } from "@/lib/profile/username"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export type PublicLinkPage = { handle: string; page: LinkPage; avatarUrl: string | null }

/** Shown at /l/sample in development only, so the page can be checked without a database row. */
const SAMPLE: PublicLinkPage = {
  handle: "sample",
  avatarUrl: null,
  page: {
    name: "Dev Raman",
    bio: "Freelance product designer in Pune. This is a sample page made with Dossier's link-in-bio tool.",
    theme: "specimen",
    photo: true,
    photoUrl: "https://github.com/github.png",
    links: [
      { id: "s1", title: "Portfolio", url: "https://dossier-cv.com/u/sample", on: true, icon: false },
      { id: "s2", title: "Case study: a checkout for 2M riders", url: "https://example.com/checkout", on: true, icon: false },
      { id: "s3", title: "Book a 20-minute call", url: "https://cal.com/sample", on: true, icon: false, favicon: "https://cal.com/favicon.ico" },
      { id: "s4", title: "Resume (PDF)", url: "https://example.com/resume.pdf", on: true, icon: false },
      { id: "s5", title: "LinkedIn", url: "https://linkedin.com/in/sample", on: true, icon: true },
      { id: "s8", title: "GitHub", url: "https://github.com/sample", on: true, icon: true },
      { id: "s9", title: "Instagram", url: "https://instagram.com/sample", on: true, icon: true },
      { id: "s6", title: "Dribbble", url: "https://dribbble.com/sample", on: true, icon: true },
      { id: "s7", title: "Email", url: "mailto:dev@example.com", on: true, icon: true },
    ],
  },
}

/**
 * `/l/<username>`: that person's published link page. Visitors cannot read `users` or `link_pages` (row level
 * security), so the one row asked for is read with the service-role client. The account photo is returned only
 * when the owner turned it on.
 */
export const loadLinkPage = cache(async (handle: string): Promise<PublicLinkPage | null> => {
  const name = handle.toLowerCase()
  if (!USERNAME_PATTERN.test(name)) return null
  if (process.env.NODE_ENV !== "production" && name === SAMPLE.handle) return SAMPLE
  const admin = createAdminSupabaseClient()
  if (!admin) return null
  try {
    const { data: user } = await admin.from("users").select("id, avatar_url").eq("username", name).maybeSingle()
    if (!user) return null
    const { data } = await admin.from("link_pages").select("page").eq("user_id", user.id).eq("published", true).maybeSingle()
    if (!data) return null
    const page = readPage(data.page)
    return { handle: name, page, avatarUrl: page.photo && !page.photoUrl ? user.avatar_url : null }
  } catch {
    return null
  }
})
