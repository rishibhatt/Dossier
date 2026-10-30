"use client"

import { useEffect, useMemo, useState } from "react"

import { BULLET_HANDOFF_KEY, BULLET_LIMIT, buildBullets, swapVerb, SWAP_VERBS, type BulletInput } from "@/features/tools/bulletGen"
import { CopyText } from "@/features/tools/CopyText"
import { PolishButton } from "@/features/tools/PolishButton"
import { ResumeHandoff } from "@/features/tools/ResumeHandoff"
import { ResultsJump } from "@/features/tools/ResultsJump"
import { useSaved } from "@/features/tools/useSaved"

const FIELDS: { key: Exclude<keyof BulletInput, "action">; label: string; placeholder: string; hint?: string }[] = [
  { key: "tool", label: "Tool or method (optional)", placeholder: "Customer.io", hint: "A keyword the job post asks for, if you used it." },
  { key: "scale", label: "For whom, or how big (optional)", placeholder: "8,000 new users a month" },
  { key: "result", label: "What changed because of it", placeholder: "Raised trial-to-paid conversion", hint: "Start with a verb: raised, cut, saved, grew." },
  { key: "number", label: "The number", placeholder: "34%", hint: "A percentage, an amount, or a before and after: \"from 12 days to 4\"." },
]

export function BulletGenerator() {
  const [v, setV] = useSaved<BulletInput>("bullet", { action: "", tool: "", scale: "", result: "", number: "" })
  /** The text before the last verb swap, so a chip tap can be undone. */
  const [beforeSwap, setBeforeSwap] = useState<string | null>(null)
  const { bullets, notes } = useMemo(() => buildBullets(v), [v])

  useEffect(() => {
    try {
      const handed = sessionStorage.getItem(BULLET_HANDOFF_KEY)
      if (!handed) return
      sessionStorage.removeItem(BULLET_HANDOFF_KEY)
      setV((s) => ({ ...s, action: handed.slice(0, 300) }))
    } catch {
      /* storage blocked: start empty */
    }
  }, [setV])

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form className="grid content-start gap-5 lg:col-span-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="bg-action" className="sp-label">
            What you did, or paste a weak bullet
          </label>
          <textarea
            id="bg-action"
            value={v.action}
            onChange={(e) => {
              setBeforeSwap(null)
              setV((s) => ({ ...s, action: e.target.value.slice(0, 300) }))
            }}
            rows={3}
            placeholder="Responsible for managing the onboarding emails"
            className="sp-field min-h-24 resize-y"
          />
          <div className="mt-3">
            <p className="sp-data" id="bg-swap">
              Swap the opening verb
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="bg-swap">
              {SWAP_VERBS.map((verb) => (
                <button key={verb} type="button" className="sp-chip" disabled={!v.action.trim()} onClick={() => {
                    setBeforeSwap((b) => b ?? v.action)
                    setV((s) => ({ ...s, action: swapVerb(s.action, verb) }))
                  }}>
                  {verb}
                </button>
              ))}
              {beforeSwap !== null ? (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[var(--site-accent-ink)] underline underline-offset-4"
                  onClick={() => {
                    setV((s) => ({ ...s, action: beforeSwap }))
                    setBeforeSwap(null)
                  }}
                >
                  Undo
                </button>
              ) : null}
            </div>
          </div>
        </div>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`bg-${f.key}`} className="sp-label">
              {f.label}
            </label>
            <input
              id={`bg-${f.key}`}
              value={v[f.key]}
              onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value.slice(0, 100) }))}
              placeholder={f.placeholder}
              className="sp-field"
              aria-describedby={f.hint ? `bg-${f.key}-hint` : undefined}
            />
            {f.hint ? (
              <p id={`bg-${f.key}-hint`} className="mt-1.5 text-xs text-[var(--site-ink-2)]">
                {f.hint}
              </p>
            ) : null}
          </div>
        ))}
      </form>

      <div id="bg-results" className="min-w-0 scroll-mt-24 lg:col-span-7">
        <ResultsJump targetId="bg-results" count={bullets.length} noun={["bullet", "bullets"]} />
        {notes.length ? (
          <ul className="mb-6 grid gap-2">
            {notes.map((n) => (
              <li key={n.id} className="flex gap-3 border border-[var(--site-rule)] bg-[var(--site-sheet)] px-4 py-3 text-[0.9375rem]">
                <span className="mt-[0.45em] size-1.5 shrink-0 bg-[var(--site-accent)]" aria-hidden />
                {n.text}
              </li>
            ))}
          </ul>
        ) : null}
        {bullets.length ? (
          <>
            <ol className="border-t border-[var(--site-ink)]">
              {bullets.map((b, k) => (
                <li key={b.formula} className="border-b border-[var(--site-rule)] py-5">
                  <div className="sp-data flex justify-between gap-3">
                    <span>
                      <span className="sp-no">{String(k + 1).padStart(2, "0")}</span> {b.formula}
                    </span>
                    <span className={b.text.length > BULLET_LIMIT ? "text-[var(--site-danger)]" : undefined}>
                      {b.text.length} / {BULLET_LIMIT}
                    </span>
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <p className="text-[1.0625rem] font-medium leading-relaxed">{b.text}</p>
                    <CopyText text={b.text} />
                  </div>
                  <PolishButton key={b.text} kind="bullet" text={b.text} />
                </li>
              ))}
            </ol>
            <ResumeHandoff
              className="mt-10"
              tool="bullet-generator"
              title="Drop it under a job."
              body="Opens the free resume builder with your bullet under a new role. Add the job title and dates, write two more like it, and download the PDF."
              options={bullets.map((b) => ({ label: b.formula, fill: { bullets: [b.text] } }))}
            />
          </>
        ) : notes.length ? null : (
          <p className="border-t border-[var(--site-ink)] pt-5 text-[var(--site-ink-2)]">Type what you did, or paste a bullet from your resume. Rewrites appear here as you type.</p>
        )}
      </div>
    </div>
  )
}
