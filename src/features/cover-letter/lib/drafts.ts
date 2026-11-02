"use client"

import type { ResumeFacts } from "@/lib/cover-letter/fromResume"
import { coverLetterDesignSchema, coverLetterDocumentSchema, type CoverLetterDesign, type CoverLetterDocument } from "@/lib/cover-letter/schema"

/**
 * Cover letters saved on this device. A copy of the resume drafts store (features/resume/lib/drafts.ts) with its
 * own prefix: writing a letter never needs an account, so every letter lives here first; after sign-in it is also
 * saved to the account (`remoteId`). Reads validate, so a damaged entry is skipped. Every storage call is guarded.
 */
export type LetterDraft = {
  id: string
  title: string
  doc: CoverLetterDocument
  design: CoverLetterDesign
  updatedAt: number
  /** Id of the copy in the account, once saved there. */
  remoteId: string | null
  /** Account that owns it. null = made while signed out; the first account to sign in on this device adopts it. */
  ownerId?: string | null
  /** The resume facts the letter was built from, kept on this device so "Rebuild" works without the resume. */
  facts?: ResumeFacts | null
  /** The template of the resume it was built from, so the Design tab can mark "Same as your resume". */
  resumeTemplateId?: string | null
}

export type LetterDraftSummary = Pick<LetterDraft, "id" | "title" | "updatedAt" | "remoteId"> & { templateId: string; company: string; role: string }

const PREFIX = "dossier:letter:v1:"
const INDEX = `${PREFIX}index`

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function listLetterDrafts(): LetterDraftSummary[] {
  const index = read<LetterDraftSummary[]>(INDEX)
  return Array.isArray(index) ? index.sort((a, b) => b.updatedAt - a.updatedAt) : []
}

export function loadLetterDraft(id: string): LetterDraft | null {
  const raw = read<LetterDraft>(`${PREFIX}d:${id}`)
  if (!raw) return null
  const doc = coverLetterDocumentSchema.safeParse(raw.doc)
  const design = coverLetterDesignSchema.safeParse(raw.design)
  if (!doc.success || !design.success) return null
  return { ...raw, doc: doc.data, design: design.data }
}

/** Returns false when the browser refused to store it (quota, private mode). */
export function saveLetterDraft(draft: LetterDraft): boolean {
  if (!write(`${PREFIX}d:${draft.id}`, draft)) return false
  const summary: LetterDraftSummary = {
    id: draft.id,
    title: draft.title,
    updatedAt: draft.updatedAt,
    remoteId: draft.remoteId,
    templateId: draft.design.templateId,
    company: draft.doc.recipient.company,
    role: draft.doc.job.role,
  }
  write(INDEX, [summary, ...listLetterDrafts().filter((d) => d.id !== draft.id)])
  return true
}

export function deleteLetterDraft(id: string) {
  try {
    localStorage.removeItem(`${PREFIX}d:${id}`)
  } catch {
    /* storage blocked */
  }
  write(
    INDEX,
    listLetterDrafts().filter((d) => d.id !== id),
  )
}

/** Removes every letter kept on this device. Called on sign-out, next to clearResumeDrafts(). */
export function clearLetterDrafts() {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith(PREFIX)) localStorage.removeItem(key)
  } catch {
    /* storage blocked */
  }
}

/** Removes only the letters that belong to an account (see clearAccountDrafts). Letters made signed out stay. */
export function clearAccountLetterDrafts() {
  for (const d of listLetterDrafts()) if (read<LetterDraft>(`${PREFIX}d:${d.id}`)?.ownerId) deleteLetterDraft(d.id)
}

export function newLetterDraftId() {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "").slice(0, 12) : Math.random().toString(36).slice(2, 14)
  return `c${rand}`
}

/** Creates a letter on this device and returns its id. */
export function createLetterDraft(
  input: Pick<LetterDraft, "doc" | "design"> & { title?: string; facts?: ResumeFacts | null; resumeTemplateId?: string | null },
): string {
  const draft: LetterDraft = {
    id: newLetterDraftId(),
    title: input.title ?? "",
    doc: input.doc,
    design: input.design,
    updatedAt: Date.now(),
    remoteId: null,
    facts: input.facts ?? null,
    resumeTemplateId: input.resumeTemplateId ?? null,
  }
  saveLetterDraft(draft)
  return draft.id
}
