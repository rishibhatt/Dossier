"use client"

import { useMemo, useRef, useState } from "react"

import { gsap, MOTION_OK, useGSAP } from "@/components/marketing/motion/gsap"
import { RunningHead } from "@/components/marketing/PageHead"
import type { Specimen } from "@/components/marketing/specimens"

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "students", label: "Students", test: (s: Specimen) => /student|graduate|intern|junior|early career|first-time/i.test(s.audience.join(" ")) },
  { id: "tech", label: "Developers", test: (s: Specimen) => /develop|engineer|devops|data/i.test(s.audience.join(" ")) },
  { id: "design", label: "Design and creative", test: (s: Specimen) => /design|artist|writer|illustrat|film|photo/i.test(s.audience.join(" ")) },
  { id: "pro", label: "Finance, law, health", test: (s: Specimen) => /account|finance|lawyer|legal|nurse|health|clinic|pharma|compliance/i.test(s.audience.join(" ")) },
  { id: "people", label: "Teaching, sales, people", test: (s: Specimen) => /teach|tutor|sales|account exec|hr|recruit|people|customer|market/i.test(s.audience.join(" ")) },
  { id: "dark", label: "Dark", test: (s: Specimen) => s.mode === "dark" },
] as const

type FilterId = (typeof FILTERS)[number]["id"]

/**
 * Every look in the engine, as a specimen catalogue: number, name set in its own display face, palette,
 * and who it suits. Ruled cells, dense on purpose. Filtering is instant and keeps numbering stable.
 */
export function SpecimenIndex({ specimens, sample }: { specimens: Specimen[]; sample: string }) {
  const root = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState<FilterId>("all")
  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!
    return specimens.filter((s) => f.test(s))
  }, [filter, specimens])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo("[data-cell]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.015 })
      })
    },
    { scope: root, dependencies: [filter] }
  )

  return (
    <section ref={root} id="specimens" aria-labelledby="specimens-title" className="scroll-mt-20 bg-[var(--site-paper-deep)] py-20 sm:py-28">
      <div className="site-wrap">
        <RunningHead label="Every look" no="003" />
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="specimens-title" className="site-h2 lg:col-span-7">
            {specimens.length} looks. Same words in every one.
          </h2>
          <p className="site-lead self-end lg:col-span-5">
            Each look is a full design: type pairing, palette, layout and hero. Dossier suggests one from your resume.
            You can switch at any time without retyping anything.
          </p>
        </div>

        <div role="toolbar" aria-label="Filter looks" className="-mx-1 mt-10 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className="sp-chip shrink-0">
              {f.label}
              <span className="sp-no text-xs opacity-60">{specimens.filter((s) => f.test(s)).length}</span>
            </button>
          ))}
        </div>

        <ul className="sp-cells mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          {shown.map((s) => (
            <li key={s.id} data-cell className="flex flex-col">
              <div className="flex min-h-36 flex-col justify-between p-4" style={{ background: s.swatch.bg, color: s.swatch.text }}>
                <div className="sp-data flex justify-between !text-current opacity-75">
                  <span className="sp-no">No. {s.no}</span>
                  <span>{s.mode === "dark" ? "Dark" : "Light"}</span>
                </div>
                <p className="mt-6 text-[2rem] font-bold leading-none tracking-[-0.03em]" style={{ fontFamily: `"${s.display}", var(--site-display)` }}>
                  {s.name}
                </p>
                <p className="mt-2 text-[0.9375rem] font-bold leading-tight opacity-80" style={{ fontFamily: `"${s.display}", var(--site-display)` }}>
                  {sample}
                </p>
                <span className="mt-3 block h-1 w-10" style={{ background: s.swatch.accent }} aria-hidden />
              </div>
              <div className="flex flex-1 flex-col gap-2 border-t border-[var(--site-rule)] bg-[var(--site-paper)] p-4">
                <p className="text-sm leading-snug">{s.tagline}</p>
                <p className="sp-data mt-auto">
                  {s.display} / {s.body}
                  <br />
                  {s.layout} layout, {s.hero.toLowerCase()} hero
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--site-ink-2)]">Names, palettes and type are read straight from the design engine.</p>
      </div>
    </section>
  )
}
