"use client"

import { useRef } from "react"
import { Check, Copy } from "lucide-react"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/components/marketing/motion/gsap"
import { SAMPLE_PERSON as P } from "@/components/marketing/sample"
import { STYLE_PRESET_UI } from "@/lib/design/stylePresetsUi"
import { PORTFOLIO_STYLE_PRESETS } from "@/lib/design/stylePrompts"

/** Plays a looping timeline only while its card is on screen. Reduced motion keeps the finished state. */
function useLoopWhenVisible(scope: React.RefObject<HTMLElement | null>, build: (tl: gsap.core.Timeline, q: gsap.utils.SelectorFunc) => void) {
  useGSAP(
    () => {
      const el = scope.current
      if (!el) return
      const q = gsap.utils.selector(el)
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.8 })
        build(tl, q)
        ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          end: "bottom 20%",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        })
      })
    },
    { scope }
  )
}

const stage =
  "relative overflow-hidden rounded-3xl border border-[var(--site-rule)] bg-[#fffefb] p-5 shadow-[0_30px_60px_-34px_rgba(16,17,20,0.45)] sm:p-7"

/** Soft stacked card behind each visual, so the stage reads as a layered object instead of a flat box. */
function Backing({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-x-5 -bottom-3 top-6 rotate-[1.2deg] rounded-3xl border border-[var(--site-rule)] bg-[var(--site-paper-deep)]" aria-hidden />
      <div className="absolute inset-x-2.5 -bottom-1.5 top-3 -rotate-[0.8deg] rounded-3xl border border-[var(--site-rule)] bg-white" aria-hidden />
      {children}
    </div>
  )
}

