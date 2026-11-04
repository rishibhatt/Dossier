"use client"

import { useId, useState } from "react"
import { X } from "lucide-react"

import { useStudioStatus } from "@/features/studio/studioStatus"
import { getProfession, PROFESSION_GROUPS, PROFESSIONS } from "@/lib/portfolio/professions"
import { usePortfolioStore } from "@/store/usePortfolioStore"

/** Native select of every profession, grouped by how the work is shown. Keyboard and phone friendly. */
export function ProfessionSelect({ id, value, onChange }: { id: string; value: string; onChange: (id: string) => void }) {
  return (
    <select id={id} className="sp-field" value={value} onChange={(e) => onChange(e.target.value)}>
      {value ? null : (
        <option value="" disabled>
          Pick your field
        </option>
      )}
      {PROFESSION_GROUPS.map((g) => (
        <optgroup key={g.id} label={g.label}>
          {PROFESSIONS.filter((p) => p.group === g.id).map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

/**
 * Asked once, when the build could not tell someone's field (the model and the resume title disagreed, or
 * neither named one). The best guess is preselected. Closing it keeps the guess and stops asking.
 */
export function ProfessionAsk() {
  const id = useId()
  const ask = usePortfolioStore((s) => Boolean(s.document?.portfolioMeta?.professionAsk))
  const guess = usePortfolioStore((s) => s.document?.portfolioMeta?.profession ?? "")
  const setProfession = usePortfolioStore((s) => s.setProfession)
  const confirmProfession = usePortfolioStore((s) => s.confirmProfession)
  const [picked, setPicked] = useState(guess)
  if (!ask) return null

  const use = () => {
    const p = getProfession(picked)
    if (!p) return
    useStudioStatus.getState().pushHistory()
    setProfession(p.id)
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="absolute inset-x-3 bottom-3 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-4 shadow-[0_12px_32px_-12px_rgba(16,17,20,0.35)] [border-radius:4px] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[22rem]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id={`${id}-title`} className="text-sm font-semibold">
          What field are you in?
        </h2>
        <button type="button" onClick={confirmProfession} aria-label="Close and keep the current field" className="ws-quiet-btn -m-1.5 !p-1.5">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--site-ink-2)]">Your field sets the looks we suggest, the sample images and which profile links come first.</p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          use()
        }}
      >
        <label htmlFor={`${id}-field`} className="sr-only">
          Your field
        </label>
        <div className="min-w-0 flex-1">
          <ProfessionSelect id={`${id}-field`} value={picked} onChange={setPicked} />
        </div>
        <button type="submit" disabled={!picked} className="site-btn site-btn-primary site-btn-sm !h-12 shrink-0">
          <span className="site-btn-label">Use this</span>
        </button>
      </form>
    </section>
  )
}
