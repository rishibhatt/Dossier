import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { resolveEffectivePlan } from "@/lib/billing/plans"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

import { PublishedPortfolioClient, type PublishedPayload } from "./published-client"

type PageProps = { params: Promise<{ slug: string }> }

type Row = { payload: unknown; user_id: string | null; indexable: boolean | null }

async function loadRow(slug: string): Promise<Row | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.from("published_portfolios").select("payload, user_id, indexable").eq("slug", slug).maybeSingle()
    return (data as Row | null) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const row = await loadRow(slug)
  const doc = (row?.payload as PublishedPayload | undefined)?.document
  // Private-by-default for search engines; owners opt in.
  return {
    title: doc?.meta.title,
    description: doc?.meta.description,
    robots: row?.indexable ? { index: true, follow: true } : { index: false, follow: false },
  }
}

/**
 * Free plans carry "Made with Dossier"; Starter and Pro do not. The owner's plan is read with the
 * service-role client (the visitor's RLS client cannot read other users). Without that client, or
 * on any lookup failure, the plan cannot be verified and the credit shows (fail closed).
 */
async function shouldShowCredit(userId: string | null): Promise<boolean> {
  if (!userId) return true
  const admin = createAdminSupabaseClient()
  if (!admin) return true
  try {
    const { data } = await admin.from("users").select("plan, plan_expires_at").eq("id", userId).maybeSingle()
    return !data || resolveEffectivePlan(data.plan, data.plan_expires_at) === "free"
  } catch {
    return true
  }
}

export default async function PublishedPortfolioPage({ params }: PageProps) {
  const { slug } = await params
  const row = await loadRow(slug)
  const payload = row?.payload as PublishedPayload | undefined
  if (!payload?.document || !payload.designConfig) notFound()

  const showCredit = await shouldShowCredit(row?.user_id ?? null)
  return <PublishedPortfolioClient payload={payload} showBadge={showCredit} slug={slug} />
}
