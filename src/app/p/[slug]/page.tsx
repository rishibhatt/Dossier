import { notFound } from "next/navigation"

import { createServerSupabaseClient } from "@/lib/supabase/server"

import { PublishedPortfolioClient, type PublishedPayload } from "./published-client"

type PageProps = { params: Promise<{ slug: string }> }

export default async function PublishedPortfolioPage({ params }: PageProps) {
  const { slug } = await params

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("published_portfolios").select("payload").eq("slug", slug).single()

    if (error || !data?.payload) {
      notFound()
    }

    return <PublishedPortfolioClient key={slug} payload={data.payload as PublishedPayload} />
  } catch {
    notFound()
  }
}
