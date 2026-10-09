"use client"

import { useRef } from "react"

import { gsap, MOTION_OK, useGSAP } from "@/components/marketing/motion/gsap"

/** Violet highlighter pass over a key phrase. Sweeps in once when it scrolls into view; static when motion is reduced. */
export function Highlight({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.to(el, {
          "--p": 1,
          duration: 0.9,
          delay: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        })
      })
    },
    { scope: ref }
  )

  return (
    <mark ref={ref} className="hl hl-sweep">
      {children}
    </mark>
  )
}
