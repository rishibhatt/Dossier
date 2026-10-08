"use client"

import { useEffect, useRef } from "react"

import { gsap, MOTION_OK, useGSAP } from "@/components/marketing/motion/gsap"
import { LiveSite } from "@/features/dossier/components/live-build/LiveSite"
import { lookCaption } from "@/features/dossier/components/live-build/buildCopy"
import { googleFontsHref } from "@/lib/design/googleFonts"
import { useParseProgressStore } from "@/store/useParseProgressStore"

const NEUTRAL = { bg: "#ffffff", fg: "#101114", accent: "#101114", display: "var(--site-display)" }

/** Loads the chosen look's display face so the ink-in shows the real type. */
function useLookFont(family?: string) {
  useEffect(() => {
    if (!family) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = googleFontsHref([family])
    link.dataset.buildFont = ""
    document.head.appendChild(link)
    return () => link.remove()
  }, [family])
}

/**
 * The site assembling itself from the stream. Text extracted: the nav draws in with the name, the name sets
 * letter by letter, one block per detected section slots in with its count. AI read: the grey skeleton
 * sharpens. Layout done: the chosen look inks across the plate from the left and the caption names it.
 * Reduced motion shows each state as a plain step, no movement.
 */
export function LiveBuild({ elapsed }: { elapsed: string }) {
  const root = useRef<HTMLDivElement>(null)
  const stage = useParseProgressStore((s) => s.stageIndex)
  const preview = useParseProgressStore((s) => s.preview)
  const t = preview.template
  const inked = Boolean(t) && stage >= 4
  const ink = t ? { bg: t.bg, fg: t.text, accent: t.accent, display: `"${t.display}", var(--site-display)` } : NEUTRAL
  useLookFont(t?.display)

  // Name and nav: once, when the name first arrives.
  useGSAP(
    () => {
      if (!preview.name) return
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo("[data-nav]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.out" })
        gsap.fromTo("[data-ch]", { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.025, ease: "power3.out", delay: 0.15 })
      })
    },
    { scope: root, dependencies: [preview.name] }
  )

  // Section blocks slot in one by one as the list grows.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const fresh = gsap.utils.toArray<HTMLElement>("[data-block]:not([data-in])")
        fresh.forEach((el) => el.setAttribute("data-in", ""))
        if (fresh.length) gsap.fromTo(fresh, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.12, ease: "power3.out", delay: 0.35 })
      })
    },
    { scope: root, dependencies: [preview.sections?.join(",")] }
  )

  // The look inks across.
  useGSAP(
    () => {
      if (!inked) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo("[data-ink]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power2.inOut" })
        gsap.fromTo("[data-caption]", { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.7, ease: "power2.out" })
      })
    },
    { scope: root, dependencies: [inked] }
  )

  return (
    <div ref={root} className="lb-plate">
      <div className="frame-bar">
        <span className="truncate">{inked && t ? t.name : "Your site"}</span>
        <span className="tabular-nums">{elapsed}</span>
      </div>
      <div className="lb-stage" role="img" aria-label={preview.name ? `Your site being set for ${preview.name}` : "Your site being set"}>
        <LiveSite preview={preview} palette={NEUTRAL} stage={stage} />
        {inked ? (
          <div data-ink className="lb-ink" aria-hidden>
            <LiveSite preview={preview} palette={ink} stage={stage} />
          </div>
        ) : null}
      </div>
      <p data-caption className="lb-caption" aria-live="polite">
        {inked && t ? lookCaption(t) : preview.source === "fallback" ? "Read without AI: check the fields" : " "}
      </p>
    </div>
  )
}
