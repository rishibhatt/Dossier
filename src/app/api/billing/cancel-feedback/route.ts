import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const bodySchema = z.object({
  reason: z.enum(["got_job", "too_expensive", "missing_feature", "hard_to_use", "only_once", "other"]),
  details: z.string().trim().max(2000).optional(),
  offer: z.string().trim().max(64).optional(),
  outcome: z.enum(["kept_plan", "accepted_offer", "downgraded", "feedback_only"]),
  /** Must be true for `downgraded`. The page only sends it from the explicit confirm step. */
  confirmDowngrade: z.boolean().optional(),
})

/** Per user, per 24 hours. The form is short; anything past this is a script. */
const MAX_PER_DAY = 10

/**
 * Stores the exit survey answer. The only plan change it can make is Pro -> Free, and only when the
 * person confirmed it. Checkout is not live, so there is no subscription to cancel at a provider yet.
 */
export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user) return apiError("unauthorized", 401, { message: "Sign in to change your plan." })

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return apiError("invalid_body", 400)
  const body = parsed.data

  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("feedback_unavailable", 503, { message: "This is not set up on this server yet." })

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await admin
    .from("cancellation_feedback")
    .select("id", { count: "exact", head: true })
    .eq("user_id", caller.user.id)
    .gte("created_at", since)
  if ((count ?? 0) >= MAX_PER_DAY) return apiError("quota_exceeded", 429, { message: "Thanks, we already have your answers for today." })

  if (body.outcome === "downgraded") {
    if (!body.confirmDowngrade) return apiError("confirm_required", 400, { message: "Confirm the switch to Free first." })
    if (caller.plan !== "pro") {
      return apiError("not_downgradable", 409, { message: "Only Pro can be switched to Free here. Starter is a one-time purchase and never renews." })
    }
  }

  const { error } = await admin.from("cancellation_feedback").insert({
    user_id: caller.user.id,
    plan: caller.plan,
    reason: body.reason,
    details: body.details || null,
    offer: body.offer || null,
    outcome: body.outcome,
  })
  if (error) return apiError("feedback_failed", 503, { message: "We could not save that. Try again shortly." })

  if (body.outcome === "downgraded") {
    const { error: planError } = await admin
      .from("users")
      .update({ plan: "free", plan_expires_at: null })
      .eq("id", caller.user.id)
    if (planError) return apiError("downgrade_failed", 503, { message: "Your answers are saved, but the plan did not change. Try again shortly." })
    return Response.json({ ok: true, plan: "free" })
  }

  return Response.json({ ok: true, plan: caller.plan })
}
