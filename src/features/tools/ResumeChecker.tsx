"use client"

import { useMemo, useState } from "react"
import { Check, X } from "lucide-react"

import { runResumeChecks, totalScore } from "@/features/tools/resumeChecks"
import { ToolHandoff } from "@/features/tools/ToolHandoff"
import { cn } from "@/lib/utils"

const MIN_WORDS = 40

export function ResumeChecker() {
  const [text, setText] = useState("")
  const [ran, setRan] = useState<string | null>(null)
  const words = text.split(/\s+/).filter(Boolean).length
  const results = useMemo(() => (ran ? runResumeChecks(ran) : null), [ran])
  const score = results ? totalScore(results) : null
  const ordered = results ? [...results].sort((a, b) => b.weight * (1 - b.score) - a.weight * (1 - a.score)) : []
  const fixes = ordered.filter((r) => r.fix && r.score < 1)

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form
        className="lg:col-span-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (words >= MIN_WORDS) setRan(text)
        }}
      >
        <label htmlFor="resume-text" className="sp-label">
          Resume text
        </label>
        <textarea
          id="resume-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="Open your resume, select all, copy, and paste it here."
          className="sp-field min-h-72 resize-y"
          aria-describedby="resume-text-hint"
        />
        <p id="resume-text-hint" className="sp-data mt-2 flex justify-between">
          <span>{words} words</span>
          <span>Stays in this browser tab</span>
        </p>
        <button type="submit" disabled={words < MIN_WORDS} className="site-btn site-btn-primary mt-4 w-full">
          <span className="site-btn-label">{words < MIN_WORDS ? `Paste at least ${MIN_WORDS} words` : ran ? "Check again" : "Check my resume"}</span>
        </button>
      </form>

      <div className="min-w-0 lg:col-span-7" aria-live="polite">
        {results && score !== null ? (
          <div>
            <div className="flex items-end justify-between gap-4 border-b border-[var(--site-ink)] pb-4">
              <p>
                <span className="block text-sm text-[var(--site-ink-2)]">Score</span>
                <span className="text-[4.5rem] font-bold leading-none tracking-[-0.04em]" style={{ fontFamily: "var(--site-display)" }}>
                  {score}
                </span>
                <span className="sp-data ml-1">/ 100</span>
              </p>
              <p className="max-w-[18rem] text-right text-sm text-[var(--site-ink-2)]">
                {score >= 85 ? "Strong. Small fixes below." : score >= 65 ? "Solid base. Fix the top two items first." : "Worth an hour of edits. Start at the top."}
              </p>
            </div>

            {fixes.length ? (
              <>
                <h2 className="site-h3 mt-8">Fix these, in this order</h2>
                <ol className="mt-4 border-t border-[var(--site-rule)]">
                  {fixes.map((r, k) => (
                    <li key={r.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 border-b border-[var(--site-rule)] py-4">
                      <span className="sp-no text-[var(--site-accent-ink)]">{k + 1}.</span>
                      <div>
                        <p className="font-semibold">{r.label}</p>
                        <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--site-ink-2)]">{r.fix}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : null}

            <h2 className="site-h3 mt-10">All ten checks</h2>
            <table className="mt-4 w-full text-sm">
              <thead className="sp-data text-left">
                <tr className="border-b border-[var(--site-rule)]">
                  <th scope="col" className="py-2 font-normal">Check</th>
                  <th scope="col" className="hidden py-2 font-normal sm:table-cell">Found</th>
                  <th scope="col" className="py-2 text-right font-normal">Points</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const pts = Math.round(r.weight * r.score)
                  const ok = r.score >= 1
                  return (
                    <tr key={r.id} className="border-b border-[var(--site-rule)] align-top">
                      <th scope="row" className="py-3 pr-3 text-left font-medium">
                        <span className="inline-flex items-start gap-2">
                          {ok ? <Check className="mt-0.5 size-4 shrink-0 text-[var(--site-ok)]" aria-label="Passed" /> : <X className="mt-0.5 size-4 shrink-0 text-[var(--site-danger)]" aria-label="Needs work" />}
                          {r.label}
                        </span>
                        <span className="mt-1 block font-normal text-[var(--site-ink-2)] sm:hidden">{r.found}</span>
                      </th>
                      <td className="hidden py-3 pr-3 text-[var(--site-ink-2)] sm:table-cell">{r.found}</td>
                      <td className={cn("sp-no py-3 text-right", !ok && "text-[var(--site-ink-2)]")}>
                        {pts}/{r.weight}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <ToolHandoff className="mt-10" title="Now see it the way a recruiter would." body="Upload the PDF of this resume and Dossier sets it as a portfolio site you can send as a link." />
          </div>
        ) : (
          <div className="sp-cells grid-cols-2 text-sm">
            {["Contact details", "Numbers in your bullets", "Action verbs", "Phrases recruiters skip", "Standard sections", "Length", "A link to your work", "Dates on your roles", "Resume voice", "Easy to skim"].map((c, k) => (
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
