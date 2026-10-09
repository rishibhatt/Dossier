"use client"

import { useMemo, useState } from "react"

import { CopyText } from "@/features/tools/CopyText"
import { ToolHandoff } from "@/features/tools/ToolHandoff"
import { cn } from "@/lib/utils"

const LIMIT = 2600

type Input = { now: string; work: string; proof: string; next: string; contact: string }

const FIELDS: { key: keyof Input; label: string; placeholder: string }[] = [
  { key: "now", label: "What you do now, in one sentence", placeholder: "I teach Class 3 to 5 at a school in Lucknow." },
  { key: "work", label: "What a normal week involves", placeholder: "Planning reading lessons, running small groups, and meeting parents." },
  { key: "proof", label: "Something you made happen", placeholder: "I wrote the reading programme that four sections now use." },
  { key: "next", label: "What you want next", placeholder: "I am moving into instructional design for education companies." },
  { key: "contact", label: "How people should reach you", placeholder: "Message me here or email sana@example.com." },
]

function sentence(s: string) {
  const t = s.trim().replace(/\s+/g, " ")
  if (!t) return ""
  const cap = t[0]!.toUpperCase() + t.slice(1)
  return /[.!?]$/.test(cap) ? cap : `${cap}.`
}

/** Three lengths built from the same answers, in the order people read an About section. */
export function buildAbouts(v: Input): { name: string; text: string }[] {
  const s = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sentence(x)])) as Input
  if (!s.now) return []
  const short = [s.now, s.proof, s.contact].filter(Boolean).join(" ")
  const standard = [[s.now, s.work].filter(Boolean).join(" "), s.proof, [s.next, s.contact].filter(Boolean).join(" ")].filter(Boolean).join("\n\n")
  const story = [
    s.next ? `${s.next} Here is where that comes from.` : "",
    [s.now, s.work].filter(Boolean).join(" "),
    s.proof ? `The part I am proudest of: ${s.proof[0]!.toLowerCase()}${s.proof.slice(1)}` : "",
    s.contact,
  ]
    .filter(Boolean)
    .join("\n\n")
  return [
    { name: "Short", text: short },
    { name: "Standard", text: standard },
    { name: "Story", text: story },
  ].filter((a, i, arr) => a.text && arr.findIndex((b) => b.text === a.text) === i)
}

export function AboutBuilder() {
  const [v, setV] = useState<Input>({ now: "", work: "", proof: "", next: "", contact: "" })
  const versions = useMemo(() => buildAbouts(v), [v])
  const [tab, setTab] = useState(1)
  const current = versions[Math.min(tab, versions.length - 1)]

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <form className="grid gap-5 lg:col-span-5" onSubmit={(e) => e.preventDefault()}>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`ab-${f.key}`} className="sp-label">
              {f.label}
            </label>
            <textarea
              id={`ab-${f.key}`}
              rows={2}
              value={v[f.key]}
              onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value.slice(0, 400) }))}
              placeholder={f.placeholder}
              className="sp-field resize-y"
            />
          </div>
        ))}
      </form>

      <div className="min-w-0 lg:col-span-7" aria-live="polite">
        {current ? (
          <>
            <div role="tablist" aria-label="Length" className="flex gap-2">
              {versions.map((a, k) => (
                <button key={a.name} role="tab" type="button" aria-selected={current.name === a.name} onClick={() => setTab(k)} className="sp-chip">
                  {a.name}
                </button>
              ))}
            </div>
            <div role="tabpanel" className="mt-4 border border-[var(--site-ink)] bg-[var(--site-sheet)] p-5 sm:p-6">
              <p className="whitespace-pre-line text-[1.0625rem] leading-relaxed">{current.text}</p>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--site-rule)] pt-4">
                <span className={cn("sp-data", current.text.length > LIMIT && "!text-[var(--site-danger)]")}>
                  {current.text.length} / {LIMIT} characters
                </span>
                <CopyText text={current.text} />
              </div>
            </div>
            <ToolHandoff className="mt-10" title="The same words can open your portfolio." body="Upload your resume and paste this into the intro of your Dossier site. One story, everywhere you apply." />
          </>
        ) : (
          <p className="border-t border-[var(--site-ink)] pt-5 text-[var(--site-ink-2)]">Answer the first question to see your About section take shape.</p>
        )}
      </div>
    </div>
  )
}
