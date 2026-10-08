import { Check } from "lucide-react"

import { SAMPLE_PERSON as P } from "@/components/marketing/sample"

const DISPLAY = { fontFamily: "var(--site-display)" } as const

const GETS = [
  "Your portfolio saved, so you can close the tab",
  "A public Dossier link to paste into applications",
  "Edit and republish any time, same link",
  "3 design shuffles a day, more with invite credits",
] as const

/**
 * The right half of the auth sheet: what a free account gives you, beside a small specimen of a published
 * page. Desktop only; on phones the form is the whole screen and the subtitle carries the value.
 */
export function AuthArt() {
  return (
    <aside aria-label="What you get" className="hidden flex-col justify-between gap-10 border-l border-[var(--site-ink)] bg-[var(--site-paper-deep)] p-10 lg:flex xl:p-12">
      <div>
        <p className="sp-data flex justify-between border-b border-[var(--site-rule-strong)] pb-2">
          <span>Free account</span>
          <span className="sp-no">$0</span>
        </p>
        <ul className="mt-2">
          {GETS.map((g) => (
            <li key={g} className="flex gap-3 border-b border-[var(--site-rule)] py-3 text-[0.9375rem]">
              <Check className="mt-0.5 size-4 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
              {g}
            </li>
          ))}
        </ul>
      </div>

      <figure aria-hidden className="border border-[var(--site-rule-strong)] bg-[#f6f3ec] text-[#1c2b3a] shadow-[var(--site-lift)]">
        <div className="sp-data flex justify-between border-b border-black/10 px-4 py-2 !text-[#3d4a57]">
          <span>No. 009 Ledger</span>
          <span>dossier-cv.com/p/k3m9x2qa7d</span>
        </div>
        <div className="px-5 py-6">
          <p className="text-[2.25rem] font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: '"IBM Plex Serif", Georgia, serif' }}>
            {P.name}
          </p>
          <p className="mt-2 text-sm opacity-75">
            {P.role}, {P.city}
          </p>
          <div className="mt-5 border-t border-current/15">
            {P.jobs.map((j) => (
              <div key={j.org} className="flex justify-between gap-3 border-b border-current/15 py-2 text-sm">
                <span className="font-semibold">{j.org}</span>
                <span className="site-mono text-xs opacity-70">{j.years}</span>
              </div>
            ))}
          </div>
        </div>
      </figure>
      <p className="-mt-6 text-xs text-[var(--site-ink-2)]" style={DISPLAY}>
        Sample portfolio. Yours uses your resume.
      </p>
    </aside>
  )
}
