"use client"

import { AlertTriangle } from "lucide-react"
import { useState } from "react"

import type { PreviewState } from "../lib/usePreview"

const PX_PER_PT = 96 / 72

/**
 * The resume as printed sheets. One SVG holds every page; each sheet shows its slice of it. Pages are plain
 * <img> elements from a blob: URL, so nothing inside the SVG can run script.
 */
export function PreviewStage({ state, paperLabel, templateLabel }: { state: PreviewState; paperLabel: string; templateLabel: string }) {
  const [zoom, setZoom] = useState<"fit" | "actual">("fit")

  const url = state.status === "ready" ? state.url : state.status === "error" ? state.lastUrl : null
  const pages = state.status === "booting" ? 1 : state.pages
  const width = state.status === "booting" ? 595 : state.width
  const pageHeight = state.status === "booting" ? 842 : state.pageHeight
  const stale = state.status === "ready" && state.stale
  const sheetWidth = zoom === "actual" ? `${Math.round(width * PX_PER_PT)}px` : "min(100%, 50rem)"

  const status =
    state.status === "booting"
      ? "Loading the typesetter"
      : state.status === "error"
        ? "Showing the last version that worked"
        : `${pages} ${pages === 1 ? "page" : "pages"}`

  return (
    <div className="rz-stage" aria-label="Preview">
      <div className="rz-stage-head">
        <span className="rz-mono" aria-live="polite">
          {templateLabel} · {paperLabel} · {status}
        </span>
        <div className="rz-segment rz-mono rz-hide-phone" role="radiogroup" aria-label="Zoom">
          <button type="button" role="radio" aria-checked={zoom === "fit"} onClick={() => setZoom("fit")}>
            Fit
          </button>
          <button type="button" role="radio" aria-checked={zoom === "actual"} onClick={() => setZoom("actual")}>
            100%
          </button>
        </div>
      </div>
      <div className="rz-stage-scroll">
        {state.status === "error" ? (
          <div className="rz-error" role="alert" style={{ maxWidth: "50rem", margin: "0 auto 1.25rem" }}>
            <AlertTriangle aria-hidden />
            <span>
              {state.line ? `Typesetting error on line ${state.line}: ` : "Couldn't typeset this change: "}
              {state.message}
            </span>
          </div>
        ) : null}

        <div className="rz-sheets" style={{ maxWidth: zoom === "actual" ? "none" : undefined }}>
          {url ? (
            Array.from({ length: pages }, (_, i) => (
              <div className="rz-sheet-wrap" key={i} style={{ width: sheetWidth }}>
                <div className="rz-sheet" data-stale={stale} style={{ aspectRatio: `${width} / ${pageHeight}` }}>
                  {stale && i === 0 ? <span className="rz-progress" aria-hidden /> : null}
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob: SVG from the typesetter */}
                  <img
                    src={url}
                    alt={i === 0 ? "Preview of your resume" : ""}
                    aria-hidden={i > 0}
                    draggable={false}
                    style={{ transform: `translateY(-${(i / pages) * 100}%)` }}
                  />
                </div>
                {pages > 1 ? (
                  <span className="rz-sheet-label rz-mono">
                    <span>
                      Page {i + 1} of {pages}
                    </span>
                  </span>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rz-sheet-wrap" style={{ width: sheetWidth }}>
              <div className="rz-skeleton" style={{ aspectRatio: `${width} / ${pageHeight}` }} aria-hidden>
                <i style={{ width: "46%", height: "1.4rem" }} />
                <i style={{ width: "30%" }} />
                <i style={{ width: "72%" }} />
                <i style={{ width: "100%", marginTop: "1.2rem" }} />
                <i style={{ width: "92%" }} />
                <i style={{ width: "96%" }} />
                <i style={{ width: "100%", marginTop: "1.2rem" }} />
                <i style={{ width: "88%" }} />
                <span className="rz-skeleton-note rz-mono">Loading the typesetter. About 7 MB, first visit only.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
