import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
import { FREE_TOOLS } from "@/features/tools/catalog"
import { ROUTES } from "@/lib/constants/routes"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    [ROUTES.home, 1],
    [ROUTES.howItWorks, 0.8],
    [ROUTES.features, 0.8],
    [ROUTES.pricing, 0.8],
    [ROUTES.tools, 0.8],
    ...FREE_TOOLS.map((t): [string, number] => [`${ROUTES.tools}/${t.slug}`, 0.7]),
    [ROUTES.faq, 0.6],
    [ROUTES.build, 0.6],
    [ROUTES.signup, 0.4],
    [ROUTES.login, 0.3],
  ]
  return pages.map(([path, priority]) => ({
    url: `${siteConfig.url}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority,
  }))
}
