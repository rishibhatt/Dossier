import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

/**
 * Stable JSON-LD node ids. The home page defines these nodes once; other pages point at them with
 * `{ "@id": SCHEMA_IDS.org }` instead of repeating the organisation inline.
 */
export const SCHEMA_IDS = {
  org: `${siteConfig.url}/#org`,
  website: `${siteConfig.url}/#website`,
  app: `${siteConfig.url}/#app`,
} as const

/** Brand facts, word for word everywhere (home schema, llms.txt), so assistants see one consistent description. */
export const BRAND = {
  alternateNames: ["Dossier Resume", "Dossier CV"],
  oneLiner: "Dossier is a free resume builder that also turns your resume into a portfolio website.",
  whatItDoes:
    "Build a resume from tested templates and download the PDF free, with no watermark. Or upload the resume you already have, and Dossier sets it as a portfolio website you can restyle and publish at a link.",
  alsoFree:
    "Dossier also has a free cover letter maker and checker that work from your resume and the job ad, with letter formats for the US and Canada, the UK and Ireland, Europe, Germany, India, the Gulf, and Australia and New Zealand.",
  audience: "Job seekers and students who want a parser-readable resume PDF and a personal website without paying for a subscription.",
} as const

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
