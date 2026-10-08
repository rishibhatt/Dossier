"use client"

import { useEffect } from "react"
import Lenis from "lenis"

import { FINE_POINTER, gsap, REDUCED_MOTION, ScrollTrigger } from "@/components/marketing/motion/gsap"

type Pull = { x: (v: number) => void; y: (v: number) => void }

/**
 * Site-wide motion setup, mounted once:
 *  - Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger and Lenis share one clock.
 *  - Magnetic pull for any `[data-magnetic]` element, on fine pointers only.
 * Both are skipped under prefers-reduced-motion. Touch devices keep native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return

    const lenis = new Lenis({ lerp: 0.12, anchors: { offset: -88 } })
    lenis.on("scroll", ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Magnetic buttons: one delegated listener, one pair of quickTo setters per element.
    const pulls = new WeakMap<Element, Pull>()
    let current: HTMLElement | null = null

    const pullFor = (el: HTMLElement): Pull => {
      let p = pulls.get(el)
      if (!p) {
        p = {
          x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
        }
        pulls.set(el, p)
      }
      return p
    }

    const release = () => {
      if (!current) return
      const p = pulls.get(current)
      p?.x(0)
      p?.y(0)
      current = null
    }

    const onMove = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-magnetic]") : null
      if (target !== current) release()
      if (!target) return
      current = target
      const r = target.getBoundingClientRect()
      const p = pullFor(target)
      p.x((e.clientX - (r.left + r.width / 2)) * 0.22)
      p.y((e.clientY - (r.top + r.height / 2)) * 0.32)
    }

    const fine = window.matchMedia(FINE_POINTER).matches
    if (fine) document.addEventListener("pointermove", onMove, { passive: true })

    return () => {
      if (fine) document.removeEventListener("pointermove", onMove)
      release()
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return null
}
