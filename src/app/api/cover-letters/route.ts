import { apiError, resolveCaller } from "@/lib/api/guard"
import { LETTER_COLUMNS, LETTER_LIST_COLUMNS, parseLetterBody, resumeBelongsTo } from "@/lib/cover-letter/server"
import { PRIVATE_HEADERS, isJsonRequest } from "@/lib/resume/server"
import type { Json } from "@/types/database"

export const runtime = "nodejs"

/** The signed-in person's cover letters, newest first (titles, company and timestamps only). */
export async function GET() {
  const caller = await resolveCaller()
  if (!caller.user || !caller.supabase) return apiError("unauthorized", 401, { message: "Sign in to see your saved cover letters." })

  const { data, error } = await caller.supabase
    .from("cover_letters")
    .select(LETTER_LIST_COLUMNS)
    .eq("user_id", caller.user.id)
    .order("updated_at", { ascending: false })
    .limit(200)

  if (error) return apiError("list_failed", 503)
  return Response.json({ coverLetters: data }, { headers: PRIVATE_HEADERS })
}

/** Saves a new cover letter to the account. The plan limit is enforced by a database trigger. */
export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user || !caller.supabase) return apiError("unauthorized", 401, { message: "Sign in to save your cover letter." })

  if (!isJsonRequest(request)) return apiError("unsupported_media_type", 415)
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const body = parseLetterBody(json)
  if (!body.ok) return apiError(body.reason, body.reason === "payload_too_large" ? 413 : 400)
  if (!(await resumeBelongsTo(caller.supabase, caller.user.id, body.value.resumeId))) return apiError("unknown_resume", 400)

  const { data, error } = await caller.supabase
    .from("cover_letters")
    .insert({
      user_id: caller.user.id,
      resume_id: body.value.resumeId,
      title: body.value.title,
      template_id: body.value.templateId,
      company: body.value.company,
      data: body.value.data as unknown as Json,
      design: body.value.design as unknown as Json,
    })
    .select(LETTER_COLUMNS)
    .single()

  if (error) {
    if (error.message.includes("cover_letter_limit")) {
      return apiError("cover_letter_limit", 403, {
        message: `Your plan keeps ${caller.plan === "free" ? 3 : 200} cover letters in your account. This one is still saved on this device.`,
        plan: caller.plan,
      })
    }
    return apiError("save_failed", 503)
  }
  return Response.json({ coverLetter: data }, { status: 201, headers: PRIVATE_HEADERS })
}
