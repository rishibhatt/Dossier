import { apiError, resolveCaller } from "@/lib/api/guard"
import { LETTER_COLUMNS, letterIdSchema, parseLetterBody, resumeBelongsTo } from "@/lib/cover-letter/server"
import { PRIVATE_HEADERS, isJsonRequest } from "@/lib/resume/server"
import type { Json } from "@/types/database"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

async function ownerAndId(ctx: Ctx) {
  const { id } = await ctx.params
  const caller = await resolveCaller()
  if (!caller.user || !caller.supabase) return { error: apiError("unauthorized", 401) } as const
  if (!letterIdSchema.safeParse(id).success) return { error: apiError("not_found", 404) } as const
  return { caller: { ...caller, user: caller.user, supabase: caller.supabase }, id } as const
}

export async function GET(_request: Request, ctx: Ctx) {
  const r = await ownerAndId(ctx)
  if ("error" in r) return r.error
  const { data, error } = await r.caller.supabase
    .from("cover_letters")
    .select(LETTER_COLUMNS)
    .eq("id", r.id)
    .eq("user_id", r.caller.user.id)
    .maybeSingle()
  if (error) return apiError("load_failed", 503)
  if (!data) return apiError("not_found", 404)
  return Response.json({ coverLetter: data }, { headers: PRIVATE_HEADERS })
}

export async function PUT(request: Request, ctx: Ctx) {
  const r = await ownerAndId(ctx)
  if ("error" in r) return r.error
  if (!isJsonRequest(request)) return apiError("unsupported_media_type", 415)
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const body = parseLetterBody(json)
  if (!body.ok) return apiError(body.reason, body.reason === "payload_too_large" ? 413 : 400)
  if (!(await resumeBelongsTo(r.caller.supabase, r.caller.user.id, body.value.resumeId))) return apiError("unknown_resume", 400)

  const { data, error } = await r.caller.supabase
    .from("cover_letters")
    .update({
      resume_id: body.value.resumeId,
      title: body.value.title,
      template_id: body.value.templateId,
      company: body.value.company,
      data: body.value.data as unknown as Json,
      design: body.value.design as unknown as Json,
    })
    .eq("id", r.id)
    .eq("user_id", r.caller.user.id)
    .select("id, updated_at")
    .maybeSingle()
  if (error) return apiError("save_failed", 503)
  if (!data) return apiError("not_found", 404)
  return Response.json({ coverLetter: data }, { headers: PRIVATE_HEADERS })
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const r = await ownerAndId(ctx)
  if ("error" in r) return r.error
  const { error } = await r.caller.supabase.from("cover_letters").delete().eq("id", r.id).eq("user_id", r.caller.user.id)
  if (error) return apiError("delete_failed", 503)
  return new Response(null, { status: 204 })
}
