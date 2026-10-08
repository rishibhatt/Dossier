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
  /** Path of a route-specific share image (file-based opengraph-image). Defaults to the site card. */
  image?: string
}

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const { title, description, path, indexable = true, openGraph, image: imagePath = "/opengraph-image" } = input
  const url = `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`

  // Pages that set their own `openGraph` replace the one from the file-based image, so the image is named here too.
  const image = { url: imagePath, width: 1200, height: 630, alt: openGraph?.title ?? title }

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
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: openGraph?.title ?? title,
      description: openGraph?.description ?? description,
      images: [image.url],
    },
  }
}
