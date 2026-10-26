"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { startResumeWith } from "@/features/tools/startResume"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"

type Fill = Parameters<typeof startResumeWith>[0]

/**
 * The bridge from a writing tool into the resume builder, with the tool's output already placed.
 * With several drafts, the person picks which one goes in; the first is chosen until they do.
 */
export function ResumeHandoff({
  title,
  body,
  options,
  tool,
  className,
}: {
  title: string
  body: string
  options: { label: string; fill: Fill }[]
  tool: string
  className?: string
}) {
  const router = useRouter()
  const [picked, setPicked] = useState(0)
  const choice = options[Math.min(picked, options.length - 1)]
  if (!choice) return null

  return (
    <aside className={cn("border border-[var(--site-ink)] bg-[var(--site-sheet)] p-5 sm:p-6", className)} aria-label="Next step">
      <p className="site-h3">{title}</p>
      <p className="mt-2 text-[0.9375rem] text-[var(--site-ink-2)]">{body}</p>
      {options.length > 1 ? (
        <fieldset className="mt-4">
          <legend className="sp-data">Which version goes in</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((o, k) => (
              <button key={o.label} type="button" className="sp-chip" aria-pressed={k === picked} onClick={() => setPicked(k)}>
                <span className="sp-no">{String(k + 1).padStart(2, "0")}</span> {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <button
        type="button"
        className="site-btn site-btn-primary mt-5 w-full sm:w-auto"
        onClick={() => {
          const id = startResumeWith(choice.fill)
          track("tool_to_resume", { tool, version: choice.label })
          router.push(`/resume/edit?id=${id}`)
        }}
      >
        <span className="site-btn-label">Start a free resume with this</span>
        <ArrowRight className="size-4" aria-hidden />
      </button>
      <p className="sp-data mt-3">Free PDF download. No account needed to start.</p>
    </aside>
  )
}
