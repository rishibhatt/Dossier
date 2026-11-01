"use client"

import { useState } from "react"

import { track } from "@/lib/analytics/track"
import { HEARD_FROM, type HeardFrom as Answer } from "@/lib/growth"

const KEY = "dossier:heard_from"

function answeredBefore(): boolean {
  try {
    return localStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}

/**
 * One optional tap: "How did you hear about Dossier?". Fills the gaps UTM tags miss (WhatsApp, word of mouth).
 * Asked once per browser; the server keeps only the first answer per account.
 */
export function HeardFrom() {
  const [hidden] = useState(answeredBefore)
  const [picked, setPicked] = useState<Answer | null>(null)
  if (hidden) return null

  function answer(id: Answer) {
    setPicked(id)
    try {
      localStorage.setItem(KEY, id)
    } catch {
      /* storage blocked: may be asked again, the server ignores repeats */
    }
    track("heard_from_answered", { answer: id })
    void fetch("/api/heard-from", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answer: id }) }).catch(() => null)
  }

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold">{picked ? "Thanks, that helps us a lot." : "How did you hear about Dossier?"}</legend>
      {picked ? null : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {HEARD_FROM.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => answer(h.id)}
              className="inline-flex min-h-9 items-center rounded-full border border-[var(--site-rule-strong)] px-3 text-xs font-medium transition-colors hover:border-[var(--site-ink)] hover:bg-[var(--site-sheet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-accent-ink)]"
            >
              {h.label}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  )
}