/* 1. Upload: a page is scanned and its parts are pulled out. */
export function UploadVisual() {
  const root = useRef<HTMLDivElement>(null)
  const rows = [
    ["Name", P.name],
    ["Jobs found", String(P.jobs.length)],
    ["Skills found", String(P.skills.length)],
    ["Links found", "1"],
  ] as const

  useLoopWhenVisible(root, (tl, q) => {
    tl.set(q("[data-row]"), { autoAlpha: 0, x: 18 })
      .set(q("[data-tick]"), { scale: 0 })
      .set(q("[data-scan]"), { top: "4%", autoAlpha: 1 })
      .set(q("[data-line]"), { "--p": 0 })
      .to(q("[data-scan]"), { top: "92%", duration: 1.9, ease: "power1.inOut" }, 0.3)
      .to(q("[data-line]"), { "--p": 1, duration: 0.45, stagger: 0.28, ease: "power2.out" }, 0.45)
      .to(q("[data-row]"), { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.32, ease: "power3.out" }, 0.8)
      .to(q("[data-tick]"), { scale: 1, duration: 0.4, stagger: 0.32, ease: "back.out(2.4)" }, 1.0)
      .to(q("[data-scan]"), { autoAlpha: 0, duration: 0.25 }, 2.2)
  })

  return (
    <Backing>
      <div ref={root} className={stage}>
        <div className="grid items-stretch gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="relative overflow-hidden rounded-xl border border-[var(--site-rule)] bg-white p-4" style={{ fontSize: "0.8125rem" }}>
            <p className="font-bold leading-none tracking-tight" style={{ fontFamily: "var(--site-display)", fontSize: "1.25rem" }}>
              <mark className="hl" data-line>{P.name}</mark>
            </p>
            <p className="mt-1.5 text-[var(--site-ink-2)]">{P.role}, {P.city}</p>
            <div className="mt-4 space-y-2.5">
              {P.jobs.map((j) => (
                <p key={j.org} className="leading-snug">
                  <mark className="hl" data-line>{j.title}</mark>, {j.org}
                </p>
              ))}
              <p className="leading-snug text-[var(--site-ink-2)]">{P.jobs[0].line}</p>
              <p className="leading-snug">
                <mark className="hl" data-line>{P.skills.join(", ")}</mark>
              </p>
            </div>
            <span
              data-scan
              className="pointer-events-none absolute inset-x-0 h-12 -translate-y-1/2 bg-gradient-to-b from-transparent via-[var(--site-ink)]/[0.08] to-transparent"
              aria-hidden
            />
            <span data-scan className="pointer-events-none absolute inset-x-0 h-px -translate-y-1/2 bg-[var(--site-ink)]" aria-hidden />
          </div>

          <ul className="flex flex-col justify-center gap-2.5">
            {rows.map(([k, v]) => (
              <li
                key={k}
                data-row
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--site-rule)] bg-white px-4 py-3 text-sm"
              >
                <span className="text-[var(--site-ink-2)]">{k}</span>
                <span className="flex items-center gap-2.5 font-semibold">
                  {v}
                  <span data-tick className="grid size-5 place-items-center rounded-full bg-[var(--site-ink)] text-[var(--site-paper)]">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Backing>
  )
}

/* 2. Look: five styles fan out, each steps to the front in turn. */
const FAN = [
  { x: 0, y: 0, r: 0, s: 1 },
  { x: 24, y: 8, r: 5, s: 0.93 },
  { x: 44, y: 18, r: 9, s: 0.86 },
  { x: -24, y: 8, r: -5, s: 0.93 },
  { x: -44, y: 18, r: -9, s: 0.86 },
] as const

export function LookVisual() {
  const root = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLParagraphElement>(null)
  const note = useRef<HTMLParagraphElement>(null)
  const looks = PORTFOLIO_STYLE_PRESETS.map((k) => STYLE_PRESET_UI[k])

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el)
      const place = (active: number, animate: boolean) => {
        cards.forEach((c, i) => {
          const o = FAN[(i - active + cards.length) % cards.length]!
          const vars = { xPercent: o.x, yPercent: o.y, rotate: o.r, scale: o.s, zIndex: 10 - (((i - active + cards.length) % cards.length) % 5) }
          if (animate) gsap.to(c, { ...vars, duration: 0.85, ease: "power3.inOut", overwrite: true })
          else gsap.set(c, vars)
        })
        const l = looks[active]!
        if (label.current) label.current.textContent = l.name
        if (note.current) note.current.textContent = l.note
      }
      place(0, false)

      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        let active = 0
        const tick = gsap.delayedCall(2.1, function step() {
          active = (active + 1) % cards.length
          place(active, true)
          tick.restart(true)
        })
        tick.pause()
        ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          end: "bottom 20%",
          onToggle: (self) => (self.isActive ? tick.restart(true) : tick.pause()),
        })
      })
    },
    { scope: root }
  )

  return (
    <Backing>
      <div ref={root} className={stage}>
        <div className="relative mx-auto h-[15rem] max-w-[24rem] sm:h-[17rem]">
          {looks.map((l) => (
            <div
              key={l.name}
              data-card
              className="absolute inset-x-[16%] top-[6%] aspect-[4/3] rounded-xl border border-black/10 p-[7%] shadow-[0_18px_32px_-18px_rgba(16,17,20,0.55)]"
              style={{ background: l.bg }}
              aria-hidden
            >
              <span className="block h-[9%] w-[46%] rounded-full" style={{ background: l.ink }} />
              <span className="mt-[5%] block h-[6%] w-[70%] rounded-full opacity-40" style={{ background: l.ink }} />
              <span className="mt-[3.5%] block h-[6%] w-[54%] rounded-full opacity-40" style={{ background: l.ink }} />
              <span className="mt-[9%] block h-[14%] w-[28%] rounded" style={{ background: l.accent }} />
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <p ref={label} className="text-lg font-bold tracking-[-0.02em]" style={{ fontFamily: "var(--site-display)" }} aria-live="off">
            {looks[0]!.name}
          </p>
          <p ref={note} className="mt-0.5 text-sm text-[var(--site-ink-2)]">
            {looks[0]!.note}
          </p>
        </div>
      </div>
    </Backing>
  )
}

/* 3. Publish: the link types itself, the page goes live. */
const URL_TEXT = "dossier-cv.com/p/k3m9x2qa7d"

export function PublishVisual() {
  const root = useRef<HTMLDivElement>(null)
  const typed = useRef<HTMLSpanElement>(null)

  useLoopWhenVisible(root, (tl, q) => {
    const counter = { n: 0 }
    const write = () => {
      if (typed.current) typed.current.textContent = URL_TEXT.slice(0, Math.round(counter.n))
    }
    tl.call(() => {
      counter.n = 0
      write()
    })
      .set(q("[data-live]"), { scale: 0, autoAlpha: 0 })
      .set(q("[data-thumb]"), { autoAlpha: 0, y: 18, scale: 0.97 })
      .set(q("[data-copied]"), { autoAlpha: 0 })
      .set(q("[data-copy]"), { autoAlpha: 1 })
      .to(counter, { n: URL_TEXT.length, duration: 1.7, ease: "none", onUpdate: write }, 0.2)
      .to(q("[data-thumb]"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }, 2.0)
      .to(q("[data-live]"), { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2.2)" }, 2.3)
      .to(q("[data-copy]"), { autoAlpha: 0, duration: 0.2 }, 3.2)
      .to(q("[data-copied]"), { autoAlpha: 1, duration: 0.2 }, 3.25)
  })

  return (
    <Backing>
      <div ref={root} className={stage}>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--site-rule-strong)] bg-white p-2 pl-4">
          <span className="site-mono min-w-0 flex-1 truncate text-sm">
            <span ref={typed}>{URL_TEXT}</span>
            <span className="ml-px inline-block h-4 w-px translate-y-0.5 bg-[var(--site-ink)]" aria-hidden />
          </span>
          <span
            data-live
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--site-ink)] px-3 py-1.5 text-xs font-semibold text-[var(--site-paper)]"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--site-paper)] opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--site-paper)]" />
            </span>
            Live
          </span>
          <span className="relative grid size-9 place-items-center rounded-lg border border-[var(--site-rule)]">
            <Copy data-copy className="size-4" aria-hidden />
            <Check data-copied className="absolute size-4" aria-hidden />
          </span>
        </div>

        <div data-thumb className="mt-4 overflow-hidden rounded-xl border border-[var(--site-rule)] bg-white p-5">
          <p className="text-2xl font-bold leading-none tracking-[-0.04em]" style={{ fontFamily: "var(--site-display)" }}>
            {P.name}
          </p>
          <p className="mt-1.5 text-sm text-[var(--site-ink-2)]">
            {P.role} in {P.city}
          </p>
          <div className="mt-4 space-y-2 border-t border-[var(--site-rule)] pt-3 text-sm">
            {P.jobs.map((j) => (
              <p key={j.org} className="flex justify-between gap-3">
                <span className="font-semibold">{j.org}</span>
                <span className="site-mono text-xs text-[var(--site-ink-2)]">{j.years}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </Backing>
  )
}
