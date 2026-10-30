"use client"

import { useEffect, useState } from "react"
import { Pause, Play } from "lucide-react"

export type HeroSlide = { no: string; name: string; layout: string; src: string; srcLarge: string; ratio: number; alt: string }

const HOLD_MS = 3400

/**
 * The landing's one authored moment: a single sample resume re-set through three templates, each a real Typst
 * render. Pauses on hover, focus, the pause button, or reduced motion (which shows the first template only).
 */
export function HeroPlate({ slides, sampleLabel }: { slides: HeroSlide[]; sampleLabel: string }) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [held, setHeld] = useState(false)
  const s = slides[i]!

  useEffect(() => {
    if (!playing || held || slides.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = window.setTimeout(() => setI((v) => (v + 1) % slides.length), HOLD_MS)
    return () => window.clearTimeout(t)
  }, [i, playing, held, slides.length])

  return (
    <div className="sp-crop">
      <figure
        className="relative overflow-hidden border border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)]"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        <div className="sp-data flex items-center justify-between gap-3 border-b border-[var(--site-rule-strong)] bg-[var(--site-sheet)] px-4 py-2.5" aria-live="polite">
          <span className="sp-no truncate">
            No. {s.no} <b className="font-semibold text-[var(--site-ink)]">{s.name}</b> <span className="hidden sm:inline">· {s.layout}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {slides.map((x, k) => (
              <button
                key={x.no}
                type="button"
                onClick={() => setI(k)}
                aria-label={`Show ${x.name}`}
                aria-pressed={k === i}
                className="hidden size-11 place-items-center sm:grid"
              >
                <span className={`block h-1 w-5 ${k === i ? "bg-[var(--site-ink)]" : "bg-[var(--site-rule-strong)]"}`} />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause the template preview" : "Play the template preview"}
              className="grid size-11 place-items-center text-[var(--site-ink)]"
            >
              {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            </button>
          </span>
        </div>

        <div className="px-6 pb-0 pt-6 sm:px-12 sm:pt-10">
          <div className="rs-stack mx-auto max-w-[34rem]">
            {slides.map((x, k) => (
              <div key={x.no} data-on={k === i} aria-hidden={k !== i} className="rs-page !rounded-b-none !border-b-0" style={{ aspectRatio: `1 / ${(x.ratio * 0.62).toFixed(4)}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static pre-rendered WebP with explicit sizes */}
                <img
                  src={x.srcLarge}
                  srcSet={`${x.src} 600w, ${x.srcLarge} 1200w`}
                  sizes="(min-width: 1024px) 34rem, 90vw"
                  width={1200}
                  height={Math.round(1200 * x.ratio)}
                  alt={x.alt}
                  fetchPriority={k === 0 ? "high" : "low"}
                  loading={k === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>
      </figure>
      <p className="sp-data mt-3">Sample: {sampleLabel}. Not a real person. Each page is set by the same typesetter as the editor.</p>
    </div>
  )
}
