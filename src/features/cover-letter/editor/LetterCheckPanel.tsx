"use client"

import { AlertTriangle, Check } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { typesetLetter } from "@/features/cover-letter/useLetterPreview"
import { runLetterScan, type LetterReport } from "@/features/tools/letterScan"
import { defaultGreeting, defaultSignOff, isNamedRecipient } from "@/lib/cover-letter/renderModel"
import type { CoverLetterDesign, CoverLetterDocument } from "@/lib/cover-letter/schema"
import { track } from "@/lib/analytics"

import { useLetterEditor } from "../lib/store"

type Parsed = { pages: number }

/**
 * The letter as plain text, one blank line between paragraphs, the way the checker expects it. Text pulled back
 * out of the PDF comes line by line with no paragraph breaks, so the closing would read as its last printed line.
 */
function letterText(doc: CoverLetterDocument, design: CoverLetterDesign): string {
  const s = doc.sender
  const head = [s.name, s.headline, [s.email, s.phone, s.location].filter(Boolean).join(" | ")].filter(Boolean)
  const greeting = doc.greeting.trim() || defaultGreeting(doc.recipient.name)
  const signOff = doc.signOff.trim() || defaultSignOff(design.preset, isNamedRecipient(doc))
  const body = doc.paragraphs.map((p) => p.text.trim()).filter(Boolean)
  return [head.join("\n"), greeting, ...body, `${signOff}\n${doc.signature.trim() || s.name}`].filter(Boolean).join("\n\n")
}

const SEV_ORDER = { high: 0, medium: 1, low: 2 } as const
const SEV_LABEL = { high: "Fix first", medium: "Fix next", low: "Polish" } as const

/**
 * The letter check scores the letter's own paragraphs with the free checker's rules, and asks the typesetter
 * only how many pages the PDF runs to. No AI, no upload.
 */
export function LetterCheckPanel({ active }: { active: boolean }) {
  const draft = useLetterEditor((s) => s.draft)
  const [parsed, setParsed] = useState<Parsed | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const tracked = useRef(false)

  useEffect(() => {
    if (!active || !draft) return
    let cancelled = false
    const timer = setTimeout(
      async () => {
        setBusy(true)
        try {
          const out = await typesetLetter(draft.doc, draft.design, "text")
          if (!cancelled) {
            setParsed({ pages: out.pages })
            setError("")
          }
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : "The check could not run.")
        } finally {
          if (!cancelled) setBusy(false)
        }
      },
      parsed ? 1000 : 0,
    )
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // Re-check after edits; `parsed` only picks the delay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, draft?.doc, draft?.design])

  const doc = draft?.doc
  const design = draft?.design
  const report: LetterReport | null = useMemo(
    () =>
      parsed && doc && design
        ? runLetterScan(letterText(doc, design), doc.jobPost, { company: doc.recipient.company, role: doc.job.role, name: doc.sender.name })
        : null,
    [parsed, doc, design],
  )

  useEffect(() => {
    if (!report || tracked.current) return
    tracked.current = true
    track("letter_check_run", { has_job_description: report.matchPct !== null, words: report.stats.words, source: "editor" })
  }, [report])

  const issues = report ? [...report.issues].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]) : []
  const overPage = (parsed?.pages ?? 1) > 1

  return (
    <>
      <section className="rz-block" aria-label="Letter check" aria-busy={busy}>
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">Letter check</h2>
          <p className="rz-hint">Scored from your letter as written. It checks names, structure, length, proof and stock phrases. Nothing is uploaded.</p>
        </div>

        {error ? (
          <div className="rz-error" role="alert">
            <AlertTriangle aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        {report ? (
          <>
            <div className="rz-score" aria-live="polite">
              <b>{report.score}</b>
              <span className="rz-mono">/ 100{busy ? " · checking" : ""}</span>
            </div>
            <p className="rz-hint" style={{ marginTop: "0.5rem" }}>
              {report.keywords
                ? `${report.keywords.filter((k) => k.found).length} of ${report.keywords.length} words from the job ad appear in your letter.`
                : "No job ad pasted in Edit, so job match is not scored."}
            </p>
            <table className="rz-table" style={{ marginTop: "1rem" }}>
              <thead>
                <tr>
                  <th scope="col">Part</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Weight
                  </th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.parts.map((p) => (
                  <tr key={p.label}>
                    <td>{p.label}</td>
                    <td className="n">{p.weight}%</td>
                    <td className="n">{p.score}%</td>
                  </tr>
                ))}
                <tr>
                  <td>Words · pages</td>
                  <td className="n" />
                  <td className="n">
                    {report.stats.words} · {parsed!.pages}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : !error ? (
          <p className="rz-hint">{busy ? "Reading your letter…" : "Open this tab to run the check."}</p>
        ) : null}
      </section>

      {report ? (
        <section className="rz-block" aria-label="What to fix">
          <div className="rz-block-head">
            <h2 className="rz-h">{issues.length || overPage ? `Fix these, in this order (${issues.length + (overPage ? 1 : 0)})` : "Nothing to fix"}</h2>
          </div>
          {overPage ? (
            <div className="rz-issue">
              <span className="rz-issue-mark" data-sev="high">
                Fix first
              </span>
              <strong>Runs to a second page.</strong>
              <p>Cut the longest paragraph, or try Compact spacing in Design. A cover letter should fit on one page.</p>
            </div>
          ) : null}
          {issues.length === 0 && !overPage ? (
            <div className="rz-issue">
              <span className="rz-issue-mark" data-sev="ok">
                <Check aria-hidden width={12} height={12} /> Pass
              </span>
              <strong>Every check passed.</strong>
            </div>
          ) : (
            issues.map((i) => (
              <div key={i.id} className="rz-issue">
                <span className="rz-issue-mark" data-sev={i.severity}>
                  {SEV_LABEL[i.severity]}
                </span>
                <strong>{i.title}</strong>
                <p>{i.fix}</p>
                {i.evidence ? <p className="rz-mono">Found: “{i.evidence}”</p> : null}
              </div>
            ))
          )}
          {report.lineFixes.length ? (
            <details style={{ marginTop: "1rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, minHeight: "2.75rem", display: "flex", alignItems: "center" }}>
                Lines to rewrite ({report.lineFixes.length})
              </summary>
              {report.lineFixes.map((b, k) => (
                <div key={k} className="rz-issue">
                  <span className="rz-issue-mark" data-sev="low">
                    Polish
                  </span>
                  <strong>{b.line}</strong>
                  <p>
                    {b.reason} {b.fix}
                  </p>
                </div>
              ))}
            </details>
          ) : null}
          <p className="rz-hint" style={{ marginTop: "1rem" }}>
            This check reads text only. It cannot tell if your story is true or right for the company. Use the score to decide what to fix first.
          </p>
        </section>
      ) : null}
    </>
  )
}
