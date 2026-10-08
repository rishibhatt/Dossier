"use client"

import { useRef } from "react"

import { gsap, MOTION_OK, useGSAP } from "@/components/marketing/motion/gsap"
import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

export type BuildVisualStep = 0 | 1 | 2

type PortfolioBuildStepperProps = {
  /** 0 = need file, 1 = pick a look, 2 = building */
  visualStep: BuildVisualStep
  /** 0..1 progress through the current step. Used while building. */
  progress?: number
  className?: string
}

/** A slim track cut into three segments. Finished segments are solid, the current one fills as work happens. */
export function PortfolioBuildStepper({ visualStep, progress, className }: PortfolioBuildStepperProps) {
  const names = messages.build.stepNames
  const root = useRef<HTMLElement>(null)
  const fillFor = (i: number) => (i < visualStep ? 1 : i === visualStep ? Math.max(0.12, progress ?? 0.5) : 0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.to("[data-fill]", {
          scaleX: (i: number) => fillFor(i),
          duration: 0.7,
          ease: "power3.out",
        })
      })
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-fill]", { scaleX: (i: number) => fillFor(i) })
      })
    },
    { scope: root, dependencies: [visualStep, progress] }
  )

  return (
    <nav ref={root} aria-label="Build progress" className={cn("w-full", className)}>
      <p className="mb-1.5 text-xs font-semibold text-[var(--site-ink-2)] sm:hidden">
        <span className="text-[var(--site-ink)]">{names[visualStep]}</span> · Step {visualStep + 1} of {names.length}
      </p>
      <ol className="flex gap-1.5 sm:gap-2">
        {names.map((name, i) => {
          const active = i === visualStep
          return (
            <li key={name} className="min-w-0 flex-1" aria-current={active ? "step" : undefined}>
              <span className="block h-1 overflow-hidden rounded-full bg-[var(--site-rule-strong)]" aria-hidden>
                <span
                  data-fill
                  className={cn("block h-full origin-left rounded-full", active ? "bg-[var(--site-accent)]" : "bg-[var(--site-ink)]")}
                  style={{ transform: `scaleX(${fillFor(i)})` }}
                />
              </span>
              <span
                className={cn(
                  "mt-1.5 hidden truncate text-xs font-semibold transition-colors duration-300 sm:block",
                  active ? "text-[var(--site-ink)]" : i < visualStep ? "text-[var(--site-ink-2)]" : "text-[var(--site-ink-2)]/60"
                )}
              >
                {name}
              </span>
              <span className="sr-only">{i < visualStep ? " done" : active ? " current step" : " upcoming"}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
