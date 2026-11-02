"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { toRenderModel } from "@/lib/resume/renderModel"
import type { ResumeDesign, ResumeDocument } from "@/lib/resume/schema"
import { getTemplate } from "@/lib/resume/templates"

import { getTypstClient } from "../engine/client"

export type PreviewState =
  | { status: "booting" }
  | { status: "ready"; url: string; pages: number; width: number; pageHeight: number; ms: number; stale: boolean }
  | { status: "error"; message: string; line: number | null; lastUrl: string | null; pages: number; width: number; pageHeight: number }

const PAGE_PT = { a4: 841.89, "us-letter": 792 } as const

function measure(svg: string, paper: "a4" | "us-letter") {
  const vb = svg.slice(0, 600).match(/viewBox="([\d.\s-]+)"/)?.[1]?.split(/\s+/).map(Number)
  const width = vb?.[2] ?? 595
  const height = vb?.[3] ?? PAGE_PT[paper]
  const pageHeight = PAGE_PT[paper]
  return { width, pageHeight, pages: Math.max(1, Math.round(height / pageHeight)) }
}

/**
 * One thing to typeset: the Typst source to compile (`/${templateId}.typ`), the fonts the worker must load,
 * the JSON model, and the paper size (for measuring pages). Resumes use their template id; cover letters use
 * "letter" with the matching template's fonts (see src/features/cover-letter/useLetterPreview.ts).
 */
export type TypesetJob = { templateId: string; fonts: string[]; data: string; paper: "a4" | "us-letter" }

/** The typeset job for a resume. */
export function resumeJob(doc: ResumeDocument, design: ResumeDesign): TypesetJob {
  const model = toRenderModel(doc, design)
  const t = getTemplate(design.templateId)
  return { data: JSON.stringify(model), templateId: t.id, fonts: [...t.fonts], paper: model.style.paper }
}

/**
 * Live preview. Typesets the resume in the worker on every change (debounced, and never more than one compile
 * in flight: changes made during a compile are folded into the next one). The last good page stays on screen
 * while a new one is set, and when a compile fails.
 */
export function usePreview(doc: ResumeDocument | null, design: ResumeDesign | null) {
  const job = useMemo(() => (doc && design ? resumeJob(doc, design) : null), [doc, design])
  return usePreviewJob(job)
}

/** Live preview of any typeset job. Pass a memoised job: a new object starts a new compile. */
export function usePreviewJob(job: TypesetJob | null) {
  const [state, setState] = useState<PreviewState>({ status: "booting" })
  const inflight = useRef(false)
  const queued = useRef<TypesetJob | null>(null)
  const lastUrl = useRef<string | null>(null)
  const alive = useRef(true)

  const pump = useCallback(async () => {
    if (inflight.current || !queued.current) return
    const job = queued.current
    queued.current = null
    inflight.current = true
    setState((s) => (s.status === "ready" ? { ...s, stale: true } : s))
    try {
      const res = await getTypstClient().request({ type: "preview", templateId: job.templateId, fonts: job.fonts, data: job.data })
      if (!alive.current) return
      if (res.type === "preview") {
        const url = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }))
        const old = lastUrl.current
        lastUrl.current = url
        // Revoke after the new image has had a frame to paint, so the sheet never flashes empty.
        if (old) setTimeout(() => URL.revokeObjectURL(old), 1500)
        setState({ status: "ready", url, ms: res.ms, stale: false, ...measure(res.svg, job.paper) })
      } else if (res.type === "error") {
        setState((s) => ({
          status: "error",
          message: res.error,
          line: res.line,
          lastUrl: lastUrl.current,
          pages: s.status === "booting" ? 1 : s.pages,
          width: s.status === "booting" ? 595 : s.width,
          pageHeight: s.status === "booting" ? PAGE_PT[job.paper] : s.pageHeight,
        }))
      }
    } catch (e) {
      if (!alive.current) return
      setState((s) => ({
        status: "error",
        message: e instanceof Error ? e.message : "The preview stopped.",
        line: null,
        lastUrl: lastUrl.current,
        pages: s.status === "booting" ? 1 : s.pages,
        width: s.status === "booting" ? 595 : s.width,
        pageHeight: s.status === "booting" ? PAGE_PT[job.paper] : s.pageHeight,
      }))
    } finally {
      inflight.current = false
      if (queued.current && alive.current) void pump()
    }
  }, [])

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    if (!job) return
    queued.current = job
    // The first compile goes straight out; edits wait for a short pause in typing.
    const delay = inflight.current || lastUrl.current ? 90 : 0
    const timer = setTimeout(() => void pump(), delay)
    return () => clearTimeout(timer)
  }, [job, pump])

  return state
}

/** Typesets the PDF (or its extracted text, for the ATS check) on demand. */
export async function typeset(doc: ResumeDocument, design: ResumeDesign, kind: "pdf"): Promise<Uint8Array>
export async function typeset(doc: ResumeDocument, design: ResumeDesign, kind: "text"): Promise<{ text: string; pages: number; links: string[] }>
export async function typeset(doc: ResumeDocument, design: ResumeDesign, kind: "pdf" | "text") {
  return kind === "pdf" ? typesetJob(resumeJob(doc, design), "pdf") : typesetJob(resumeJob(doc, design), "text")
}

/** Typesets any job to PDF bytes, or to its extracted text. */
export async function typesetJob(job: TypesetJob, kind: "pdf"): Promise<Uint8Array>
export async function typesetJob(job: TypesetJob, kind: "text"): Promise<{ text: string; pages: number; links: string[] }>
export async function typesetJob(job: TypesetJob, kind: "pdf" | "text") {
  const res = await getTypstClient().request({ type: kind, templateId: job.templateId, fonts: job.fonts, data: job.data })
  if (res.type === "error") throw new Error(res.error)
  if (kind === "pdf" && res.type === "pdf") return res.bytes
  if (kind === "text" && res.type === "text") return { text: res.text, pages: res.pages, links: res.links }
  throw new Error("Unexpected reply from the typesetter.")
}

export function pdfFileName(doc: ResumeDocument, docName: string) {
  const name = doc.basics.name.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "Resume"
  return `${name}-${docName}.pdf`
}
