"use client"

import { useRef, useState } from "react"

import { HowPlate } from "@/components/marketing/HowPlates"
import { RunningHead } from "@/components/marketing/PageHead"
import { DESKTOP, gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/components/marketing/motion/gsap"
import type { SamplePerson } from "@/components/marketing/sample"
import { cn } from "@/lib/utils"

export const HOW_STEPS = [
  {
    title: "Upload the resume you already have",
    body: "A PDF up to 10 MB, from your laptop or straight from your phone's files. Dossier starts from your career history, not from a blank template.",
  },
  {
    title: "Dossier reads it into sections",
    body: "An AI model reads the text and sorts it into your name, roles, jobs, skills, education and contact details. You can check and correct every field.",
  },
  {
    title: "The design engine sets it as a site",
    body: "Type, colour, layout and hero are picked by rules, from a catalogue of looks. Shuffle as often as you like: the words stay exactly where you left them.",
  },
  {
    title: "Publish a link and send it",
    body: "Your site goes live at a Dossier link you can paste into applications, your email signature or a WhatsApp message. Search engines skip it until you say otherwise.",
  },
] as const

/**
 * Four steps, one proof plate each. On desktop the plate column sticks and swaps as each step reaches the
 * middle of the screen; on phones every step carries its own plate. Reduced motion swaps without animating.
 */
export function HowItWorks({ person, headingLevel: H = "h2" }: { person: SamplePerson; headingLevel?: "h1" | "h2" }) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(DESKTOP, () => {
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]")
        steps.forEach((el, k) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => self.isActive && setActive(k),
          })
        })
      })
      mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
        gsap.to("[data-how-progress]", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-steps]", start: "top 55%", end: "bottom 55%", scrub: 0.4 },
        })
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} id="how" aria-labelledby="how-title" className="scroll-mt-20 pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="site-wrap">
        <RunningHead label="How it works" no="002" />
        <div className="grid gap-6 border-b border-[var(--site-rule-strong)] pb-10 lg:grid-cols-12">
          <H id="how-title" className="site-h2 lg:col-span-7">
            From a PDF to a link in four steps.
          </H>
          <p className="site-lead self-end lg:col-span-5">
            Nothing to fill in by hand. The longest part is choosing between looks you like.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 lg:gap-10">
          <ol data-steps className="relative lg:col-span-6">
            <span className="absolute bottom-0 left-0 top-0 hidden w-px bg-[var(--site-rule)] lg:block" aria-hidden>
              <span data-how-progress className="block h-full origin-top scale-y-0 bg-[var(--site-accent)] motion-reduce:scale-y-100" />
            </span>
            {HOW_STEPS.map((s, k) => (
              <li
                key={s.title}
                data-step
                className={cn(
                  "border-b border-[var(--site-rule)] py-10 transition-opacity duration-300 lg:min-h-[62vh] lg:py-16 lg:pl-10",
                  active !== k && "lg:opacity-45"
                )}
              >
                <h3 className="site-h3 max-w-[24ch] text-[clamp(1.5rem,2.6vw,2.125rem)]">
                  <span className="sp-no mr-2 text-[var(--site-accent-ink)]">{k + 1}.</span>
                  {s.title}
                </h3>
                <p className="site-body mt-4">{s.body}</p>
                <HowPlate step={k} person={person} className="mt-8 lg:hidden" />
              </li>
            ))}
          </ol>

          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-24 grid min-h-[70vh] place-items-center py-10">
              <div className="relative w-full max-w-[30rem]">
                {HOW_STEPS.map((s, k) => (
                  <div
                    key={s.title}
                    aria-hidden={active !== k}
                    className={cn(
                      "transition-[opacity,transform] duration-500 [transition-timing-function:var(--site-ease)] motion-reduce:transition-none",
                      k === 0 ? "relative" : "absolute inset-x-0 top-0",
                      active === k ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
                    )}
                  >
                    <HowPlate step={k} person={person} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
