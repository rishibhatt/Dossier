import "server-only"

import { createHash } from "node:crypto"

import type { SupabaseClient, User } from "@supabase/supabase-js"

import {
  ANONYMOUS_LIMITS,
  DEV_UNLIMITED_LIMITS,
  IS_DEV_UNLIMITED,
  PLAN_LIMITS,
  resolveEffectivePlan,
  type PlanId,
  type PlanLimits,
  type UsageKind,
} from "@/lib/billing/plans"
import { isTestEnv } from "@/config/site"
import { activeShufflePackBonus } from "@/lib/credits/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

export type Caller = {
  /** Null when Supabase is not configured (local dev only). */
  supabase: SupabaseClient<Database> | null
  user: User | null
  plan: PlanId
  limits: PlanLimits
}

export function apiError(error: string, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ error, ...extra }, { status })
}

/** Resolve session + effective plan for the current request. Never throws. */
export async function resolveCaller(): Promise<Caller> {
  let supabase: SupabaseClient<Database> | null = null
  try {
    supabase = await createServerSupabaseClient()
  } catch {
    return { supabase: null, user: null, plan: "free", limits: IS_DEV_UNLIMITED ? DEV_UNLIMITED_LIMITS : ANONYMOUS_LIMITS }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, plan: "free", limits: IS_DEV_UNLIMITED ? DEV_UNLIMITED_LIMITS : ANONYMOUS_LIMITS }
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("plan, plan_expires_at, owns_starter")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) console.error("[guard] profile read failed, treating as Free:", profileError.message)
  const plan = resolveEffectivePlan(profile?.plan ?? "free", profile?.plan_expires_at ?? null, profile?.owns_starter)
  return { supabase, user, plan, limits: IS_DEV_UNLIMITED ? DEV_UNLIMITED_LIMITS : PLAN_LIMITS[plan] }
}

/** Best-effort client IP from proxy headers (Netlify first). Works with `request.headers` or `await headers()`. */
export function clientIpFromHeaders(h: Pick<Headers, "get">): string {
  return (
    h.get("x-nf-client-connection-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  )
}

/** Salted, truncated SHA-256 of an IP. The raw IP is never stored. */
export function hashIp(ip: string): string {
  // No public default: without RATE_LIMIT_SALT, derive the salt from a server secret so hashes cannot be precomputed.
  const salt = process.env.RATE_LIMIT_SALT ?? (process.env.SUPABASE_SERVICE_ROLE_KEY ? createHash("sha256").update(process.env.SUPABASE_SERVICE_ROLE_KEY).digest("hex") : "dev-only-salt")
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32)
}

function subjectFor(request: Request, user: User | null): string {
  if (user) return `u:${user.id}`
  return `ip:${hashIp(clientIpFromHeaders(request.headers))}`
}

/**
 * Enforce the rolling 24h quota for `kind` and record one use.
 * Returns an error Response when blocked, or null when the caller may proceed.
 */
export async function consumeQuota(request: Request, caller: Caller, kind: UsageKind): Promise<Response | null> {
  if (IS_DEV_UNLIMITED) return null

  const limit = caller.limits.daily[kind]

  if (limit <= 0) {
    return caller.user
      ? apiError("plan_required", 402, { kind, plan: caller.plan })
      : apiError("unauthorized", 401, { kind })
  }

  const admin = createAdminSupabaseClient()
  if (!admin) {
    // Fail closed in production: an unconfigured ledger must not mean unlimited free LLM calls.
    if (process.env.NODE_ENV === "production") return apiError("quota_unavailable", 503)
    return null
  }

  // `test:` keeps local dev traffic out of the admin numbers while quotas still work per caller.
  const subject = `${isTestEnv ? "test:" : ""}${subjectFor(request, caller.user)}`

  // One locked step in Postgres (consume_quota), so a burst of parallel requests cannot all read a count of 0.
  const consume = (cap: number) => admin.rpc("consume_quota", { p_subject: subject, p_user: caller.user?.id ?? null, p_kind: kind, p_limit: cap })
  let bonus = 0
  let { data: used, error: rpcError } = await consume(limit)
  if (!rpcError && used === -1 && kind === "regenerate" && caller.user) {
    // Shuffle packs bought with credits raise the regenerate cap. Only looked up once the base cap is hit.
    bonus = await activeShufflePackBonus(admin, caller.user.id)
    if (bonus > 0) ({ data: used, error: rpcError } = await consume(limit + bonus))
  }
  if (!rpcError) {
    return used === -1 ? apiError("quota_exceeded", 429, { kind, limit: limit + bonus, plan: caller.plan }) : null
  }
  // PGRST202: the function is not in the database yet (migration 20261102120000 not applied). Fall back to count, then insert.
  if (rpcError.code !== "PGRST202") return apiError("quota_unavailable", 503)
  console.error("[guard] consume_quota missing, apply migration 20261102120000. Using the unlocked fallback.")
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count, error: countError } = await admin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("subject", subject)
    .eq("kind", kind)
    .gte("created_at", since)

  if (countError) return apiError("quota_unavailable", 503)

  if ((count ?? 0) >= limit) {
    bonus = kind === "regenerate" && caller.user ? await activeShufflePackBonus(admin, caller.user.id) : 0
    if ((count ?? 0) >= limit + bonus) return apiError("quota_exceeded", 429, { kind, limit: limit + bonus, plan: caller.plan })
  }

  const { error: insertError } = await admin
    .from("usage_events")
    .insert({ subject, user_id: caller.user?.id ?? null, kind })

  if (insertError) return apiError("quota_unavailable", 503)
  return null
}

/**
 * Abuse throttle, separate from plan quotas (sign-in attempts, view pings). Records one hit and returns false once
 * `subject` has made `limit` hits of `kind` within `window` (a Postgres interval such as "15 minutes").
 * Fails open: a missing service key or table must not lock everyone out of signing in.
 */
export async function allowRate(subject: string, kind: string, limit: number, window: string): Promise<boolean> {
  if (IS_DEV_UNLIMITED) return true
  const admin = createAdminSupabaseClient()
  if (!admin) return true
  const { data, error } = await admin.rpc("hit_rate_limit", { p_subject: subject, p_kind: kind, p_limit: limit, p_window: window })
  if (error) {
    if (error.code !== "PGRST202") console.error("[guard] rate limit check failed:", error.message)
    return true
  }
  return data !== false
}
