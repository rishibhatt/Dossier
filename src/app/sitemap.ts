import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { POSTS } from "@/content/blog/posts"
import { exampleEntries, EXAMPLES_UPDATED } from "@/content/resume/examples"
import { TEMPLATE_PAGES, TEMPLATES_UPDATED } from "@/content/resume/templates"
import { ROLES } from "@/content/roles"
import { FREE_TOOLS } from "@/features/tools/catalog"
import { ROUTES } from "@/lib/constants/routes"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

/** Rebuilt hourly, so a portfolio switched to "Show in Google" is listed without a deploy. */
export const revalidate = 3600

/** Bump when the static pages change in a way worth recrawling. Real dates beat a fresh timestamp on every build. */
const SITE_UPDATED = "2026-10-20"

type Entry = { path: string; priority: number; updated?: string }

function buildEntries(): Entry[] {
  return [
    { path: ROUTES.home, priority: 1 },
    { path: ROUTES.howItWorks, priority: 0.8 },
    { path: ROUTES.features, priority: 0.8 },
    { path: ROUTES.pricing, priority: 0.8 },
    { path: ROUTES.tools, priority: 0.8 },
    ...FREE_TOOLS.map((t) => ({ path: `${ROUTES.tools}/${t.slug}`, priority: ["ats-checker", "resume-summary-generator", "resume-bullet-point-generator"].includes(t.slug) ? 0.9 : 0.7 })),
    { path: ROUTES.blog, priority: 0.8 },
    ...POSTS.map((p) => ({ path: `${ROUTES.blog}/${p.slug}`, priority: 0.7, updated: p.updated ?? p.published })),
    { path: ROUTES.looks, priority: 0.7 },
    { path: ROUTES.resume, priority: 0.9, updated: TEMPLATES_UPDATED },
    { path: ROUTES.resumeTemplates, priority: 0.8, updated: TEMPLATES_UPDATED },
    ...TEMPLATE_PAGES.map((t) => ({ path: `${ROUTES.resumeTemplates}/${t.slug}`, priority: 0.7, updated: TEMPLATES_UPDATED })),
    { path: ROUTES.resumeExamples, priority: 0.7, updated: EXAMPLES_UPDATED },
    ...exampleEntries().map((e) => ({ path: `${ROUTES.resumeExamples}/${e.slug}`, priority: 0.6, updated: EXAMPLES_UPDATED })),
    { path: ROUTES.resumeKeywords, priority: 0.7 },
    ...ROLES.map((r) => ({ path: `${ROUTES.resumeKeywords}/${r.slug}`, priority: 0.6 })),
    { path: ROUTES.faq, priority: 0.6 },
    { path: "/contact", priority: 0.5 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/refund-policy", priority: 0.3 },
    { path: ROUTES.signup, priority: 0.5 },

  ]
}

/** Portfolios whose owners chose "Show in Google", at their canonical address (see canonicalPathFor). */
async function portfolioEntries(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminSupabaseClient()
  if (!admin) return []
  try {
    const { data: listed } = await admin.from("published_portfolios").select("slug, user_id, updated_at").eq("indexable", true).limit(5000)
    const owners = [...new Set((listed ?? []).map((r) => r.user_id).filter((id): id is string => Boolean(id)))]
    if (!owners.length) return []
    const [{ data: users }, { data: all }] = await Promise.all([
      admin.from("users").select("id, username").in("id", owners),
      admin.from("published_portfolios").select("user_id").in("user_id", owners),
    ])
    const sites = new Map<string, number>()
    for (const r of all ?? []) if (r.user_id) sites.set(r.user_id, (sites.get(r.user_id) ?? 0) + 1)
    const names = new Map((users ?? []).map((u) => [u.id, u.username]))
    return (listed ?? []).map((r) => {
      const name = r.user_id ? names.get(r.user_id) : null
      const path = name && sites.get(r.user_id!) === 1 ? `/u/${name}` : `/p/${r.slug}`
      return { url: `${siteConfig.url}${path}`, lastModified: new Date(r.updated_at), changeFrequency: "monthly" as const, priority: 0.4 }
    })
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = buildEntries().map((e) => ({
    url: `${siteConfig.url}${e.path === "/" ? "" : e.path}`,
    lastModified: new Date(`${e.updated ?? SITE_UPDATED}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: e.priority,
  }))
  return [...pages, ...(await portfolioEntries())]
}
