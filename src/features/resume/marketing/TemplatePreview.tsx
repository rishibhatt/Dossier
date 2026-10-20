"use client"

import { useState } from "react"

import type { Paper, Thumb } from "@/content/resume/evidence"

export type PreviewSample = { id: string; label: string; role: string; renders: Record<Paper, Thumb | null> }

const PAPERS: { id: Paper; label: string }[] = [
  { id: "a4", label: "A4" },
  { id: "us-letter", label: "US Letter" },
]

/**
 * The template's real render, large, with a paper toggle and a sample switch. Every image is a page Typst set
 * at build time; switching only swaps the picture. Each sample is labelled as a fictional person.
 */
export function TemplatePreview({ name, samples, initialSample }: { name: string; samples: PreviewSample[]; initialSample: string }) {
  const [sampleId, setSample] = useState(initialSample)
  const [paper, setPaper] = useState<Paper>("a4")
  const sample = samples.find((s) => s.id === sampleId) ?? samples[0]!
  const thumb = sample.renders[paper]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <fieldset>
          <legend className="sp-data mb-2">Sample person</legend>
          <div className="flex flex-wrap gap-2">
            {samples.map((s) => (
              <button key={s.id} type="button" className="sp-chip" aria-pressed={s.id === sample.id} onClick={() => setSample(s.id)}>
                {s.role}
              </button>
            ))}
          </div>
        </fieldset>
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
                  alt={`${name} resume template, page ${i + 1}, sample for a fictional ${sample.role.toLowerCase()}`}
                  fetchPriority={i === 0 ? "high" : undefined}
                />
              </div>
            ))}
          </div>
        ) : null}
        <figcaption className="sp-data mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1">
          <span>Sample: {sample.label}. Not a real person.</span>
          <span>
            {thumb?.pages.length ?? 1} {thumb?.pages.length === 1 ? "page" : "pages"} · {paper === "a4" ? "A4" : "US Letter"} · standard density · set by Typst
          </span>
        </figcaption>
      </figure>
    </div>
  )
}
