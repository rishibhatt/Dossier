import { apiError, resolveCaller } from "@/lib/api/guard"
import { PRIVATE_HEADERS, RESUME_COLUMNS, isJsonRequest, parseResumeBody } from "@/lib/resume/server"
import type { Json } from "@/types/database"

export const runtime = "nodejs"

/** The signed-in person's resumes, newest first (titles and timestamps only). */
export async function GET() {
  const caller = await resolveCaller()
  if (!caller.user || !caller.supabase) return apiError("unauthorized", 401, { message: "Sign in to see your saved resumes." })

  const { data, error } = await caller.supabase
    .from("resumes")
    .select("id, title, template_id, updated_at")
    .eq("user_id", caller.user.id)
    .order("updated_at", { ascending: false })
    .limit(200)

  if (error) return apiError("list_failed", 503)
  return Response.json({ resumes: data }, { headers: PRIVATE_HEADERS })
}

/** Saves a new resume to the account. The free-plan limit is enforced by a database trigger. */
export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user || !caller.supabase) return apiError("unauthorized", 401, { message: "Sign in to save your resume." })

  if (!isJsonRequest(request)) return apiError("unsupported_media_type", 415)
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const body = parseResumeBody(json)
  if (!body.ok) return apiError(body.reason, body.reason === "payload_too_large" ? 413 : 400)

  const { data, error } = await caller.supabase
    .from("resumes")
    .insert({
      user_id: caller.user.id,
      title: body.value.title,
      template_id: body.value.design.templateId,
      template_version: body.value.templateVersion,
      data: body.value.data as unknown as Json,
      design: body.value.design as unknown as Json,
    })
    .select(RESUME_COLUMNS)
    .single()

  if (error) {
    if (error.message.includes("resume_limit")) {
      return apiError("resume_limit", 403, {
        message: "Your plan keeps 2 resumes in your account. This one is still saved on this device.",
        plan: caller.plan,
      })
    }
    return apiError("save_failed", 503)
  }
  return Response.json({ resume: data }, { status: 201, headers: PRIVATE_HEADERS })
}
