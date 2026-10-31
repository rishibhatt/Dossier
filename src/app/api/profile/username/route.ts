import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { isReservedUsername, USERNAME_PATTERN } from "@/lib/profile/username"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const bodySchema = z.object({ username: z.string().trim().toLowerCase() })

export async function PATCH(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user) return apiError("unauthorized", 401)

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return apiError("invalid_body", 400)

  const { username } = parsed.data
  if (!USERNAME_PATTERN.test(username)) {
    return apiError("invalid_username", 400, {
      message: "Use 3-30 characters: lowercase letters, numbers, hyphens. Start with a letter or number.",
    })
  }
  if (isReservedUsername(username)) return apiError("username_reserved", 400)

  // Users cannot write this column themselves (migration 20261102120000), so the reserved list above always applies.
  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("update_failed", 503, { message: "This is not set up on this server yet." })
  const { error } = await admin.from("users").update({ username }).eq("id", caller.user.id)

  if (error) {
    // 23505 = unique_violation
    if (error.code === "23505") return apiError("username_taken", 409)
    console.error("[username] update failed:", error.message)
    return apiError("update_failed", 503, { message: "Your username did not save. Try again." })
  }

  return Response.json({ username })
}
