import { apiError, resolveCaller } from "@/lib/api/guard"
import { getReferralSummary } from "@/lib/referrals/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/** The signed-in user's invite link, referral counts, credit balance and the last 20 ledger rows. */
export async function GET() {
  const caller = await resolveCaller()
  if (!caller.user) return apiError("unauthorized", 401, { message: "Sign in to see your invite link." })

  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("referrals_unavailable", 503, { message: "Invites are not set up on this server yet." })

  const summary = await getReferralSummary(admin, caller.user.id)
  return Response.json({ ...summary, plan: caller.plan }, { headers: { "Cache-Control": "no-store" } })
}
