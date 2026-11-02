"use client"

import { listDrafts, loadDraft } from "@/features/resume/lib/drafts"
import { resumeDesignSchema, resumeDocumentSchema, type PresetId, type ResumeDesign, type ResumeDocument } from "@/lib/resume/schema"

/**
 * The resumes a letter can start from: drafts on this device, plus (signed in) resumes saved in the account
 * that are not on this device. Read only; the letter copies what it needs once.
 */
export type ResumeOption = {
  /** Device draft id, or the account uuid for an account-only resume. */
  key: string
  draftId: string | null
  remoteId: string | null
  title: string
  name: string
  headline: string
  templateId: string
  /** The resume's country format, when known (device drafts). */
  preset: PresetId | null
  updatedAt: number
  where: "device" | "account"
}

export type LoadedResume = { doc: ResumeDocument; design: ResumeDesign; draftId: string | null; remoteId: string | null }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isUuid = (s: string) => UUID.test(s)

/** Resume drafts on this device, newest first. */
export function deviceResumes(limit = 6): ResumeOption[] {
  return listDrafts()
    .slice(0, limit)
    .map((d) => {
      const full = loadDraft(d.id)
      return {
        key: d.id,
        draftId: d.id,
        remoteId: d.remoteId,
        title: d.title,
        name: full?.doc.basics.name.trim() ?? "",
        headline: full?.doc.basics.headline.trim() ?? "",
        templateId: d.templateId,
        preset: full?.design.preset ?? null,
        updatedAt: d.updatedAt,
        where: "device" as const,
      }
    })
}

/** Resumes in the signed-in account. Empty on any error (signed out, offline, table missing). */
export async function accountResumes(): Promise<ResumeOption[]> {
  try {
    const res = await fetch("/api/resumes")
    if (!res.ok) return []
    const json = (await res.json()) as { resumes?: { id: string; title: string; template_id: string; updated_at: string }[] }
    return (json.resumes ?? []).map((r) => ({
      key: r.id,
      draftId: null,
      remoteId: r.id,
      title: r.title,
      name: "",
      headline: "",
      templateId: r.template_id,
      preset: null,
      updatedAt: Date.parse(r.updated_at) || 0,
      where: "account" as const,
    }))
  } catch {
    return []
  }
}

/** Loads a resume by device draft id first, then by account id. Null when neither has it. */
export async function loadResume(ref: { draftId?: string | null; remoteId?: string | null }): Promise<LoadedResume | null> {
  if (ref.draftId) {
    const d = loadDraft(ref.draftId)
    if (d) return { doc: d.doc, design: d.design, draftId: d.id, remoteId: d.remoteId }
  }
  // The device may hold the account copy under its own draft id.
  if (ref.remoteId) {
    const local = listDrafts().find((d) => d.remoteId === ref.remoteId)
    const d = local ? loadDraft(local.id) : null
    if (d) return { doc: d.doc, design: d.design, draftId: d.id, remoteId: d.remoteId }
  }
  if (!ref.remoteId || !isUuid(ref.remoteId)) return null
  try {
    const res = await fetch(`/api/resumes/${ref.remoteId}`)
    if (!res.ok) return null
    const json = (await res.json()) as { resume?: { id: string; data: unknown; design: unknown } }
    const doc = resumeDocumentSchema.safeParse(json.resume?.data)
    const design = resumeDesignSchema.safeParse(json.resume?.design)
    if (!json.resume || !doc.success || !design.success) return null
    return { doc: doc.data, design: design.data, draftId: null, remoteId: json.resume.id }
  } catch {
    return null
  }
}

/** "3 min ago", "2 h ago", "4 Nov". */
export function timeAgo(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })
}
