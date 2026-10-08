import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { isReservedUsername, USERNAME_PATTERN } from "@/lib/profile/username"

export const runtime = "nodejs"

const bodySchema = z.object({ username: z.string().trim().toLowerCase() })

export async function PATCH(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user || !caller.supabase) return apiError("unauthorized", 401)

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

  const { error } = await caller.supabase.from("users").update({ username }).eq("id", caller.user.id)

  if (error) {
    // 23505 = unique_violation
    if (error.code === "23505") return apiError("username_taken", 409)
    return apiError("update_failed", 503, { message: error.message })
  }

  return Response.json({ username })
}
