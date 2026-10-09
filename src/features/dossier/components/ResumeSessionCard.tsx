"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import { History } from "lucide-react"

import { clearLastSession, parseLastSession, readLastSessionRaw } from "@/lib/portfolio/lastSession"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"

const noop = () => () => {}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

function ago(iso: string): string {
  const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute")
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 48) return rtf.format(hours, "hour")
  return rtf.format(Math.round(hours / 24), "day")
}

/** Offers to reopen the portfolio saved on this device, so a reload or a sign-in round trip never costs the work. */
export function ResumeSessionCard() {
  // Read after mount: the saved session only exists in this browser, so the server render has nothing to show.
  const raw = useSyncExternalStore(noop, readLastSessionRaw, () => null)
  const last = useMemo(() => parseLastSession(raw), [raw])
  const [dismissed, setDismissed] = useState(false)

  if (!last || dismissed) return null

  const reopen = () => {
    usePortfolioStore.getState().hydratePortfolio(last.document, last.designConfig, undefined, last.parsedResume)
    usePortfolioStore.setState({ hiddenSectionIds: last.hiddenSectionIds ?? {} })
    useDossierStore.getState().updatePortfolio(last.document)
  }

  return (
    <div className="ws-card flex flex-col gap-3 !p-3 sm:flex-row sm:items-center sm:!p-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--site-accent-wash)] text-[var(--site-accent-ink)]">
          <History className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-[-0.01em] sm:text-base">Continue your last portfolio</p>
          <p className="truncate text-sm text-[var(--site-ink-2)]">
            {last.document.meta.title || "Untitled portfolio"}, edited {ago(last.savedAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={reopen} className="site-btn site-btn-primary site-btn-sm flex-1 sm:flex-none">
          <span className="site-btn-label">Continue</span>
        </button>
        <button
          type="button"
          onClick={() => {
            clearLastSession()
            setDismissed(true)
          }}
          className="site-btn site-btn-ghost site-btn-sm flex-1 sm:flex-none"
        >
          <span className="site-btn-label">Discard</span>
        </button>
      </div>
    </div>
  )
}
