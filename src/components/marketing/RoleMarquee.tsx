"use client"

import { useRef } from "react"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/components/marketing/motion/gsap"

const ROLES = [
  "Freshers",
  "Accountants",
  "Developers",
  "Designers",
  "Teachers",
  "Nurses",
  "Freelancers",
  "Marketers",
  "Career switchers",
  "Engineers",
] as const

export function RoleMarquee() {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const el = track.current
        if (!el) return

        const loop = gsap.to(el, { xPercent: -50, duration: 38, ease: "none", repeat: -1 })

        // Scrolling pushes the belt; it eases back to its resting speed.
        const trigger = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const boost = Math.min(Math.abs(self.getVelocity()) / 400, 5)
            gsap.to(loop, { timeScale: 1 + boost, duration: 0.2, overwrite: true })
            gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: "auto" })
          },
        })

        return () => trigger.kill()
      })
    },
    { scope: root }
  )

  const row = (suffix: string) =>
    ROLES.map((role) => (
      <li
        key={`${role}-${suffix}`}
        aria-hidden={suffix === "b" ? true : undefined}
        className="shrink-0 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-[-0.03em]"
        style={{ fontFamily: "var(--site-display)" }}
      >
        {role}
        <span className="mx-[clamp(1.25rem,3vw,2.5rem)] text-[var(--site-accent)]" aria-hidden>
          /
        </span>
      </li>
    ))

  return (
    <section
      ref={root}
      aria-label="Who Dossier is for"
      className="overflow-hidden border-y border-[var(--site-rule)] bg-[var(--site-paper-deep)] py-6"
    >
      {/* Static, wrapped list when motion is reduced; belt otherwise. */}
      <ul
        ref={track}
        className="flex w-max items-center whitespace-nowrap motion-reduce:hidden"
      >
        {row("a")}
        {row("b")}
      </ul>
      <ul className="site-wrap hidden flex-wrap gap-x-6 gap-y-2 motion-reduce:flex">
        {ROLES.map((role) => (
          <li key={role} className="text-2xl font-bold tracking-[-0.03em]" style={{ fontFamily: "var(--site-display)" }}>
            {role}
          </li>
        ))}
      </ul>
    </section>
  )
}
