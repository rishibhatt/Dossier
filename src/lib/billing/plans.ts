import type { PlanId } from "@/types/database"

export type { PlanId }

export type UsageKind = "parse" | "regenerate" | "refine" | "export" | "publish"

export type PlanLimits = {
  /** Max published portfolios. */
  portfolios: number
  /** Rolling 24h caps per usage kind. */
  daily: Record<UsageKind, number>
  zipExport: boolean
}

/** Limits for callers with no session (preview-first flow). Keep tight: they cost LLM quota. */
export const ANONYMOUS_LIMITS: PlanLimits = {
  portfolios: 0,
  daily: { parse: 2, regenerate: 3, refine: 5, export: 0, publish: 0 },
  zipExport: false,
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    portfolios: 1,
    daily: { parse: 5, regenerate: 3, refine: 10, export: 0, publish: 10 },
    zipExport: false,
  },
  starter: {
    portfolios: 1,
    daily: { parse: 20, regenerate: 200, refine: 100, export: 20, publish: 30 },
    zipExport: true,
  },
  pro: {
    portfolios: 5,
    daily: { parse: 50, regenerate: 500, refine: 300, export: 50, publish: 60 },
    zipExport: true,
  },
}

/** Local development only: no caps, so builders can test freely. Never active in production builds. */
export const DEV_UNLIMITED_LIMITS: PlanLimits = {
  portfolios: 9999,
  daily: { parse: 99999, regenerate: 99999, refine: 99999, export: 99999, publish: 99999 },
  zipExport: true,
}

export const IS_DEV_UNLIMITED = process.env.NODE_ENV !== "production"

/** A plan with an expiry date (Pro, yearly) falls back to free once it passes. */
export function resolveEffectivePlan(plan: PlanId, planExpiresAt: string | null): PlanId {
  if (plan === "free") return "free"
  if (planExpiresAt && new Date(planExpiresAt).getTime() < Date.now()) return "free"
  return plan
}
