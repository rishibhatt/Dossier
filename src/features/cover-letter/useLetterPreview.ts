"use client"

import { useMemo } from "react"

import { LETTER_TEMPLATE_ID, letterFonts } from "@/lib/cover-letter/looks"
import { toLetterRenderModel } from "@/lib/cover-letter/renderModel"
import type { CoverLetterDesign, CoverLetterDocument } from "@/lib/cover-letter/schema"
import { typesetJob, usePreviewJob, type TypesetJob } from "@/features/resume/lib/usePreview"

/**
 * Cover letter typesetting on the resume engine. Every letter compiles /letter.typ; the chosen resume
 * template only decides the masthead look (looks.ts) and which fonts the worker loads. Same worker, same
 * protocol, same preview state as the resume editor.
 */

/** The typeset job for a letter. `today` fills an empty date (pass a fixed date in tests). */
export function letterJob(doc: CoverLetterDocument, design: CoverLetterDesign, today?: Date): TypesetJob {
  const model = toLetterRenderModel(doc, design, today)
  return { templateId: LETTER_TEMPLATE_ID, fonts: letterFonts(design.templateId), data: JSON.stringify(model), paper: model.style.paper }
}

/** Live SVG preview of a letter. Returns the same PreviewState as the resume's usePreview(). */
export function useLetterPreview(doc: CoverLetterDocument | null, design: CoverLetterDesign | null) {
  const job = useMemo(() => (doc && design ? letterJob(doc, design) : null), [doc, design])
  return usePreviewJob(job)
}

/** The letter as PDF bytes, or its extracted text (for the checker). */
export async function typesetLetter(doc: CoverLetterDocument, design: CoverLetterDesign, kind: "pdf"): Promise<Uint8Array>
export async function typesetLetter(
  doc: CoverLetterDocument,
  design: CoverLetterDesign,
  kind: "text",
): Promise<{ text: string; pages: number; links: string[] }>
export async function typesetLetter(doc: CoverLetterDocument, design: CoverLetterDesign, kind: "pdf" | "text") {
  return kind === "pdf" ? typesetJob(letterJob(doc, design), "pdf") : typesetJob(letterJob(doc, design), "text")
}
