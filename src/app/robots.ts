import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api/", "/auth/", "/live-preview", "/preview/"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
