"use client"

import { useEffect, useRef, useState } from "react"

import { toRenderModel } from "@/lib/resume/renderModel"
import type { ResumeDesign, ResumeDocument } from "@/lib/resume/schema"
import { RESUME_TEMPLATES } from "@/lib/resume/templates"

import { getTypstClient } from "../engine/client"

/**
 * The person's own resume set in templates, as page-one thumbnails. Compiles run one after another in the
 * worker (a few milliseconds each) and refresh after a pause in editing. Pass `only` (the tiles on screen) so
 * a library of 40+ templates doesn't compile every one, or download every font family, up front.
 */
export function useTemplateThumbs(doc: ResumeDocument | null, design: ResumeDesign | null, enabled: boolean, delay = 600, only?: ReadonlySet<string>) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const urls = useRef<Record<string, string>>({})

  useEffect(() => {
    if (!enabled || !doc || !design) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const client = getTypstClient()
      for (const t of RESUME_TEMPLATES) {
        if (cancelled) return
        if (only && !only.has(t.id)) continue
        try {
          const data = JSON.stringify(toRenderModel(doc, { ...design, templateId: t.id }))
          const res = await client.request({ type: "preview", templateId: t.id, fonts: [...t.fonts], data })
          if (cancelled || res.type !== "preview") continue
          const url = URL.createObjectURL(new Blob([res.svg], { type: "image/svg+xml" }))
          const old = urls.current[t.id]
          urls.current[t.id] = url
          setThumbs((s) => ({ ...s, [t.id]: url }))
          if (old) setTimeout(() => URL.revokeObjectURL(old), 1500)
        } catch {
          /* a thumbnail is optional; the editor's own preview reports errors */
        }
      }
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [doc, design, enabled, delay, only])

  useEffect(
    () => () => {
      for (const u of Object.values(urls.current)) URL.revokeObjectURL(u)
    },
    [],
  )

  return thumbs
}
