"use client"

import { useCallback, useEffect, useRef, useState } from "react"

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
 * Live preview. Typesets the resume in the worker on every change (debounced, and never more than one compile
 * in flight: changes made during a compile are folded into the next one). The last good page stays on screen
 * while a new one is set, and when a compile fails.
 */
export function usePreview(doc: ResumeDocument | null, design: ResumeDesign | null) {
  const [state, setState] = useState<PreviewState>({ status: "booting" })
  const inflight = useRef(false)
  const queued = useRef<{ data: string; templateId: string; fonts: string[]; paper: "a4" | "us-letter" } | null>(null)
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
    if (!doc || !design) return
    const model = toRenderModel(doc, design)
    const t = getTemplate(design.templateId)
    queued.current = { data: JSON.stringify(model), templateId: t.id, fonts: [...t.fonts], paper: model.style.paper }
    // The first compile goes straight out; edits wait for a short pause in typing.
    const delay = inflight.current || lastUrl.current ? 90 : 0
    const timer = setTimeout(() => void pump(), delay)
    return () => clearTimeout(timer)
  }, [doc, design, pump])

  return state
}

/** Typesets the PDF (or its extracted text, for the ATS check) on demand. */
export async function typeset(doc: ResumeDocument, design: ResumeDesign, kind: "pdf"): Promise<Uint8Array>
export async function typeset(doc: ResumeDocument, design: ResumeDesign, kind: "text"): Promise<{ text: string; pages: number; links: string[] }>
export async function typeset(doc: ResumeDocument, design: ResumeDesign, kind: "pdf" | "text") {
  const t = getTemplate(design.templateId)
  const res = await getTypstClient().request({ type: kind, templateId: t.id, fonts: [...t.fonts], data: JSON.stringify(toRenderModel(doc, design)) })
  if (res.type === "error") throw new Error(res.error)
  if (kind === "pdf" && res.type === "pdf") return res.bytes
  if (kind === "text" && res.type === "text") return { text: res.text, pages: res.pages, links: res.links }
  throw new Error("Unexpected reply from the typesetter.")
}

export function pdfFileName(doc: ResumeDocument, docName: string) {
  const name = doc.basics.name.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "Resume"
  return `${name}-${docName}.pdf`
}
