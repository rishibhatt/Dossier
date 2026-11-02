"use client"

import { buildLetter, toLetterParagraphs } from "@/features/cover-letter/letterGen"
import { track } from "@/lib/analytics"
import { letterFromResume, type ResumeFacts } from "@/lib/cover-letter/fromResume"
import { emptyLetter, LETTER_LIMITS, letterParagraph, type CoverLetterDesign, type CoverLetterDocument } from "@/lib/cover-letter/schema"
import type { PresetId } from "@/lib/resume/schema"

import { createLetterDraft, type LetterDraft } from "./drafts"
import type { LoadedResume } from "./resumeSource"

export type StartHow = "resume" | "pdf" | "job_ad" | "blank" | "checker" | "another_job"

type StartInput = {
  how: StartHow
  /** A saved resume (device or account), or a PDF read into a resume document. */
  resume?: LoadedResume | null
  role?: string
  company?: string
  jobPost?: string
  preset: PresetId
  templateId: string
}

const clean = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim()

/** Creates a letter on this device, fills it with the rule-based draft, and returns its id. */
export function startLetter(input: StartInput): string {
  const design: CoverLetterDesign = input.resume
    ? { ...input.resume.design, preset: input.preset }
    : { templateId: input.templateId, preset: input.preset, paper: null, density: "standard", accent: "ink" }

  let doc: CoverLetterDocument
  let facts: ResumeFacts | null = null
  if (input.resume) {
    const made = letterFromResume(input.resume.doc, design, { resumeDraftId: input.resume.draftId, resumeRemoteId: input.resume.remoteId })
    doc = made.letter
    facts = made.facts
  } else doc = emptyLetter()

  if (clean(input.role)) doc.job.role = clean(input.role).slice(0, 120)
  doc.recipient.company = clean(input.company).slice(0, 160)
  doc.jobPost = (input.jobPost ?? "").trim().slice(0, 12000)

  // A blank letter keeps its four empty paragraphs; the editor's placeholders say what goes in each.
  if (input.how !== "blank") {
    const built = buildLetter({ facts, role: doc.job.role, company: doc.recipient.company, jobPost: doc.jobPost, preset: design.preset })
    doc.paragraphs = toLetterParagraphs(built.paragraphs)
    track("letter_generated", { variant: built.variant, has_job_post: Boolean(doc.jobPost), from_resume: Boolean(facts) })
  }

  const title = [doc.job.role, doc.recipient.company].filter(Boolean).join(", ").slice(0, LETTER_LIMITS.titleChars)
  const id = createLetterDraft({ doc, design, title, facts, resumeTemplateId: input.resume?.design.templateId ?? null })
  track("letter_start", { how: input.how, template: design.templateId })
  return id
}

const GREETING = /^(?:dear|hi|hello|to whom)\b/i
const SIGN_OFF = /^(?:sincerely|yours (?:sincerely|faithfully|truly)|kind regards|best regards|warm regards|regards|best|with thanks|many thanks|respectfully|thank you),?$/i

/** Splits a pasted letter (from the free checker) into greeting, paragraphs, sign-off and signature. */
export function parseLetterText(raw: string): Pick<CoverLetterDocument, "greeting" | "paragraphs" | "signOff" | "signature"> {
  const lines = raw.replace(/\r/g, "").split("\n")
  const blocks: string[][] = []
  let cur: string[] = []
  for (const l of lines) {
    if (l.trim()) cur.push(l.trim())
    else if (cur.length) {
      blocks.push(cur)
      cur = []
    }
  }
  if (cur.length) blocks.push(cur)

  let greeting = ""
  let signOff = ""
  let signature = ""
  const gi = blocks.findIndex((b) => GREETING.test(b[0]!) && b[0]!.length <= 120)
  if (gi >= 0 && gi < 3) {
    greeting = blocks[gi]![0]!
    blocks[gi]!.shift()
    // Anything above the greeting is a letterhead or address block; the editor has its own fields for those.
    blocks.splice(0, gi + (blocks[gi]!.length ? 0 : 1))
  }
  for (let i = blocks.length - 1; i >= Math.max(0, blocks.length - 3); i--) {
    const b = blocks[i]!
    const k = b.findIndex((l) => SIGN_OFF.test(l))
    if (k < 0) continue
    signOff = b[k]!
    signature = b[k + 1] ?? blocks[i + 1]?.[0] ?? ""
    blocks.splice(i, blocks.length - i, ...(k > 0 ? [b.slice(0, k)] : []))
    break
  }

  const texts = blocks.map((b) => b.join(" ")).filter(Boolean)
  // The schema keeps up to 8 paragraphs; extra ones join the last.
  const kept = texts.slice(0, LETTER_LIMITS.paragraphs - 1)
  if (texts.length >= LETTER_LIMITS.paragraphs) kept.push(texts.slice(LETTER_LIMITS.paragraphs - 1).join("\n"))
  const paragraphs = kept.map((t) => letterParagraph("custom", t.slice(0, LETTER_LIMITS.paragraphChars)))
  return { greeting: greeting.slice(0, 120), paragraphs, signOff: signOff.slice(0, 60), signature: signature.slice(0, 100) }
}

/** A letter from the free checker: the pasted text as it is, plus the job ad shared through the ATS tool key. */
export function startFromChecker(text: string, jobPost: string, preset: PresetId, templateId: string): string {
  const doc = emptyLetter()
  Object.assign(doc, parseLetterText(text))
  if (!doc.paragraphs.length) doc.paragraphs = emptyLetter().paragraphs
  doc.jobPost = jobPost.trim().slice(0, 12000)
  const design: CoverLetterDesign = { templateId, preset, paper: null, density: "standard", accent: "ink" }
  const id = createLetterDraft({ doc, design })
  track("letter_start", { how: "checker", template: templateId })
  return id
}

/** "Write one for another job": a copy with the job, recipient and ad cleared. The letter text stays to edit. */
export function duplicateForAnotherJob(d: LetterDraft): string {
  const doc = structuredClone(d.doc)
  doc.job = { role: doc.job.role, reference: "", source: "" }
  doc.recipient = { name: "", title: "", company: "", address: "" }
  doc.greeting = ""
  doc.subject = ""
  doc.jobPost = ""
  doc.date = ""
  const id = createLetterDraft({ doc, design: { ...d.design }, facts: d.facts ?? null, resumeTemplateId: d.resumeTemplateId ?? null })
  track("letter_start", { how: "another_job", template: d.design.templateId })
  return id
}
