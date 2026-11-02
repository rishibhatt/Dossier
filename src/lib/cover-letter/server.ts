import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

import type { Database } from "@/types/database"

import { getTemplate } from "../resume/templates"
import { LETTER_LIMITS, coverLetterDesignSchema, coverLetterDocumentSchema } from "./schema"

/**
 * Body for create and update. Both parts are validated strictly; unknown keys are dropped.
 * `template_id` and `company` are derived here (from design.templateId and data.recipient.company), never trusted
 * from the client. `resume_id` is optional; the route checks it belongs to the caller.
 */
export const letterBodySchema = z.object({
  title: z.string().max(LETTER_LIMITS.titleChars).default(""),
  resume_id: z.string().uuid().nullable().default(null),
  data: coverLetterDocumentSchema,
  design: coverLetterDesignSchema,
})

export const letterIdSchema = z.string().uuid()

/** Parses a request body; returns { ok: false, reason } when it is not a valid cover letter. */
export function parseLetterBody(json: unknown) {
  const parsed = letterBodySchema.safeParse(json)
  if (!parsed.success) return { ok: false as const, reason: "invalid_cover_letter" }
  // The pasted job ad stays on the device: it is large, personal-ish and only drives the generator and checker.
  const { jobPost: _jobPost, ...data } = parsed.data.data
  void _jobPost
  if (JSON.stringify(data).length > LETTER_LIMITS.dataBytes) return { ok: false as const, reason: "payload_too_large" }
  const template = getTemplate(parsed.data.design.templateId)
  if (template.id !== parsed.data.design.templateId) return { ok: false as const, reason: "unknown_template" }
  return {
    ok: true as const,
    value: {
      title: parsed.data.title,
      resumeId: parsed.data.resume_id,
      templateId: template.id,
      company: data.recipient.company.slice(0, 160),
      data,
      design: parsed.data.design,
    },
  }
}

export const LETTER_COLUMNS = "id, user_id, resume_id, title, template_id, company, data, design, created_at, updated_at" as const

/** List view: no letter text. */
export const LETTER_LIST_COLUMNS = "id, title, template_id, company, resume_id, updated_at" as const

/** True when `resumeId` is null or a resume the caller owns. RLS and the table policy check this again. */
export async function resumeBelongsTo(supabase: SupabaseClient<Database>, userId: string, resumeId: string | null) {
  if (!resumeId) return true
  const { data, error } = await supabase.from("resumes").select("id").eq("id", resumeId).eq("user_id", userId).maybeSingle()
  return !error && !!data
}
