import "server-only"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export type GallerySite = { slug: string; name: string; role: string }

type Doc = { meta?: { title?: string }; sections?: { type?: string; data?: { name?: string; title?: string } }[] }

/** Name and role from a published payload's hero, falling back to the page title. */
function identity(payload: unknown): { name: string; role: string } {
  const doc = (payload as { document?: Doc } | null)?.document
  const hero = doc?.sections?.find((s) => s.type === "hero")?.data
  return { name: hero?.name?.trim() || doc?.meta?.title?.trim() || "Portfolio", role: hero?.title?.trim() || "" }
}

/**
 * Sites whose owners opted in to the examples gallery and an admin approved, newest first. Only the name and
 * role leave the server; the card image is the site's own share card (/og/site/<slug>).
 */
export async function listGallerySites(limit = 60): Promise<GallerySite[]> {
  const admin = createAdminSupabaseClient()
  if (!admin) return []
  const { data, error } = await admin
    .from("published_portfolios")
    .select("slug, payload")
    .eq("gallery_status", "approved")
    .order("gallery_requested_at", { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map((r) => ({ slug: r.slug, ...identity(r.payload) }))
}
