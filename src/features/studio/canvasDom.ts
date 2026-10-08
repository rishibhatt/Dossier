"use client"

import { gsap } from "@/components/marketing/motion/gsap"
import { anchorFor } from "@/components/portfolio/sections/anchors"
import { usePortfolioStore } from "@/store/usePortfolioStore"

let liveRoot: HTMLElement | null = null

/** The one live canvas on the page, registered by StudioCanvas, so panels can scroll and reveal in it. */
export function setCanvasRoot(el: HTMLElement | null) {
  liveRoot = el
}

export function canvasRoot() {
  return liveRoot
}

/**
 * Section shells inside the canvas. Prefers `[data-section-id]` (studio wrappers); otherwise matches each
 * rendered `.pf-sec` to its section through the anchor id the page gives it.
 */
function shells(root: HTMLElement): { id: string; el: HTMLElement }[] {
  const stamped = Array.from(root.querySelectorAll<HTMLElement>("[data-section-id]"))
  if (stamped.length) return stamped.map((el) => ({ id: el.dataset.sectionId!, el }))
  const doc = usePortfolioStore.getState().document
  if (!doc) return []
  const byAnchor = new Map(doc.sections.map((s) => [anchorFor(s, doc), s.id]))
  return Array.from(root.querySelectorAll<HTMLElement>("section.pf-sec[id]"))
    .map((el) => ({ id: byAnchor.get(el.id) ?? "", el }))
    .filter((x) => x.id)
}
export function sectionEl(root: HTMLElement | null, id: string | null): HTMLElement | null {
  if (!root || !id) return null
  return shells(root).find((s) => s.id === id)?.el ?? null
}

export function sectionIdAt(root: HTMLElement | null, target: EventTarget | null): string | null {
  if (!root || !(target instanceof Node)) return null
  return shells(root).find((s) => s.el.contains(target))?.id ?? null
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Scrolls a section into view inside the canvas, then reveals it with a wipe. */
export function revealSection(root: HTMLElement | null, id: string, tries = 12) {
  const el = sectionEl(root, id)
  if (!el || !root) {
    if (tries > 0) requestAnimationFrame(() => revealSection(root, id, tries - 1))
    return
  }
  const scroller = root.querySelector<HTMLElement>("[data-canvas-scroll]") ?? root
  const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 24
  scroller.scrollTo({ top, behavior: reduced() ? "auto" : "smooth" })
  if (reduced()) return
  gsap.fromTo(
    el,
    { clipPath: "inset(0 0 100% 0)", y: 28 },
    { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.8, delay: 0.25, ease: "power3.out", clearProps: "clipPath,transform" }
  )
}

/** Fades a section down, runs the change, then fades the new version in: a live crossfade between looks. */
export function crossfadeSection(root: HTMLElement | null, id: string, change: () => void) {
  const el = sectionEl(root, id)
  if (!el || reduced()) {
    change()
    return
  }
  gsap.to(el, {
    autoAlpha: 0.15,
    duration: 0.16,
    ease: "power1.in",
    onComplete: () => {
      change()
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const next = sectionEl(root, id)
          if (next) gsap.fromTo(next, { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.36, ease: "power2.out", clearProps: "opacity,visibility" })
        })
      )
    },
  })
}
