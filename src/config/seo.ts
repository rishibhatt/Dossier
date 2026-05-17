import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

export type PageSeoInput = {
  title: string
  description: string
  path: string
  openGraph?: {
    title?: string
    description?: string
  }
  /** When false, robots noindex — useful for authed-only pages if needed */
  indexable?: boolean
}

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const { title, description, path, indexable = true, openGraph } = input
  const url = `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title: openGraph?.title ?? title,
      description: openGraph?.description ?? description,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}
