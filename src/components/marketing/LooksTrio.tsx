import Link from "next/link"

import { RunningHead } from "@/components/marketing/PageHead"
import { SiteButton } from "@/components/marketing/primitives"
import type { SamplePerson } from "@/components/marketing/sample"
import type { Specimen } from "@/components/marketing/specimens"
import { ROUTES } from "@/lib/constants/routes"

/** Three looks as far apart as the engine goes: a light serif, a dark grotesque, a loud display face. */
const TRIO = ["ledger", "nocturne", "campaign"]

/**
 * Home section for the website looks: the same sample resume set in three contrasting looks, so the point
 * (the words stay, the design changes) is made without a catalogue. The full index lives at /looks.
 */
export function LooksTrio({ specimens, person }: { specimens: Specimen[]; person: SamplePerson }) {
  const looks = TRIO.map((id) => specimens.find((s) => s.id === id)).filter((s): s is Specimen => Boolean(s))
  const job = person.jobs[0]!

  return (
    <section id="specimens" aria-labelledby="looks-title" className="scroll-mt-20 bg-[var(--site-paper-deep)] py-20 sm:py-28">
      <div className="site-wrap">
        <RunningHead label="Website looks" no="004" />
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="looks-title" className="site-h2 lg:col-span-7">
            Change the look. Keep every word.
          </h2>
          <p className="site-lead self-end lg:col-span-5">
            Each look sets type, colour, layout and hero together. Dossier suggests one from your resume, and you can switch as often as you
            like without retyping anything.
          </p>
        </div>

        <ul className="sp-cells mt-12 grid-cols-1 md:grid-cols-3">
          {looks.map((s) => (
            <li key={s.id} className="flex min-w-0 flex-col">
              <div className="flex min-h-[19rem] flex-col p-5 sm:p-6" style={{ background: s.swatch.bg, color: s.swatch.text }}>
                <p className="sp-data flex justify-between gap-3 !text-current opacity-75">
                  <span className="sp-no">No. {s.no}</span>
                  <span>{s.mode === "dark" ? "Dark" : "Light"}</span>
                </p>
                <p
                  className="mt-auto pt-10 text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-[0.92] tracking-[-0.035em] [overflow-wrap:anywhere]"
                  style={{ fontFamily: `"${s.display}", var(--site-display)` }}
                >
                  {person.name}
                </p>
                <p className="mt-3 text-[0.9375rem] font-semibold leading-snug" style={{ fontFamily: `"${s.display}", var(--site-display)` }}>
                  {person.role}, {person.city}
                </p>
                <p className="mt-1.5 text-sm leading-snug opacity-80">{job.line}</p>
                <span className="mt-5 block h-1 w-12" style={{ background: s.swatch.accent }} aria-hidden />
              </div>
              <div className="flex flex-1 items-baseline justify-between gap-4 border-t border-[var(--site-rule)] bg-[var(--site-paper)] p-4">
                <p className="text-[0.9375rem] font-semibold">{s.name}</p>
                <p className="sp-data text-right">
                  {s.display} / {s.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--site-ink-2)]">Sample person, made up for this page. Names, faces and colours come from the design engine.</p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <SiteButton href={ROUTES.build} size="lg" arrow>
            Upload my resume
          </SiteButton>
          <Link href={ROUTES.looks} className="site-link-mark self-start font-medium sm:self-center">
            Browse all {specimens.length} looks
          </Link>
        </div>
      </div>
    </section>
  )
}
