import { resolveCaller } from "@/lib/api/guard"
import { getCreditBalance } from "@/lib/credits/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/** Small account summary for upgrade prompts: signed in or not, effective plan, credit balance. */
export async function GET() {
  const caller = await resolveCaller()
  if (!caller.user) {
    return Response.json({ signedIn: false, plan: "free", balance: 0 }, { headers: { "Cache-Control": "no-store" } })
  }
  const admin = createAdminSupabaseClient()
  const balance = admin ? await getCreditBalance(admin, caller.user.id) : 0
  return Response.json({ signedIn: true, plan: caller.plan, balance }, { headers: { "Cache-Control": "no-store" } })
}
