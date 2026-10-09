import "server-only"

import { cache } from "react"

import { PLAN_LIMITS, resolveEffectivePlan, type PlanId, type PlanLimits } from "@/lib/billing/plans"
import { activeShufflePackBonus } from "@/lib/credits/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export type DashboardContext = {
  supabase: SupabaseClient<Database> | null
  userId: string | null
  email: string | null
  username: string | null
  plan: PlanId
  limits: PlanLimits
  /** Design shuffles used in the last 24 hours. Null when the usage ledger is not configured. */
  shufflesUsed: number | null
  /** Extra daily regenerations from shuffle packs bought with credits. */
  shuffleBonus: number
}

/** One lookup per request, shared by the dashboard layout and its pages. */
export const getDashboardContext = cache(async (): Promise<DashboardContext> => {
  const empty: DashboardContext = {
    supabase: null,
    userId: null,
    email: null,
    username: null,
    plan: "free",
    limits: PLAN_LIMITS.free,
    shufflesUsed: null,
    shuffleBonus: 0,
  }

  let supabase: SupabaseClient<Database>
  try {
    supabase = await createServerSupabaseClient()
  } catch {
    return empty
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ...empty, supabase }

  const { data: profile } = await supabase
    .from("users")
    .select("plan, plan_expires_at, username")
    .eq("id", user.id)
    .maybeSingle()

  const plan = resolveEffectivePlan(profile?.plan ?? "free", profile?.plan_expires_at ?? null)

  let shufflesUsed: number | null = null
  let shuffleBonus = 0
  const admin = createAdminSupabaseClient()
  if (admin) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("subject", `u:${user.id}`)
      .eq("kind", "regenerate")
      .gte("created_at", since)
    shufflesUsed = count ?? 0
    shuffleBonus = await activeShufflePackBonus(admin, user.id)
  }

  return {
    supabase,
    userId: user.id,
    email: user.email ?? null,
    username: profile?.username ?? null,
    plan,
    limits: PLAN_LIMITS[plan],
    shufflesUsed,
    shuffleBonus,
  }
})
