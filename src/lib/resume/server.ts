import "server-only"

import { z } from "zod"

import { RESUME_LIMITS, resumeDesignSchema, resumeDocumentSchema } from "./schema"
import { getTemplate } from "./templates"

/** Body for create and update. Both parts are validated strictly; unknown keys are dropped. */
export const resumeBodySchema = z.object({
  title: z.string().max(RESUME_LIMITS.titleChars).default(""),
  data: resumeDocumentSchema,
  design: resumeDesignSchema,
})

export const resumeIdSchema = z.string().uuid()

/** Parses a request body; returns null (with a reason) when it is not a valid resume. */
export function parseResumeBody(json: unknown) {
  const parsed = resumeBodySchema.safeParse(json)
  if (!parsed.success) return { ok: false as const, reason: "invalid_resume" }
  if (JSON.stringify(parsed.data.data).length > RESUME_LIMITS.dataBytes) return { ok: false as const, reason: "payload_too_large" }
  const template = getTemplate(parsed.data.design.templateId)
  if (template.id !== parsed.data.design.templateId) return { ok: false as const, reason: "unknown_template" }
  return { ok: true as const, value: { ...parsed.data, templateVersion: template.version } }
}

export const RESUME_COLUMNS = "id, user_id, title, template_id, template_version, data, design, created_at, updated_at" as const

/** Personal data: never cached by the browser or a shared proxy. */
export const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" } as const

/** JSON only. A cross-site HTML form can't send this content type, which closes the text/plain CSRF trick. */
export function isJsonRequest(request: Request) {
  return (request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")
}
