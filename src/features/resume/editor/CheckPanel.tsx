"use client"

import { AlertTriangle, Check } from "lucide-react"
import { useEffect, useId, useMemo, useState } from "react"

import { runAtsScan, type AtsReport } from "@/features/tools/atsScan"

import { useResumeEditor } from "../lib/store"
import { typeset } from "../lib/usePreview"

type Parsed = { text: string; pages: number; links: string[] }

const SEV_ORDER = { high: 0, medium: 1, low: 2 } as const
const SEV_LABEL = { high: "Fix", medium: "Improve", low: "Tip" } as const

/**
 * The ATS check reads the PDF this person would actually send: the typesetter makes it, pdf.js pulls the text
 * back out the way a parser does, and the existing free scanner scores that text. No AI, no upload.
 */
export function CheckPanel({ active }: { active: boolean }) {
  const draft = useResumeEditor((s) => s.draft)
  const [parsed, setParsed] = useState<Parsed | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [jd, setJd] = useState("")
  const jdId = useId()

  useEffect(() => {
    if (!active || !draft) return
    let cancelled = false
    const timer = setTimeout(
      async () => {
        setBusy(true)
        try {
          const out = await typeset(draft.doc, draft.design, "text")
          if (!cancelled) {
            setParsed(out)
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

  const report: AtsReport | null = useMemo(() => (parsed ? runAtsScan(parsed.text, jd) : null), [parsed, jd])
  const issues = report ? [...report.issues].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]) : []

  return (
    <>
      <section className="rz-block" aria-label="ATS check" aria-busy={busy}>
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">ATS check</h2>
          <p className="rz-hint">Scored from the text a parser pulls out of your PDF, not from the form. Nothing is uploaded.</p>
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
                  <td>Pages · links a parser can click</td>
                  <td className="n" />
                  <td className="n">
                    {parsed!.pages} · {parsed!.links.length}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : !error ? (
          <p className="rz-hint">{busy ? "Reading your PDF…" : "Open this tab to run the check."}</p>
        ) : null}
      </section>

      <section className="rz-block" aria-label="Compare with a job post">
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">Compare with a job post</h2>
          <p className="rz-hint">Paste the job description. You’ll see which of its keywords your resume already has and which are missing.</p>
        </div>
        <div className="rz-field">
          <label className="rz-label" htmlFor={jdId}>
            <span>Job description</span>
            {jd.length > 6000 ? <span className="rz-mono">{jd.length}/8000</span> : null}
          </label>
          <textarea id={jdId} className="rz-textarea" rows={5} maxLength={8000} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full job post here" />
        </div>
        {report?.keywords ? (
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p className="rz-hint">
              <span className="rz-mono" style={{ color: "var(--site-ink)" }}>
                {report.matchPct}% match
              </span>{" "}
              · solid keywords are on your resume, dashed ones are missing. Add only what is true for you.
            </p>
            <div className="rz-chips">
              {report.keywords.slice(0, 30).map((k) => (
                <span key={k.term} className="rz-kw" data-hit={k.found}>
                  {k.term}
                  <span className="sr-only">{k.found ? " (on your resume)" : " (missing)"}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {report ? (
        <section className="rz-block" aria-label="What to fix">
          <div className="rz-block-head">
            <h2 className="rz-h">{issues.length ? `What to fix (${issues.length})` : "Nothing to fix"}</h2>
          </div>
          {issues.length === 0 ? (
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
                {i.evidence ? <p className="rz-mono">“{i.evidence}”</p> : null}
              </div>
            ))
          )}
          {report.bulletFixes.length ? (
            <details style={{ marginTop: "1rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, minHeight: "2.75rem", display: "flex", alignItems: "center" }}>
                Bullets that could say more ({report.bulletFixes.length})
              </summary>
              {report.bulletFixes.map((b, k) => (
                <div key={k} className="rz-issue">
                  <span className="rz-issue-mark" data-sev="low">
                    Tip
                  </span>
                  <strong>{b.line}</strong>
                  <p>{b.reason}</p>
                </div>
              ))}
            </details>
          ) : null}
        </section>
      ) : null}

      {parsed ? (
        <section className="rz-block" aria-label="What a parser reads">
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600, minHeight: "2.75rem", display: "flex", alignItems: "center" }}>
              See the text a parser reads
            </summary>
            <pre className="rz-parsed rz-mono">{parsed.text}</pre>
          </details>
        </section>
      ) : null}
    </>
  )
}
