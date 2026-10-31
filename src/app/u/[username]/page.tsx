import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { loadPublishedByUsername, publishedMetadata, shouldShowCredit } from "@/lib/portfolio/published"

import { PublishedPortfolioClient, type PublishedPayload } from "../../p/[slug]/published-client"

type PageProps = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  return publishedMetadata(await loadPublishedByUsername(username))
}

export default async function UserPortfolioPage({ params }: PageProps) {
  const { username } = await params
  const row = await loadPublishedByUsername(username)
  const payload = row?.payload as PublishedPayload | undefined
  if (!row || !payload?.document || !payload.designConfig) notFound()

  const showCredit = await shouldShowCredit(row.user_id)
  return <PublishedPortfolioClient payload={payload} showBadge={showCredit} slug={row.slug} />
}
