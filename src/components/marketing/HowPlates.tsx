import { Check } from "lucide-react"

import type { SamplePerson } from "@/components/marketing/sample"
import { cn } from "@/lib/utils"

/**
 * The four proof plates of the how-it-works story, drawn from the sample resume:
 * 0 the resume as uploaded, 1 the fields the reader found, 2 the site as set, 3 the published link.
 * Pure markup so the same plates serve the pinned desktop story and the stacked phone version.
 */
export function HowPlate({ step, person, className }: { step: number; person: SamplePerson; className?: string }) {
  const p = person
  if (step === 0) {
    return (
      <div className={cn("sheet py-6 pl-12 pr-6 text-[0.8125rem] leading-relaxed", className)}>
        <p className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--site-display)" }}>
          <mark className="hl">{p.name}</mark>
        </p>
        <p className="text-[var(--site-ink-2)]">
          <mark className="hl">{p.role}</mark>, {p.city} / <span className="site-mono">{p.email}</span>
        </p>
        <p className="mt-4 text-[0.6875rem] font-semibold tracking-[0.14em] text-[var(--site-ink-2)]">EXPERIENCE</p>
        {p.jobs.map((j) => (
          <div key={j.org} className="mt-2">
            <p className="flex justify-between gap-3 font-semibold">
              <span>
                <mark className="hl">{j.title}</mark>, {j.org}
              </span>
              <span className="site-mono shrink-0 font-normal text-[var(--site-ink-2)]">{j.years}</span>
            </p>
            <p className="text-[var(--site-ink-2)]">{j.line}</p>
          </div>
        ))}
        <p className="mt-4 text-[0.6875rem] font-semibold tracking-[0.14em] text-[var(--site-ink-2)]">SKILLS</p>
        <p>
          <mark className="hl">{p.skills.join(", ")}</mark>
        </p>
      </div>
    )
  }

  if (step === 1) {
    const rows: [string, string, string][] = [
      ["name", p.name, "Hero"],
      ["role", p.role, "Hero"],
      ["job", `${p.jobs[0]!.title}, ${p.jobs[0]!.org}`, "Experience"],
      ["job", `${p.jobs[1]!.title}, ${p.jobs[1]!.org}`, "Experience"],
      ["skills", `${p.skills.length} found`, "Skills"],
      ["education", p.credential, "Education"],
      ["contact", p.email, "Contact"],
    ]
    return (
      <div className={cn("border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] shadow-[var(--site-lift)]", className)}>
        <div className="sp-data flex justify-between border-b border-[var(--site-rule)] px-4 py-2.5">
          <span>Fields read from resume.pdf</span>
          <span className="sp-no">{String(rows.length).padStart(3, "0")}</span>
        </div>
        <table className="w-full text-[0.8125rem]">
          <thead className="sr-only">
            <tr>
              <th>Field</th>
              <th>Value</th>
              <th>Section</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([field, value, section], k) => (
              <tr key={k} className="border-b border-[var(--site-rule)] last:border-0">
                <td className="sp-data w-20 py-2.5 pl-4 align-top">{field}</td>
                <td className="py-2.5 pr-3 align-top font-medium">{value}</td>
                <td className="py-2.5 pr-4 text-right align-top">
                  <span className="inline-flex items-center gap-1 text-[var(--site-accent-ink)]">
                    <Check className="size-3.5" aria-hidden />
                    {section}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className={cn("frame text-[0.8125rem]", className)} style={{ background: "#f6f3ec", color: "#1c2b3a" }}>
        <div className="frame-bar">
          <span>Proof, look No. 009 Ledger</span>
          <span>Shuffle keeps every word</span>
        </div>
        <div className="p-6">
          <div className="flex justify-between text-xs opacity-70">
            <b className="font-semibold">{p.name}</b>
            <span>Work  Skills  Contact</span>
          </div>
          <p className="mt-8 text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: '"IBM Plex Serif", Georgia, serif' }}>
            {p.name}
          </p>
          <p className="mt-2 max-w-[30ch] opacity-75">
            {p.role} in {p.city}. {p.bio}
          </p>
          <div className="mt-6 border-t border-current/15">
            {p.jobs.map((j) => (
              <div key={j.org} className="flex justify-between gap-3 border-b border-current/15 py-2">
                <span className="font-semibold">{j.org}</span>
                <span className="site-mono text-xs opacity-70">{j.years}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.skills.map((s) => (
              <span key={s} className="border border-current/25 px-2 py-0.5 text-xs" style={{ borderRadius: 2 }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="border border-[var(--site-ink)] bg-[var(--site-sheet)] p-5">
        <p className="sp-data">Published</p>
        <p className="site-mono mt-2 break-all text-lg font-medium sm:text-xl">
          dossier-cv.com/p/<mark className="hl">k3m9x2qa7d</mark>
        </p>
        <div className="mt-4 grid grid-cols-3 gap-px border border-[var(--site-rule)] bg-[var(--site-rule)] text-center text-xs font-medium">
          {["Copy link", "WhatsApp", "LinkedIn"].map((t) => (
            <span key={t} className="bg-[var(--site-paper)] py-3">
              {t}
            </span>
          ))}
        </div>
      </div>
      <dl className="sp-cells grid-cols-2 text-sm">
        <div className="p-4">
          <dt className="sp-data">Search engines</dt>
          <dd className="mt-1 font-medium">Hidden until you switch it on</dd>
        </div>
        <div className="p-4">
          <dt className="sp-data">Changes</dt>
          <dd className="mt-1 font-medium">Republish, same link</dd>
        </div>
      </dl>
    </div>
  )
}
