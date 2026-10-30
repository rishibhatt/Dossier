"use client"

import { useState } from "react"

import { CopyText } from "@/features/tools/CopyText"
import { track } from "@/lib/analytics"

type State = { kind: "idle" } | { kind: "busy" } | { kind: "done"; text: string } | { kind: "error"; message: string }

const ERRORS: Record<number, string> = {
  429: "That was today's last AI rewrite. The drafts above stay free and unlimited.",
  401: "AI rewrites need a free account. The drafts above stay free and unlimited.",
  503: "AI rewrites are unavailable right now. The drafts above still work.",
}

/** Optional AI rewrite of one rule-based draft. The draft itself never changes; the rewrite shows underneath. */
export function PolishButton({ kind, text, role }: { kind: "summary" | "bullet"; text: string; role?: string }) {
  const [state, setState] = useState<State>({ kind: "idle" })

  const run = async () => {
    setState({ kind: "busy" })
    track("tool_polish", { tool: kind })
    try {
      const res = await fetch("/api/tools-polish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, text, role }) })
      const json = (await res.json().catch(() => ({}))) as { text?: string }
      if (res.ok && json.text) setState({ kind: "done", text: json.text })
      else setState({ kind: "error", message: ERRORS[res.status] ?? "The rewrite did not come back clean. Try again, or keep the draft." })
    } catch {
      setState({ kind: "error", message: "No connection. The drafts above still work offline." })
    }
  }

  if (state.kind === "done") {
    return (
      <div className="mt-3 border border-[var(--site-rule)] bg-[var(--site-sheet)] p-4" role="status">
        <p className="sp-data">AI rewrite. Check every fact before you use it.</p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <p className="leading-relaxed">{state.text}</p>
          <CopyText text={state.text} />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={run}
        disabled={state.kind === "busy"}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--site-accent-ink)] underline decoration-[var(--site-rule-strong)] underline-offset-4 hover:decoration-[var(--site-accent-ink)] disabled:cursor-wait disabled:text-[var(--site-ink-3)]"
      >
        {state.kind === "busy" ? "Rewriting…" : "Polish with AI"}
      </button>
      {state.kind === "error" ? (
        <p role="status" className="mt-1.5 text-xs text-[var(--site-ink-2)]">
          {state.message}
        </p>
      ) : null}
    </div>
  )
}
