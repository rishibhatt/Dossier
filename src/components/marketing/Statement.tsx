"use client"

import { useRef } from "react"

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/components/marketing/motion/gsap"

/** One large paragraph. Each word fills in from pale to ink as it scrolls through the middle of the screen. */
export function Statement() {
  const root = useRef<HTMLElement>(null)
  const text = useRef<HTMLParagraphElement>(null)

  useGSAP(
    (_ctx, contextSafe) => {
      const p = text.current
      if (!p || !contextSafe) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        void document.fonts.ready.then(
          contextSafe(() => {
            SplitText.create(p, {
              type: "words",
              autoSplit: true,
              onSplit: (self) =>
                gsap.fromTo(
                  self.words,
                  { opacity: 0.16 },
                  {
                    opacity: 1,
                    ease: "none",
                    stagger: 0.12,
                    scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 48%", scrub: 0.5 },
                  }
                ),
            })
          })
        )
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <section ref={root} className="py-24 sm:py-36">
      <div className="site-wrap">
        <p
          ref={text}
          className="max-w-[56rem] text-[clamp(1.875rem,4.8vw,3.875rem)] font-bold leading-[1.08] tracking-[-0.035em]"
          style={{ fontFamily: "var(--site-display)" }}
        >
          A resume lists what you did. A portfolio shows it. Dossier moves your work from one to the other, so your time
          goes into the work and not into building a website.
        </p>
      </div>
    </section>
  )
}
