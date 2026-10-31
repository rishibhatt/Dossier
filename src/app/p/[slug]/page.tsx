import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadPublishedBySlug, publishedMetadata, shouldShowCredit } from "@/lib/portfolio/published"

import { PublishedPortfolioClient, type PublishedPayload } from "./published-client"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return publishedMetadata(await loadPublishedBySlug(slug))
}

export default async function PublishedPortfolioPage({ params }: PageProps) {
  const { slug } = await params
  const row = await loadPublishedBySlug(slug)
  const payload = row?.payload as PublishedPayload | undefined
  if (!payload?.document || !payload.designConfig) notFound()

  const showCredit = await shouldShowCredit(row?.user_id ?? null)
  return <PublishedPortfolioClient payload={payload} showBadge={showCredit} slug={slug} />
}
