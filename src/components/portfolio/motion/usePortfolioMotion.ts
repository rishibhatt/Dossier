"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { RefObject } from "react"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const EASE = "expo.out"

/** Per-signature hidden state for reveals. End state is always the element's natural style. */
const FROM: Record<string, gsap.TweenVars> = {
  rise: { autoAlpha: 0, y: 18 },
  clip: { clipPath: "inset(100% 0% 0% 0%)", y: 14 },
  wipe: { clipPath: "inset(0% 100% 0% 0%)" },
}
const TO: Record<string, gsap.TweenVars> = {
  rise: { autoAlpha: 1, y: 0 },
  clip: { clipPath: "inset(0% 0% 0% 0%)", y: 0 },
  wipe: { clipPath: "inset(0% 0% 0% 0%)" },
}

/** Fire once when the element is near the viewport. IntersectionObserver works inside the studio's scroll box too. */
function onceVisible(els: Element[], run: (el: Element) => void) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        run(e.target)
      }
    },
    { rootMargin: "0px 0px 12% 0px", threshold: 0 }
  )
  els.forEach((el) => io.observe(el))
  return () => io.disconnect()
}

/** "1,240+" -> count from 0 to 1240 keeping prefix, separators, decimals and suffix. */
function countUp(el: Element) {
  const text = el.textContent ?? ""
  const m = text.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/)
  if (!m) return
  const [, pre, num, post] = m
  const target = parseFloat(num!.replace(/,/g, ""))
  if (!Number.isFinite(target) || target === 0) return
  const decimals = num!.split(".")[1]?.length ?? 0
  const commas = num!.includes(",")
  const fmt = (v: number) => {
    const s = v.toFixed(decimals)
    return commas ? Number(s).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : s
  }
  const state = { v: 0 }
  gsap.fromTo(
    state,
    { v: 0 },
    {
      v: target,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = `${pre}${fmt(state.v)}${post}`
      },
      onComplete: () => {
        el.textContent = text
      },
      onInterrupt: () => {
        el.textContent = text
      },
    }
  )
}

function scrollerFor(el: HTMLElement): Element | Window {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY
    if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight) return p
  }
  return window
}

/**
 * Portfolio motion, one signature per template family (root data-pf-motion: rise | clip | wipe):
 * hero name sets in by word masks, titles/blocks reveal once, list items stagger, highlight numbers
 * count up once, project covers drift lightly (data-pf-parallax="on").
 * Content is visible by default: hidden states are applied by GSAP only, inside a
 * prefers-reduced-motion: no-preference media query, and reverted on cleanup.
 */
export function usePortfolioMotion(rootRef: RefObject<HTMLElement | null>, { disabled, key }: { disabled?: boolean; key?: string }) {
  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || disabled) return
      const sig = root.dataset.pfMotion ?? "rise"
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", (gctx) => {
        const q = <E extends Element>(s: string) => Array.from(root.querySelectorAll<E>(s))
        const cleanups: (() => void)[] = []

        /**
         * Hidden state is applied at the moment an element is about to enter (never pre-hidden), and
         * a timer forces the end state if the ticker cannot run (hidden tab, throttled frame), so
         * nothing can stay invisible. Sections mounted later are picked up by the re-run on `key`.
         */
        const reveal = (targets: Element | Element[], from: gsap.TweenVars, to: gsap.TweenVars) =>
          gctx.add(() => {
            const n = Array.isArray(targets) ? targets.length : 1
            const stagger = typeof to.stagger === "number" ? to.stagger : 0
            const t = gsap.fromTo(targets, from, to)
            const timer = window.setTimeout(() => t.progress(1), ((Number(to.duration) || 1) + (Number(to.delay) || 0) + stagger * n + 0.6) * 1000)
            cleanups.push(() => window.clearTimeout(timer))
          })

        // signature moment: hero name by word masks
        const words = q("[data-pf-line] > span")
        if (words.length) reveal(words, { yPercent: 115 }, { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.07, delay: 0.05 })

        // blocks (titles, lead text, feature project)
        const wipe = sig === "wipe"
        const blockTo = { ...(TO[sig] ?? TO.rise!), duration: wipe ? 0.7 : 0.9, ease: wipe ? "power4.inOut" : EASE }
        cleanups.push(onceVisible(q("[data-pf-reveal]"), (el) => reveal(el, FROM[sig] ?? FROM.rise!, blockTo)))

        // list items: small stagger per list
        cleanups.push(
          onceVisible(q("[data-pf-items]"), (list) => {
            const items = Array.from(list.querySelectorAll(":scope > [data-pf-item]"))
            if (items.length) reveal(items, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.06 })
          })
        )

        // numbers count up once
        cleanups.push(onceVisible(q("[data-pf-count]"), (el) => gctx.add(() => countUp(el))))

        // light parallax on project covers, inside whichever box actually scrolls (studio canvas or window)
        if (root.dataset.pfParallax === "on") {
          const scroller = scrollerFor(root)
          q<HTMLElement>("img[data-pf-parallax]").forEach((img) => {
            gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: img.parentElement, scroller, start: "top bottom", end: "bottom top", scrub: true } })
          })
          ScrollTrigger.refresh()
        }
        return () => cleanups.forEach((c) => c())
      })
      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [disabled, key], revertOnUpdate: true }
  )
}
