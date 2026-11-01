"use client"

import { nanoid } from "nanoid"

import { listDrafts, loadDraft, saveDraft, type Draft } from "@/features/resume/lib/drafts"
import { resumeDesignSchema, resumeDocumentSchema } from "@/lib/resume/schema"

export type ResumeLinkResult =
  | { ok: true; draftId: string; title: string; already: boolean }
  | { ok: false; reason: "no_resume" | "full" }

const MAX_LINKS = 6
const sameLink = (a: string, b: string) => a.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") === b.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")

/** The newest resume: on this device first, else the newest one saved in the account (cached on this device). */
async function newestDraft(): Promise<Draft | null> {
  const local = listDrafts().sort((a, b) => b.updatedAt - a.updatedAt)[0]
  if (local) return loadDraft(local.id)
  // The list is newest first and has titles only; the full resume is a second request.
  const list = await fetch("/api/resumes", { cache: "no-store" }).catch(() => null)
  const first = list?.ok ? ((await list.json().catch(() => null)) as { resumes?: { id: string }[] } | null)?.resumes?.[0] : undefined
  if (!first) return null
  const res = await fetch(`/api/resumes/${first.id}`, { cache: "no-store" }).catch(() => null)
  if (!res?.ok) return null
  const body = (await res.json().catch(() => null)) as { resume?: { id: string; title: string; data: unknown; design: unknown; updated_at: string; user_id?: string } } | null
  const row = body?.resume
  const doc = resumeDocumentSchema.safeParse(row?.data)
  const design = resumeDesignSchema.safeParse(row?.design)
  if (!row || !doc.success || !design.success) return null
  return { id: row.id, title: row.title, doc: doc.data, design: design.data, updatedAt: Date.parse(row.updated_at) || Date.now(), remoteId: row.id, ownerId: row.user_id ?? null }
}

/**
 * Adds the portfolio link to the header of the person's newest resume, labelled "Portfolio". Saves on this
 * device, then to the account copy when there is one (same request the editor's autosave sends).
 */
export async function addPortfolioLinkToResume(url: string): Promise<ResumeLinkResult> {
  const draft = await newestDraft()
  if (!draft) return { ok: false, reason: "no_resume" }
  const links = draft.doc.basics.links
  if (links.some((l) => sameLink(l.url, url))) return { ok: true, draftId: draft.id, title: draft.title, already: true }
  if (links.length >= MAX_LINKS) return { ok: false, reason: "full" }

  const next: Draft = {
    ...draft,
    doc: { ...draft.doc, basics: { ...draft.doc.basics, links: [{ id: nanoid(10), label: "Portfolio", url }, ...links] } },
    updatedAt: Date.now(),
  }
  saveDraft(next)
  if (next.remoteId) {
    await fetch(`/api/resumes/${next.remoteId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: next.title, data: next.doc, design: next.design }),
    }).catch(() => null)
  }
  return { ok: true, draftId: next.id, title: next.title, already: false }
}
