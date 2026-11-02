"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, X } from "lucide-react"

import { LETTER_HANDOFF_KEY, runLetterScan, type Severity } from "@/features/tools/letterScan"
import { ResultsJump } from "@/features/tools/ResultsJump"
import { useSaved } from "@/features/tools/useSaved"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"

const MIN_WORDS = 80
const MAKER_HREF = "/cover-letter/new?from=checker"
const SEV_LABEL: Record<Severity, string> = { high: "Fix first", medium: "Fix next", low: "Polish" }
const CHECKS = [
  "Company and role named",
  "A greeting to a person",
  "Template gaps left in",
  "Paragraphs and a clear ask",
  "Length, 250 to 400 words",
  "A result with a number",
  "Key words from the job post",
  "Stock phrases and hedges",
]

/** Hands the pasted letter to the maker in this tab only. The job post is already shared through useSaved("ats_jd"). */
function handOff(letter: string) {
  try {
    sessionStorage.setItem(LETTER_HANDOFF_KEY, letter)
  } catch {
    /* storage blocked: the maker opens empty */
  }
  track("tool_to_letter", { tool: "cover-letter-checker" })
}

export function CoverLetterChecker() {
  const [letter, setLetter] = useState("")
  const [jd, setJd] = useSaved("ats_jd", "")
  const [ran, setRan] = useState<{ letter: string; jd: string } | null>(null)
  const words = letter.split(/\s+/).filter(Boolean).length
  const report = useMemo(() => (ran ? runLetterScan(ran.letter, ran.jd) : null), [ran])
  const jdShort = ran ? ran.jd.trim().length > 0 && ran.jd.trim().length < 120 : false
  const foundKw = report?.keywords?.filter((k) => k.found).length ?? 0

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form
        className="min-w-0 lg:col-span-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (words < MIN_WORDS) return
          setRan({ letter, jd })
          track("letter_check_run", { has_job_description: jd.trim().length >= 120, words, source: "tool" })
          if (window.matchMedia("(max-width: 1023px)").matches) {
            const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
            requestAnimationFrame(() => document.getElementById("cl-results")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }))
          }
        }}
      >
        <label htmlFor="cl-letter" className="sp-label">
          1. Your cover letter
        </label>
        <textarea
          id="cl-letter"
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          rows={11}
          placeholder="Paste the whole letter, from the greeting to your name."
          className="sp-field min-h-60 min-w-0 resize-y"
        />
        <p className="sp-data mt-2 flex justify-between gap-3">
          <span>{words} words</span>
          <span>Stays in this browser tab</span>
        </p>

        <label htmlFor="cl-jd" className="sp-label mt-6 block">
          2. The job post <span className="font-normal text-[var(--site-ink-3)]">(recommended)</span>
        </label>
        <textarea
          id="cl-jd"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={8}
          placeholder="Paste the full job post. Without it you still get every check except job match."
          className="sp-field min-h-44 min-w-0 resize-y"
        />
        <button type="submit" disabled={words < MIN_WORDS} className="site-btn site-btn-primary mt-4 w-full">
          <span className="site-btn-label">{words < MIN_WORDS ? `Paste at least ${MIN_WORDS} words of your letter` : ran ? "Check again" : "Check my letter"}</span>
        </button>
      </form>

      <div id="cl-results" className="min-w-0 scroll-mt-24 lg:col-span-7" aria-live="polite">
        <ResultsJump targetId="cl-results" count={report ? report.issues.length : 0} noun={["fix", "fixes"]} />
        {report ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--site-ink)] pb-4">
              <p>
                <span className="block text-sm text-[var(--site-ink-2)]">Letter score</span>
                <span className="text-[4.5rem] font-bold leading-none tracking-[-0.04em]" style={{ fontFamily: "var(--site-display)" }}>
                  {report.score}
                </span>
                <span className="sp-data ml-1">/ 100</span>
              </p>
              <p className="max-w-[20rem] text-sm text-[var(--site-ink-2)] sm:text-right">
                {report.keywords
                  ? `${foundKw} of ${report.keywords.length} key words from the job post appear in your letter.`
                  : jdShort
                    ? "The job post is under 120 characters, so job match is not scored. Paste the full post."
                    : "No job post pasted, so job match is not scored."}
              </p>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {report.parts.map((p) => (
                <li key={p.label}>
                  <div className="flex justify-between text-sm">
                    <span>{p.label}</span>
                    <span className="sp-no">{p.score}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-[var(--site-rule)]" role="presentation">
                    <div className="h-full bg-[var(--site-ink)]" style={{ width: `${p.score}%` }} />
                  </div>
                </li>
              ))}
            </ul>

            {report.keywords ? (
              <section className="mt-10" aria-labelledby="cl-kw-title">
                <h2 id="cl-kw-title" className="site-h3">
                  Key words from the job post
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {report.keywords.map((k) => (
                    <li
                      key={k.term}
                      className={cn(
                        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-sm",
                        k.found ? "border-[var(--site-rule-strong)] bg-[var(--site-sheet)]" : "border-dashed border-[var(--site-danger)] text-[var(--site-danger)]"
                      )}
                    >
                      {k.found ? <Check className="size-3.5 text-[var(--site-ok)]" aria-label="Found" /> : <X className="size-3.5" aria-label="Missing" />}
                      {k.term}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <h2 className="site-h3 mt-10">Fix these, in this order</h2>
            {report.issues.length ? (
              <ol className="mt-4 border-t border-[var(--site-rule)]">
                {report.issues.map((i, k) => (
                  <li key={i.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 border-b border-[var(--site-rule)] py-4">
                    <span className="sp-no text-[var(--site-accent-ink)]">{k + 1}.</span>
                    <div>
                      <p className="font-semibold">
                        {i.title} <span className="sp-data ml-1 font-normal">{SEV_LABEL[i.severity]}</span>
                      </p>
                      {i.evidence ? <p className="sp-data mt-1 break-words">Found: {i.evidence}</p> : null}
                      <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--site-ink-2)]">{i.fix}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="site-body mt-4">Nothing to fix. Read it aloud once, then send it.</p>
            )}

            {report.lineFixes.length ? (
              <section className="mt-10" aria-labelledby="cl-lines-title">
                <h2 id="cl-lines-title" className="site-h3">
                  Lines to rewrite
                </h2>
                <ul className="mt-4 grid gap-4">
                  {report.lineFixes.map((f, k) => (
                    <li key={`${k}-${f.phrase}`} className="border border-[var(--site-rule)] p-4 text-[0.9375rem]">
                      <p className="break-words text-[var(--site-ink-2)]">{f.line}</p>
                      <p className="sp-data mt-2">
                        &ldquo;{f.phrase}&rdquo;: {f.reason}
                      </p>
                      <p className="mt-2 font-medium">{f.fix}</p>
                      <Link
                        href={MAKER_HREF}
                        onClick={() => handOff(ran?.letter ?? letter)}
                        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--site-accent-ink)] underline-offset-4 hover:underline"
                      >
                        Open it in the cover letter maker <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="site-body mt-8 text-[var(--site-ink-2)]">
              This check reads text only. It cannot tell if your story is true or right for the company, and it does not check spelling or grammar. Use the score to decide what to fix first.
            </p>

            <aside className="mt-8 border border-[var(--site-ink)] bg-[var(--site-sheet)] p-5 sm:p-6" aria-label="Next step">
              <p className="site-h3">Fix it in the cover letter maker</p>
              <p className="mt-2 text-[0.9375rem] text-[var(--site-ink-2)]">Your letter and the job post come with you, so there is nothing to paste again.</p>
              <Link href={MAKER_HREF} onClick={() => handOff(ran?.letter ?? letter)} className="site-btn site-btn-primary mt-5 w-full sm:w-auto">
                <span className="site-btn-label">Open in the cover letter maker</span>
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <p className="mt-4 text-sm">
                <Link href="/tools/ats-checker" className="font-semibold text-[var(--site-accent-ink)] underline-offset-4 hover:underline">
                  Check the resume too
                </Link>
              </p>
            </aside>
          </div>
        ) : (
          <div className="sp-cells grid-cols-2 text-sm">
            {CHECKS.map((c, k) => (
              <p key={c} className="flex gap-3 p-4">
                <span className="sp-no text-[var(--site-ink-3)]">{String(k + 1).padStart(2, "0")}</span>
                {c}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
