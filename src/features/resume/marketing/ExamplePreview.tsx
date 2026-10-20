"use client"

import { useState } from "react"

import type { Paper, Thumb } from "@/content/resume/evidence"

export type ExampleRender = { templateId: string; name: string; renders: Record<Paper, Thumb | null> }

const PAPERS: { id: Paper; label: string }[] = [
  { id: "a4", label: "A4" },
  { id: "us-letter", label: "US Letter" },
]

/**
 * One fictional sample set in every template that has a build-time render of it, with a paper toggle.
 * The mirror of TemplatePreview: there the template is fixed and the person changes, here the person is fixed.
 */
export function ExamplePreview({
  sampleLabel,
  role,
  templates,
  initialPaper,
}: {
  sampleLabel: string
  role: string
  templates: ExampleRender[]
  initialPaper: Paper
}) {
  const [templateId, setTemplate] = useState(templates[0]!.templateId)
  const [paper, setPaper] = useState<Paper>(initialPaper)
  const current = templates.find((t) => t.templateId === templateId) ?? templates[0]!
  const thumb = current.renders[paper]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        {templates.length > 1 ? (
          <fieldset>
            <legend className="sp-data mb-2">Template</legend>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button key={t.templateId} type="button" className="sp-chip" aria-pressed={t.templateId === current.templateId} onClick={() => setTemplate(t.templateId)}>
                  {t.name}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}
        <fieldset>
          <legend className="sp-data mb-2">Paper</legend>
          <div className="flex gap-2">
            {PAPERS.map((p) => (
              <button key={p.id} type="button" className="sp-chip" aria-pressed={p.id === paper} onClick={() => setPaper(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <figure className="mt-6">
        {thumb ? (
          <div className="flex flex-col gap-6">
            {thumb.pages.map((pg, i) => (
              <div key={pg.srcLarge} className="rs-page" style={{ aspectRatio: `1 / ${thumb.ratio}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static pre-rendered WebP with explicit sizes */}
                <img
                  src={pg.srcLarge}
                  srcSet={`${pg.src} 600w, ${pg.srcLarge} 1200w`}
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  width={1200}
                  height={Math.round(1200 * thumb.ratio)}
                  alt={`${role} resume example in the ${current.name} template, page ${i + 1}. ${sampleLabel}, a fictional person.`}
                  fetchPriority={i === 0 ? "high" : undefined}
                />
              </div>
            ))}
          </div>
        ) : null}
        <figcaption className="sp-data mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1">
          <span>Sample: {sampleLabel}. Not a real person.</span>
          <span>
            {current.name} · {thumb?.pages.length ?? 1} {thumb?.pages.length === 1 ? "page" : "pages"} · {paper === "a4" ? "A4" : "US Letter"} · set by Typst
          </span>
        </figcaption>
      </figure>
    </div>
  )
}
