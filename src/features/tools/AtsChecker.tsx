"use client"

import { useMemo, useState } from "react"
import { Check, X } from "lucide-react"

import { runAtsScan, type Severity } from "@/features/tools/atsScan"
import { ToolHandoff } from "@/features/tools/ToolHandoff"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"

const MIN_WORDS = 60
const SEV_LABEL: Record<Severity, string> = { high: "Fix first", medium: "Fix next", low: "Polish" }

export function AtsChecker() {
  const [resume, setResume] = useState("")
  const [jd, setJd] = useState("")
  const [ran, setRan] = useState<{ resume: string; jd: string } | null>(null)
  const words = resume.split(/\s+/).filter(Boolean).length
  const report = useMemo(() => (ran ? runAtsScan(ran.resume, ran.jd) : null), [ran])

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form
        className="lg:col-span-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (words < MIN_WORDS) return
          setRan({ resume, jd })
          track("ats_scan_run", { has_job_description: jd.trim().length >= 120, resume_words: words })
        }}
      >
        <label htmlFor="ats-resume" className="sp-label">
          1. Your resume text
        </label>
        <textarea
          id="ats-resume"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={11}
          placeholder="Open your resume, select all, copy, and paste it here."
          className="sp-field min-h-60 resize-y"
        />
        <p className="sp-data mt-2 flex justify-between">
          <span>{words} words</span>
          <span>Stays in this browser tab</span>
        </p>

        <label htmlFor="ats-jd" className="sp-label mt-6 block">
          2. The job post <span className="font-normal text-[var(--site-ink-3)]">(recommended)</span>
        </label>
        <textarea
          id="ats-jd"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={8}
          placeholder="Paste the full job description. Without it you get the parsing and bullet checks, but no keyword match."
          className="sp-field min-h-44 resize-y"
        />
        <button type="submit" disabled={words < MIN_WORDS} className="site-btn site-btn-primary mt-4 w-full">
          <span className="site-btn-label">{words < MIN_WORDS ? `Paste at least ${MIN_WORDS} words of resume` : ran ? "Scan again" : "Scan my resume"}</span>
        </button>
      </form>

      <div className="min-w-0 lg:col-span-7" aria-live="polite">
        {report ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--site-ink)] pb-4">
              <p>
                <span className="block text-sm text-[var(--site-ink-2)]">ATS score</span>
                <span className="text-[4.5rem] font-bold leading-none tracking-[-0.04em]" style={{ fontFamily: "var(--site-display)" }}>
                  {report.score}
                </span>
                <span className="sp-data ml-1">/ 100</span>
              </p>
              <p className="max-w-[20rem] text-right text-sm text-[var(--site-ink-2)]">
                {report.matchPct === null
                  ? "No job post pasted, so keywords are not scored. Add one for the full scan."
                  : `${report.matchPct}% of the job's weighted keywords found in your resume.`}
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
              <section className="mt-10" aria-labelledby="kw-title">
                <h2 id="kw-title" className="site-h3">
                  Keywords from the job post
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {report.keywords.map((k) => (
                    <li
                      key={k.term}
                      className={cn(
                        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-sm",
                        k.found ? "border-[var(--site-rule-strong)] bg-[var(--site-sheet)]" : "border-[var(--site-danger)] text-[var(--site-danger)]"
                      )}
                    >
                      {k.found ? <Check className="size-3.5 text-[var(--site-ok)]" aria-label="Found" /> : <X className="size-3.5" aria-label="Missing" />}
                      {k.term}
                      {k.found && !k.inExperience ? <span className="sp-data">list only</span> : null}
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
              <p className="site-body mt-4">Nothing to fix. This resume should parse cleanly.</p>
            )}

            {report.bulletFixes.length ? (
              <section className="mt-10" aria-labelledby="bullets-title">
                <h2 id="bullets-title" className="site-h3">
                  Bullets to rewrite
                </h2>
                <ul className="mt-4 grid gap-4">
                  {report.bulletFixes.map((b) => (
                    <li key={b.line} className="border border-[var(--site-rule)] p-4 text-[0.9375rem]">
                      <p className="text-[var(--site-ink-2)]">{b.line}</p>
                      <p className="sp-data mt-2">{b.reason}</p>
                      {b.rewrite ? <p className="mt-2 font-medium">{b.rewrite}</p> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="site-body mt-8 text-[var(--site-ink-2)]">
              This scan reads text only. It cannot see fonts, colours or layout, so check that the PDF opens with selectable text. Real systems differ, so treat the score as a guide to what to fix, not a promise.
            </p>
            <ToolHandoff className="mt-8" title="Fixed it? See it as a website." body="Upload the updated PDF and Dossier sets it as a portfolio site you can send alongside your application." />
          </div>
        ) : (
          <div className="sp-cells grid-cols-2 text-sm">
            {["Keyword match, weighted", "Sections a parser looks for", "Columns, tables and symbols", "Contact details in the header", "Numbers in bullets", "Action verbs and weak openers", "Years and degree asked for", "Job title match", "Bullet rewrites"].map((c, k) => (
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
