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

  const { data: profile } = await supabase
    .from("users")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .maybeSingle()

  const plan = resolveEffectivePlan(profile?.plan ?? "free", profile?.plan_expires_at ?? null)
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

  const subject = subjectFor(request, caller.user)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count, error: countError } = await admin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("subject", subject)
    .eq("kind", kind)
    .gte("created_at", since)

  if (countError) return apiError("quota_unavailable", 503)

  const used = count ?? 0
  if (used >= limit) {
    // Shuffle packs bought with credits raise the regenerate cap. Only looked up once the base cap is hit.
    const bonus = kind === "regenerate" && caller.user ? await activeShufflePackBonus(admin, caller.user.id) : 0
    if (used >= limit + bonus) {
      return apiError("quota_exceeded", 429, { kind, limit: limit + bonus, plan: caller.plan })
    }
  }

  const { error: insertError } = await admin
    .from("usage_events")
    .insert({ subject, user_id: caller.user?.id ?? null, kind })

  if (insertError) return apiError("quota_unavailable", 503)
  return null
}
