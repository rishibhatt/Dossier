import { RunningHead } from "@/components/marketing/PageHead"
import type { SamplePerson } from "@/components/marketing/sample"
import type { Specimen } from "@/components/marketing/specimens"

/**
 * Who it is for, shown rather than listed: four sample resumes and the look the engine would suggest for each.
 * Each suggestion is the template whose "best for" list names that profession; names are set in its display face.
 */
export function Audience({ people, specimens }: { people: readonly SamplePerson[]; specimens: Specimen[] }) {
  const byId = new Map(specimens.map((s) => [s.id, s]))
  return (
    <section id="who" aria-labelledby="who-title" className="scroll-mt-20 py-20 sm:py-28">
      <div className="site-wrap">
        <RunningHead label="Who it is for" no="004" />
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="who-title" className="site-h2 lg:col-span-7">
            For people whose job is not making websites.
          </h2>
          <div className="site-lead self-end lg:col-span-5">
            <p>
              Students with a first resume. Accountants, teachers and nurses who want a link that looks as careful as
              their work. Career switchers who need the new story told well.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--site-ink)]">
          <div className="sp-data hidden grid-cols-12 gap-4 border-b border-[var(--site-rule)] py-2 md:grid" aria-hidden>
            <span className="col-span-4">Sample resume</span>
            <span className="col-span-5">What it says</span>
            <span className="col-span-3 text-right">Suggested look</span>
          </div>
          <ul>
            {people.map((p) => {
              const look = byId.get(p.template)
              return (
                <li key={p.id} className="grid grid-cols-1 gap-3 border-b border-[var(--site-rule)] py-6 md:grid-cols-12 md:items-baseline md:gap-4">
                  <div className="md:col-span-4">
                    <p className="text-2xl font-bold tracking-[-0.02em]" style={{ fontFamily: look ? `"${look.display}", var(--site-display)` : "var(--site-display)" }}>
                      {p.name}
                    </p>
                    <p className="text-sm text-[var(--site-ink-2)]">
                      {p.role}, {p.city}
                    </p>
                  </div>
                  <p className="text-[0.9375rem] leading-relaxed md:col-span-5">{p.bio}</p>
                  {look ? (
                    <p className="flex items-center gap-3 md:col-span-3 md:justify-end">
                      <span className="inline-flex size-7 items-center justify-center border border-[var(--site-rule-strong)]" style={{ background: look.swatch.bg }} aria-hidden>
                        <i className="block size-2.5" style={{ background: look.swatch.accent }} />
                      </span>
                      <span className="text-sm">
                        <span className="sp-no text-[var(--site-ink-2)]">No. {look.no}</span> <b className="font-semibold">{look.name}</b>
                      </span>
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
          <p className="mt-3 text-xs text-[var(--site-ink-2)]">Sample people, made up for this page.</p>
        </div>
      </div>
    </section>
  )
}
