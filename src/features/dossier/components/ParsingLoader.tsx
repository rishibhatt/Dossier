"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"

import { clock, statusFor } from "@/features/dossier/components/live-build/buildCopy"
import { LiveBuild } from "@/features/dossier/components/live-build/LiveBuild"
import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"
import { BUILD_STEPS, buildStepsDone, useParseProgressStore } from "@/store/useParseProgressStore"

/** The AI read can be silent for half a minute; past this, say so calmly. */
const SLOW_AFTER_MS = 20_000

function useNow(on: boolean) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!on) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [on])
  return now
}

/** The build screen: the live site, four step cells, an honest status line with the clock, and Cancel. */
export function ParsingLoader({ className, onCancel, frozen }: { className?: string; onCancel?: () => void; frozen?: boolean }) {
  const stage = useParseProgressStore((s) => s.stageIndex)
  const startedAt = useParseProgressStore((s) => s.startedAt)
  const fallback = useParseProgressStore((s) => s.preview.source === "fallback")
  const now = useNow(!frozen)
  const [stageAt, setStageAt] = useState({ stage, at: now })
  if (stageAt.stage !== stage) setStageAt({ stage, at: now })

  const elapsed = startedAt ? now - startedAt : 0
  const done = buildStepsDone(stage)
  const slow = !frozen && stage >= 1 && stage < 2 && now - stageAt.at > SLOW_AFTER_MS

  return (
    <div className={cn("mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3", className)}>
      <h1 className="text-[1.5rem] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[2rem]" style={{ fontFamily: "var(--site-display)" }}>
        {messages.build.parsingHeading}
      </h1>

      <div className="flex min-h-0 flex-1 flex-col">
        <LiveBuild elapsed={clock(elapsed)} />
      </div>

      <ol className="lb-steps" aria-label="Build steps">
        {BUILD_STEPS.map((s, i) => {
          const isDone = i < done
          const on = i === done
          return (
            <li key={s.id} data-state={isDone ? "done" : on ? "on" : "wait"} aria-current={on ? "step" : undefined}>
              <span className="sp-no">{isDone ? <Check className="size-3" strokeWidth={3} aria-hidden /> : String(i + 1).padStart(2, "0")}</span>
              <span className="truncate">{s.label}</span>
              <span className="sr-only">{isDone ? "done" : on ? "in progress" : "waiting"}</span>
            </li>
          )
        })}
      </ol>

      <div className="flex items-center gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="truncate text-sm font-semibold" role="status">
            {statusFor(stage)}
            <span className="sp-data ml-2 font-normal tabular-nums">{Math.floor(elapsed / 1000)}s</span>
          </p>
          <p className={cn("text-xs leading-snug text-[var(--site-ink-2)]", fallback && "text-[var(--site-accent-ink)]")}>
            {fallback ? "Read without AI: check the fields in the editor." : slow ? "Reading takes longer on long resumes. It is still going." : "Keep this tab open."}
          </p>
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="site-btn site-btn-ghost site-btn-sm shrink-0">
            <span className="site-btn-label">Cancel</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
