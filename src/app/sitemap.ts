import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { POSTS } from "@/content/blog/posts"
import { ROLES } from "@/content/roles"
import { FREE_TOOLS } from "@/features/tools/catalog"
import { ROUTES } from "@/lib/constants/routes"

/** Bump when the static pages change in a way worth recrawling. Real dates beat a fresh timestamp on every build. */
const SITE_UPDATED = "2026-10-09"

type Entry = { path: string; priority: number; updated?: string }

function buildEntries(): Entry[] {
  return [
    { path: ROUTES.home, priority: 1 },
    { path: ROUTES.howItWorks, priority: 0.8 },
    { path: ROUTES.features, priority: 0.8 },
    { path: ROUTES.pricing, priority: 0.8 },
    { path: ROUTES.tools, priority: 0.8 },
    ...FREE_TOOLS.map((t) => ({ path: `${ROUTES.tools}/${t.slug}`, priority: t.slug === "ats-checker" ? 0.9 : 0.7 })),
    { path: ROUTES.blog, priority: 0.8 },
    ...POSTS.map((p) => ({ path: `${ROUTES.blog}/${p.slug}`, priority: 0.7, updated: p.updated ?? p.published })),
    { path: ROUTES.resumeKeywords, priority: 0.7 },
    ...ROLES.map((r) => ({ path: `${ROUTES.resumeKeywords}/${r.slug}`, priority: 0.6 })),
    { path: ROUTES.faq, priority: 0.6 },
    { path: "/contact", priority: 0.5 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: ROUTES.signup, priority: 0.5 },

  ]
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildEntries().map((e) => ({
    url: `${siteConfig.url}${e.path === "/" ? "" : e.path}`,
    lastModified: new Date(`${e.updated ?? SITE_UPDATED}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: e.priority,
  }))
}
