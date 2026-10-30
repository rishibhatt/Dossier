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
  /** End of the current Pro pass; null for Free and Starter. */
  planExpiresAt: string | null
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
    planExpiresAt: null,
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

  // Profile and shuffle usage are independent reads: run them together.
  const admin = createAdminSupabaseClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const [{ data: profile, error: profileError }, usage, shuffleBonus] = await Promise.all([
    supabase.from("users").select("plan, plan_expires_at, username, owns_starter").eq("id", user.id).maybeSingle(),
    admin
      ? admin
          .from("usage_events")
          .select("id", { count: "exact", head: true })
          .in("subject", [`u:${user.id}`, `test:u:${user.id}`])
          .eq("kind", "regenerate")
          .gte("created_at", since)
      : null,
    admin ? activeShufflePackBonus(admin, user.id) : 0,
  ])
  // A failed read would show a paying user as Free. Say so in the server log instead of hiding it.
  if (profileError) console.error("[dashboard] profile read failed, showing Free:", profileError.message)

  const plan = resolveEffectivePlan(profile?.plan ?? "free", profile?.plan_expires_at ?? null, profile?.owns_starter)

  const shufflesUsed = usage ? (usage.count ?? 0) : null

  return {
    supabase,
    userId: user.id,
    email: user.email ?? null,
    username: profile?.username ?? null,
    plan,
    planExpiresAt: plan === "pro" ? (profile?.plan_expires_at ?? null) : null,
    limits: PLAN_LIMITS[plan],
    shufflesUsed,
    shuffleBonus,
  }
})
