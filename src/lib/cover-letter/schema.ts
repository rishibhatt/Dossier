import { z } from "zod"

import { id, linkSchema, newId, resumeDesignSchema, text, type ResumeDesign } from "../resume/schema"

/**
 * CoverLetterDocument v1: the data contract for a cover letter.
 * It reuses the resume's string, id and link rules (so the same caps and URL allow-list apply), and the
 * resume's design object, so a letter set in "R-014 Harbor / UK / A4" matches the resume beside it.
 * Nothing in here is typeset as markup: renderModel.ts turns it into plain JSON strings for Typst.
 */

export const PARAGRAPH_KINDS = ["opening", "proof", "fit", "closing", "custom"] as const
export type ParagraphKind = (typeof PARAGRAPH_KINDS)[number]

export const letterParagraphSchema = z.object({
  id,
  kind: z.enum(PARAGRAPH_KINDS).default("custom"),
  text: text(1500).default(""),
})
export type LetterParagraph = z.infer<typeof letterParagraphSchema>

export const letterSenderSchema = z.object({
  name: text(100).default(""),
  headline: text(140).default(""),
  email: text(160).default(""),
  phone: text(40).default(""),
  location: text(120).default(""),
  links: z.array(linkSchema).max(3).default([]),
})
export type LetterSender = z.infer<typeof letterSenderSchema>

export const letterRecipientSchema = z.object({
  /** "Ms Jane Doe" or "Jane Doe". Empty means the letter is addressed to the hiring team. */
  name: text(120).default(""),
  title: text(120).default(""),
  company: text(160).default(""),
  /** Free text; line breaks are kept as separate lines in the address block. */
  address: text(300).default(""),
})
export type LetterRecipient = z.infer<typeof letterRecipientSchema>

export const letterJobSchema = z.object({
  role: text(120).default(""),
  /** Job or requisition number, printed in the subject line when there is one. */
  reference: text(80).default(""),
  /** Where the ad was seen ("LinkedIn", "your careers page"). Used by the generator only. */
  source: text(120).default(""),
})
export type LetterJob = z.infer<typeof letterJobSchema>

export const coverLetterDocumentSchema = z.object({
  version: z.literal(1),
  sender: letterSenderSchema,
  recipient: letterRecipientSchema.default({ name: "", title: "", company: "", address: "" }),
  job: letterJobSchema.default({ role: "", reference: "", source: "" }),
  /** ISO date (YYYY-MM-DD). "" means today, resolved when the letter is typeset. */
  date: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/).default(""),
  /** Optional subject line ("Application for ..."). DE and EU presets print an automatic one when this is empty. */
  subject: text(200).default(""),
  /** "" means automatic: "Dear {recipient}," or "Dear Hiring Manager,". */
  greeting: text(120).default(""),
  paragraphs: z.array(letterParagraphSchema).max(8).default([]),
  /** "" means the preset's sign-off (see renderModel.ts). */
  signOff: text(60).default(""),
  /** "" means the sender's name. */
  signature: text(100).default(""),
  /** The pasted job ad. Drives the generator and the checker. Never typeset, and kept on the device. */
  jobPost: text(12000).default(""),
  source: z
    .object({
      resumeDraftId: z.string().max(40).nullable().default(null),
      resumeRemoteId: z.string().uuid().nullable().default(null),
    })
    .default({ resumeDraftId: null, resumeRemoteId: null }),
})
export type CoverLetterDocument = z.infer<typeof coverLetterDocumentSchema>

/** The same design object as a resume, so a letter can copy its resume's template, preset, paper and accent. */
export const coverLetterDesignSchema = resumeDesignSchema
export type CoverLetterDesign = ResumeDesign

/** Hard caps for storage. `dataBytes` matches the planned `cover_letters` table check. */
export const LETTER_LIMITS = { dataBytes: 64 * 1024, titleChars: 120, paragraphs: 8, paragraphChars: 1500 } as const

/** A new paragraph with a fresh id. */
export function letterParagraph(kind: ParagraphKind = "custom", body = ""): LetterParagraph {
  return { id: newId("p"), kind, text: body }
}

/** A blank letter: empty sender and recipient, and the four usual paragraphs with nothing in them. */
export function emptyLetter(): CoverLetterDocument {
  return {
    version: 1,
    sender: { name: "", headline: "", email: "", phone: "", location: "", links: [] },
    recipient: { name: "", title: "", company: "", address: "" },
    job: { role: "", reference: "", source: "" },
    date: "",
    subject: "",
    greeting: "",
    paragraphs: (["opening", "proof", "fit", "closing"] as const).map((k) => letterParagraph(k)),
    signOff: "",
    signature: "",
    jobPost: "",
    source: { resumeDraftId: null, resumeRemoteId: null },
  }
}
