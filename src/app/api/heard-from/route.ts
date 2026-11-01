import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { HEARD_FROM } from "@/lib/growth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const bodySchema = z.object({ answer: z.enum(HEARD_FROM.map((h) => h.id) as [string, ...string[]]) })

/** Saves the first answer to "How did you hear about Dossier?". Later answers are ignored, never overwrite it. */
export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user) return apiError("unauthorized", 401)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return apiError("invalid_body", 400)
  // Users cannot write this column themselves (column grants), so the service role writes it.
  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("unavailable", 503)
  const { error } = await admin.from("users").update({ heard_from: parsed.data.answer }).eq("id", caller.user.id).is("heard_from", null)
  if (error) return apiError("save_failed", 503)
  return Response.json({ ok: true })
}
