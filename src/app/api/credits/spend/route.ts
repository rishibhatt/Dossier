import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { spendCredits } from "@/lib/credits/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const bodySchema = z.object({ item: z.enum(["shuffle_pack", "starter_unlock"]) })

const MESSAGES: Record<string, { status: number; message: string }> = {
  insufficient_credits: { status: 409, message: "You do not have enough credits for that yet." },
  already_included: { status: 409, message: "Your plan already includes this, so no credits were used." },
  no_user: { status: 404, message: "We could not find your account. Sign out and back in, then try again." },
  invalid_item: { status: 400, message: "That is not something credits can buy." },
  spend_failed: { status: 503, message: "Credits could not be used right now. Nothing was taken. Try again shortly." },
}

/**
 * Spend credits: 1 for a shuffle pack, 3 for Starter. The balance check, the debit and the effect
 * happen in one locked Postgres transaction (`spend_credits`), never in this handler.
 */
export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user) return apiError("unauthorized", 401, { message: "Sign in to use your credits." })

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return apiError("invalid_body", 400)

  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("credits_unavailable", 503, { message: "Credits are not set up on this server yet." })

  const result = await spendCredits(admin, caller.user.id, parsed.data.item)
  if (!result.ok) {
    const m = MESSAGES[result.error] ?? MESSAGES.spend_failed!
    return apiError(result.error, m.status, { message: m.message, balance: result.balance })
  }

  return Response.json({ ok: true, item: parsed.data.item, balance: result.balance })
}
