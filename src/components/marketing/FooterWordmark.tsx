"use client"

import { useEffect, useRef } from "react"

import { FINE_POINTER, gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/components/marketing/motion/gsap"
import { DOTLESS_I, InkDot } from "@/components/marketing/primitives"

function Letters() {
  return (
    <span className="wm-foot-c" data-run>
      Doss
      <span className="wm-i">
        {DOTLESS_I}
        <InkDot />
      </span>
      er
    </span>
  )
}

/**
 * Oversized signature wordmark, fitted to the container width. Two stacked copies: a pale base and an ink
 * copy revealed under the pointer (fine pointers only). On scroll the signature draws on; the dot animates in CSS.
 * Decorative; the real name is in the header and the page title.
 */
export function FooterWordmark() {
  const root = useRef<HTMLDivElement>(null)
  const ink = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = root.current
    const probe = wrap?.querySelector<HTMLElement>(".wm-foot-row")
    if (!wrap || !probe) return
    const fit = () => {
      const w = wrap.clientWidth
      if (!w) return
      wrap.style.setProperty("--fs", "100px")
      const rowW = Array.from(probe.children).reduce((sum, el) => sum + (el as HTMLElement).offsetWidth, 0)
      if (rowW) wrap.style.setProperty("--fs", `${((w / rowW) * 100 * 0.985).toFixed(2)}px`)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    void document.fonts?.ready.then(() => {
      fit()
      ScrollTrigger.refresh()
    })
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const wrap = root.current
      if (!wrap) return
      const mm = gsap.matchMedia()

      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top 94%", once: true } })
        tl.fromTo("[data-run]", { clipPath: "inset(-20% 100% -20% 0%)" }, { clipPath: "inset(-20% -10% -20% 0%)", duration: 1.8, ease: "power2.inOut", clearProps: "clipPath" })
      })

      mm.add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
        const layer = ink.current
        if (!layer) return
        const mx = gsap.quickTo(layer, "--mx", { duration: 0.45, ease: "power3.out" })
        const my = gsap.quickTo(layer, "--my", { duration: 0.45, ease: "power3.out" })
        let r = 0
        const move = (e: PointerEvent) => {
          const b = wrap.getBoundingClientRect()
          mx(e.clientX - b.left)
          my(e.clientY - b.top)
          if (!r) {
            r = Math.max(160, b.width * 0.22)
            gsap.to(layer, { "--r": r, duration: 0.5, ease: "power3.out", overwrite: "auto" })
          }
        }
        const leave = () => {
          r = 0
          gsap.to(layer, { "--r": 0, duration: 0.6, ease: "power3.inOut", overwrite: "auto" })
        }
        wrap.addEventListener("pointermove", move)
        wrap.addEventListener("pointerleave", leave)
        return () => {
          wrap.removeEventListener("pointermove", move)
          wrap.removeEventListener("pointerleave", leave)
        }
      })
    },
    { scope: root }
  )

  return (
    <div className="overflow-hidden" aria-hidden>
      <div className="site-wrap">
        <div ref={root} className="wm-foot">
          <div className="wm-foot-row wordmark">
            <Letters />
          </div>
          <div ref={ink} className="wm-foot-ink">
            <div className="wm-foot-row wordmark">
              <Letters />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
