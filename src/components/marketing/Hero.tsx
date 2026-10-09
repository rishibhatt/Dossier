"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { Pause, Play, Shuffle } from "lucide-react"

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/components/marketing/motion/gsap"
import type { SamplePerson } from "@/components/marketing/sample"
import type { Specimen } from "@/components/marketing/specimens"
import { UploadSlot } from "@/components/marketing/UploadSlot"

const HOLD_MS = 3400

function face(name: string): CSSProperties {
  return { fontFamily: `"${name}", var(--site-display)` }
}

/**
 * First viewport. The sample person's name is set as a specimen showing, with a size waterfall of their
 * resume lines and the engine's real data for the current look. It re-sets itself into the next look on a
 * timer (paused on hover, focus, reduced motion, or by the visitor), which is what shuffle does in the builder.
 */
export function Hero({ specimens, person, total }: { specimens: Specimen[]; person: SamplePerson; total: number }) {
  const root = useRef<HTMLElement>(null)
  const showing = useRef<HTMLParagraphElement>(null)
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [held, setHeld] = useState(false)
  const s = specimens[i % specimens.length]!

  const next = useCallback(() => setI((v) => (v + 1) % specimens.length), [specimens.length])

  // Autoplay only when motion is welcome and nobody is reading or pointing at the plate.
  useEffect(() => {
    if (!playing || held) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = window.setTimeout(next, HOLD_MS)
    return () => window.clearTimeout(t)
  }, [i, playing, held, next])

  // Each new specimen: the showing's letters come up out of the baseline, the waterfall follows.
  // The first look is already on the page at load; only re-sets animate.
  const firstSet = useRef(true)
  useGSAP(
    () => {
      const el = showing.current
      if (!el) return
      if (firstSet.current) {
        firstSet.current = false
        return
      }
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el, { type: "words,chars" })
        gsap.fromTo(split.chars, { yPercent: 35, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.02 })
        gsap.fromTo("[data-fall]", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.05, delay: 0.12 })
        return () => split.revert()
      })
    },
    { scope: root, dependencies: [i] }
  )

  // Copy column rises once on load.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo("[data-copy] > *", { y: 14 }, { y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 })
        gsap.fromTo("[data-rule]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 1.1, ease: "power3.inOut" })
      })
    },
    { scope: root }
  )

  const plate = { background: s.swatch.bg, color: s.swatch.text, "--plate-accent": s.swatch.accent } as CSSProperties

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative">
      <div className="site-wrap pt-6 sm:pt-10">
        {/* Running head of the sheet */}
        <div className="sp-data flex items-center justify-between gap-4 pb-2">
          <span>Dossier specimens</span>
          <span className="hidden sm:inline">Set from one sample resume</span>
          <span className="sp-no">
            {String(total).padStart(3, "0")} looks in the engine
          </span>
        </div>
        <span data-rule className="block h-px bg-[var(--site-ink)]" aria-hidden />

        <div className="sp-columns grid grid-cols-1 lg:grid-cols-12">
          {/* Copy */}
          <div data-copy className="order-2 flex min-w-0 flex-col justify-center gap-5 pb-8 pt-6 sm:gap-6 sm:py-12 lg:col-span-5 lg:py-14 lg:pl-10 lg:[&>*]:bg-[var(--site-paper)]">
            <h1 id="hero-title" className="site-h1 max-w-[14ch] lg:text-[clamp(3rem,4.6vw,4.5rem)]">
              Your resume, set as a website.
            </h1>
            <p className="site-lead">
              Upload the PDF you already have. Dossier reads it, lays it out as a portfolio site, and lets you try
              look after look until one feels like you. Then publish a link, from your phone if you like.
            </p>
            <UploadSlot className="max-w-md" />
            <p className="text-sm text-[var(--site-ink-2)]">
              Not ready to upload?{" "}
              <Link href="#specimens" className="site-link-mark font-medium text-[var(--site-ink)]">
                Browse every look first
              </Link>
            </p>
          </div>

          {/* Specimen plate */}
          <div className="order-1 min-w-0 border-[var(--site-rule-strong)] pt-5 lg:col-span-7 lg:border-r lg:py-10 lg:pr-10">
            <div className="sp-crop">
            <figure
              className="relative overflow-hidden border border-[var(--site-rule-strong)] transition-[background-color,color] duration-500"
              style={plate}
              onPointerEnter={() => setHeld(true)}
              onPointerLeave={() => setHeld(false)}
              onFocus={() => setHeld(true)}
              onBlur={() => setHeld(false)}
            >
              <div className="sp-data flex items-center justify-between gap-3 border-b border-current/15 px-4 py-2.5 !text-current" aria-live="polite">
                <span className="sp-no">
                  No. {s.no} <b className="font-semibold">{s.name}</b>
                </span>
                <span className="truncate opacity-75">{s.bestFor}</span>
              </div>

              <div className="px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-8">
                <p
                  ref={showing}
                  key={s.id}
                  className="text-[clamp(3rem,13.5vw,10.5rem)] font-bold leading-[0.9] tracking-[-0.035em]"
                  style={face(s.display)}
                  aria-label={`${person.name}, set in ${s.display}`}
                >
                  {person.name}
                </p>

                <dl className="mt-4 grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-3 border-t border-current/15 pt-3 sm:mt-6 sm:pt-4 [&>*:nth-child(n+3)]:hidden sm:[&>*:nth-child(n+3)]:block">
                  <dt data-fall className="sp-data !text-current opacity-60">32</dt>
                  <dd data-fall className="text-[clamp(1.375rem,3.2vw,2rem)] font-bold leading-tight tracking-[-0.02em]" style={face(s.display)}>
                    {person.role}, {person.city}
                  </dd>
                  <dt data-fall className="sp-data !text-current opacity-60">20</dt>
                  <dd data-fall className="text-[1.125rem] font-bold leading-snug sm:text-[1.25rem]" style={face(s.display)}>
                    {person.jobs[0]!.line}
                  </dd>
                  <dt data-fall className="sp-data !text-current opacity-60">14</dt>
                  <dd data-fall className="text-[0.875rem] leading-snug opacity-80">
                    {person.skills.join(" / ")}
                  </dd>
                </dl>

                <div className="mt-6 hidden flex-wrap items-center gap-2 sm:flex" aria-hidden>
                  {[s.swatch.bg, s.swatch.surface, s.swatch.text, s.swatch.accent].map((c, k) => (
                    <span key={k} className="sp-data inline-flex items-center gap-1.5 !text-current opacity-80">
                      <i className="block size-3.5 border border-current/30" style={{ background: c }} />
                      {c.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <table className="sp-data hidden w-full border-t border-current/15 !text-current sm:table">
                <caption className="sr-only">Engine settings for this look</caption>
                <tbody className="[&_td]:px-4 [&_td]:py-2 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-normal [&_th]:opacity-60 [&_tr+tr]:border-t [&_tr+tr]:border-current/10">
                  <tr>
                    <th scope="row">Display</th>
                    <td>{s.display}</td>
                    <th scope="row" className="hidden sm:table-cell">Layout</th>
                    <td className="hidden sm:table-cell">{s.layout}</td>
                  </tr>
                  <tr>
                    <th scope="row">Body</th>
                    <td>{s.body}</td>
                    <th scope="row" className="hidden sm:table-cell">Hero</th>
                    <td className="hidden sm:table-cell">{s.hero}</td>
                  </tr>
                </tbody>
              </table>
            </figure>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--site-ink-2)]">Sample person and resume, made up for this page.</p>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pause the looks" : "Play the looks"}
                  className="site-btn site-btn-ghost site-btn-sm !px-0 aspect-square"
                >
                  {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                </button>
                <button type="button" onClick={next} className="site-btn site-btn-secondary site-btn-sm">
                  <Shuffle className="size-4" aria-hidden />
                  <span className="site-btn-label">Next look</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <span className="block h-px bg-[var(--site-ink)]" aria-hidden />
      </div>
    </section>
  )
}
