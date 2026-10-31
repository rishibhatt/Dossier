import "server-only"

import type { Metadata } from "next"
import { cache } from "react"

import { siteConfig } from "@/config/site"
import { resolveEffectivePlan } from "@/lib/billing/plans"
import { USERNAME_PATTERN } from "@/lib/profile/username"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

/** Slugs are nanoid(10); the view counter accepts the same shape. */
export const SLUG_PATTERN = /^[\w-]{4,40}$/

export type PublishedRow = { slug: string; payload: unknown; user_id: string | null; indexable: boolean | null }

/**
 * `/p/<slug>`. Visitors cannot read `published_portfolios` (row level security keeps it to owners, so nobody can
 * list every site with the public key), so the one row asked for is read with the service-role client.
 */
export const loadPublishedBySlug = cache(async (slug: string): Promise<PublishedRow | null> => {
  if (!SLUG_PATTERN.test(slug)) return null
  const admin = createAdminSupabaseClient()
  if (!admin) return null
  try {
    const { data } = await admin.from("published_portfolios").select("slug, payload, user_id, indexable").eq("slug", slug).maybeSingle()
    return (data as PublishedRow | null) ?? null
  } catch {
    return null
  }
})

/**
 * `/u/<username>` shows that person's most recently updated published portfolio. Visitors cannot read the
 * `users` table (row level security), so the username is resolved with the service-role client. Only the
 * portfolio row, which is public anyway, is returned.
 */
export const loadPublishedByUsername = cache(async (username: string): Promise<PublishedRow | null> => {
  const name = username.toLowerCase()
  if (!USERNAME_PATTERN.test(name)) return null
  const admin = createAdminSupabaseClient()
  if (!admin) return null
  try {
    const { data: user } = await admin.from("users").select("id").eq("username", name).maybeSingle()
    if (!user) return null
    const { data } = await admin
      .from("published_portfolios")
      .select("slug, payload, user_id, indexable")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    return (data as PublishedRow | null) ?? null
  } catch {
    return null
  }
})

/**
 * Free plans carry "Made with Dossier"; Starter and Pro do not. The owner's plan is read with the
 * service-role client (the visitor's RLS client cannot read other users). Without that client, or
 * on any lookup failure, the plan cannot be verified and the credit shows (fail closed).
 */
export async function shouldShowCredit(userId: string | null): Promise<boolean> {
  if (!userId) return true
  const admin = createAdminSupabaseClient()
  if (!admin) return true
  try {
    const { data } = await admin.from("users").select("plan, plan_expires_at, owns_starter").eq("id", userId).maybeSingle()
    return !data || resolveEffectivePlan(data.plan, data.plan_expires_at, data.owns_starter) === "free"
  } catch {
    return true
  }
}

/**
 * The one public address of a site: `/u/<name>` when the owner has a username and this is their only site (that
 * page shows it), else `/p/<slug>`. Both URLs render the same page, so the other one points here as canonical.
 */
export const canonicalPathFor = cache(async (row: PublishedRow): Promise<string> => {
  const own = `/p/${row.slug}`
  const admin = row.user_id ? createAdminSupabaseClient() : null
  if (!admin || !row.user_id) return own
  try {
    const [{ data: user }, { count }] = await Promise.all([
      admin.from("users").select("username").eq("id", row.user_id).maybeSingle(),
      admin.from("published_portfolios").select("id", { count: "exact", head: true }).eq("user_id", row.user_id),
    ])
    return user?.username && (count ?? 0) <= 1 ? `/u/${user.username}` : own
  } catch {
    return own
  }
})

type Doc = { meta?: { title?: string; description?: string }; sections?: { type?: string; data?: { title?: string } }[] }

/**
 * Title, description, canonical and share card for a published site. Without its own `openGraph`, a page inherits
 * the root layout's card, and a shared portfolio link would preview as the Dossier home page.
 */
export async function publishedMetadata(row: PublishedRow | null): Promise<Metadata> {
  const doc = (row?.payload as { document?: Doc } | undefined)?.document
  if (!row || !doc) return { robots: { index: false, follow: false } }
  const path = await canonicalPathFor(row)
  const url = `${siteConfig.url}${path}`
  const title = doc.meta?.title?.trim() || "Portfolio"
  const role = doc.sections?.find((s) => s.type === "hero")?.data?.title?.trim()
  const description = doc.meta?.description?.trim() || (role ? `${title}, ${role}.` : `${title}'s portfolio.`)
  const image = { url: `/og/site/${row.slug}`, width: 1200, height: 630, alt: title }
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Private by default for search engines; owners opt in from the dashboard or the Share panel.
    robots: row.indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { type: "profile", url, siteName: siteConfig.name, title, description, locale: siteConfig.locale, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  }
}
