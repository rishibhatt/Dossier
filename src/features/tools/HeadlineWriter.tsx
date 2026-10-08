"use client"

import { useMemo, useState } from "react"

import { CopyText } from "@/features/tools/CopyText"
import { ToolHandoff } from "@/features/tools/ToolHandoff"

const LIMIT = 220

type Input = { role: string; years: string; focus: string; proof: string; audience: string }

function clean(s: string) {
  return s.trim().replace(/\s+/g, " ").replace(/[.\s]+$/, "")
}

function lowerFirst(s: string) {
  return s ? s[0]!.toLowerCase() + s.slice(1) : s
}

/** Six headline shapes. Each drops a part the visitor left blank instead of printing a placeholder. */
export function buildHeadlines(raw: Input): { shape: string; text: string }[] {
  const role = clean(raw.role)
  const focus = clean(raw.focus)
  const proof = clean(raw.proof)
  const audience = clean(raw.audience)
  const years = clean(raw.years)
  if (!role) return []
  const y = years ? `${years}+ years` : ""
  const out: { shape: string; text: string }[] = [
    { shape: "Role and focus", text: focus ? `${role} focused on ${lowerFirst(focus)}` : role },
    { shape: "Role and proof", text: proof ? `${role}. ${proof}.` : `${role}${y ? `, ${y}` : ""}` },
    { shape: "Who you help", text: audience ? `${role} helping ${lowerFirst(audience)}${focus ? ` with ${lowerFirst(focus)}` : ""}` : `${role}${focus ? ` for ${lowerFirst(focus)}` : ""}` },
    { shape: "Experience first", text: `${y ? `${y} as a ` : ""}${y ? lowerFirst(role) : role}${focus ? `. ${focus}` : ""}${proof ? `. ${proof}` : ""}` },
    { shape: "Pipe list", text: [role, focus, proof].filter(Boolean).join(" | ") },
    { shape: "Plain sentence", text: `I'm a ${lowerFirst(role)}${focus ? ` who works on ${lowerFirst(focus)}` : ""}${audience ? ` for ${lowerFirst(audience)}` : ""}.` },
  ]
  const seen = new Set<string>()
  return out.filter((h) => {
    const k = h.text.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const FIELDS: { key: keyof Input; label: string; placeholder: string; hint?: string }[] = [
  { key: "role", label: "Your role or the role you want", placeholder: "Product designer" },
  { key: "focus", label: "What you focus on", placeholder: "Booking and checkout flows" },
  { key: "proof", label: "One result you are proud of", placeholder: "Redesigned checkout for three homestay chains", hint: "A number makes it stronger." },
  { key: "audience", label: "Who you do it for (optional)", placeholder: "Small travel companies" },
  { key: "years", label: "Years of experience (optional)", placeholder: "6" },
]

export function HeadlineWriter() {
  const [v, setV] = useState<Input>({ role: "", years: "", focus: "", proof: "", audience: "" })
  const lines = useMemo(() => buildHeadlines(v), [v])

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form className="grid gap-5 lg:col-span-5" onSubmit={(e) => e.preventDefault()}>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`hw-${f.key}`} className="sp-label">
              {f.label}
            </label>
            <input
              id={`hw-${f.key}`}
              value={v[f.key]}
              inputMode={f.key === "years" ? "numeric" : undefined}
              onChange={(e) => setV((s) => ({ ...s, [f.key]: f.key === "years" ? e.target.value.replace(/\D/g, "").slice(0, 2) : e.target.value.slice(0, 120) }))}
              placeholder={f.placeholder}
              className="sp-field"
              aria-describedby={f.hint ? `hw-${f.key}-hint` : undefined}
            />
            {f.hint ? (
              <p id={`hw-${f.key}-hint`} className="mt-1.5 text-xs text-[var(--site-ink-2)]">
                {f.hint}
              </p>
            ) : null}
          </div>
        ))}
      </form>

      <div className="min-w-0 lg:col-span-7" aria-live="polite">
        {lines.length ? (
          <>
            <ol className="border-t border-[var(--site-ink)]">
              {lines.map((h, k) => (
                <li key={h.shape} className="border-b border-[var(--site-rule)] py-5">
                  <div className="sp-data flex justify-between gap-3">
                    <span>
                      <span className="sp-no">{String(k + 1).padStart(2, "0")}</span> {h.shape}
                    </span>
                    <span className={h.text.length > LIMIT ? "text-[var(--site-danger)]" : undefined}>
                      {h.text.length} / {LIMIT}
                    </span>
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <p className="text-lg font-semibold leading-snug tracking-[-0.01em]">{h.text}</p>
                    <CopyText text={h.text} />
                  </div>
                </li>
              ))}
            </ol>
            <ToolHandoff className="mt-10" title="Your headline goes under your name." body="Upload your resume and Dossier sets it as a site with your name and this line at the top. You can edit it there." />
          </>
        ) : (
          <p className="border-t border-[var(--site-ink)] pt-5 text-[var(--site-ink-2)]">Start with your role. Headlines appear here as you type.</p>
        )}
      </div>
    </div>
  )
}
