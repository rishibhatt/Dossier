"use client"

import { resumeDesignSchema, resumeDocumentSchema, type ResumeDesign, type ResumeDocument } from "@/lib/resume/schema"

/**
 * Resumes saved on this device. Building never needs an account, so every resume lives here first; after
 * sign-in it is also saved to the account (`remoteId`). Reads validate, so a damaged entry is skipped, never
 * crashes the editor. Every storage call is guarded: private windows and blocked storage just save nothing.
 */
export type Draft = {
  id: string
  title: string
  doc: ResumeDocument
  design: ResumeDesign
  updatedAt: number
  /** Id of the copy in the account, once saved there. */
  remoteId: string | null
  /** Account that owns it. null = made while signed out; the first account to sign in on this device adopts it. */
  ownerId?: string | null
  /** Set when the draft started from a sample person, so the checklist only counts the person's own edits. */
  sampleId?: string | null
  /** True once the person picked a template themselves (start screen or Design tab). */
  templateChosen?: boolean
}

export type DraftSummary = Pick<Draft, "id" | "title" | "updatedAt" | "remoteId"> & { templateId: string }

const PREFIX = "dossier:resume:v1:"
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

export function listDrafts(): DraftSummary[] {
  const index = read<DraftSummary[]>(INDEX)
  return Array.isArray(index) ? index.sort((a, b) => b.updatedAt - a.updatedAt) : []
}

export function loadDraft(id: string): Draft | null {
  const raw = read<Draft>(`${PREFIX}d:${id}`)
  if (!raw) return null
  const doc = resumeDocumentSchema.safeParse(raw.doc)
  const design = resumeDesignSchema.safeParse(raw.design)
  if (!doc.success || !design.success) return null
  return { ...raw, doc: doc.data, design: design.data }
}

/** Returns false when the browser refused to store it (quota, private mode). */
export function saveDraft(draft: Draft): boolean {
  if (!write(`${PREFIX}d:${draft.id}`, draft)) return false
  const summary: DraftSummary = {
    id: draft.id,
    title: draft.title,
    updatedAt: draft.updatedAt,
    remoteId: draft.remoteId,
    templateId: draft.design.templateId,
  }
  write(INDEX, [summary, ...listDrafts().filter((d) => d.id !== draft.id)])
  return true
}

export function deleteDraft(id: string) {
  try {
    localStorage.removeItem(`${PREFIX}d:${id}`)
  } catch {
    /* storage blocked */
  }
  write(
    INDEX,
    listDrafts().filter((d) => d.id !== id),
  )
}

/**
 * Removes every resume kept on this device. Called on sign-out, so the next person on a shared computer
 * can't see (or save into their own account) someone else's resume.
 */
export function clearResumeDrafts() {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith(PREFIX)) localStorage.removeItem(key)
  } catch {
    /* storage blocked */
  }
}

export function newDraftId() {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "").slice(0, 12) : Math.random().toString(36).slice(2, 14)
  return `l${rand}`
}

/** Creates a draft on this device and returns its id. */
export function createDraft(
  input: Pick<Draft, "doc" | "design"> & { title?: string; sampleId?: string | null; templateChosen?: boolean },
): string {
  const draft: Draft = {
    id: newDraftId(),
    title: input.title ?? "",
    doc: input.doc,
    design: input.design,
    updatedAt: Date.now(),
    remoteId: null,
    sampleId: input.sampleId ?? null,
    templateChosen: input.templateChosen ?? false,
  }
  saveDraft(draft)
  return draft.id
}
