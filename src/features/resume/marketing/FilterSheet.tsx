"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { SlidersHorizontal, X } from "lucide-react"

/**
 * The directory's filters. From 1024px they sit in a sticky rail and this wrapper does nothing. Below that a
 * sticky bar opens them as a bottom sheet (85vh at most) with "Show n" and "Clear" in the thumb zone. Choosing
 * a chip is a link, so the sheet stays open while several filters are picked; Show closes it.
 * Returns siblings so the caller's grid places the rail and the phone bar sticks over the whole results list.
 */
export function FilterSheet({ active, results, clearHref, children }: { active: number; results: number; clearHref: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const narrow = window.matchMedia("(max-width: 1023px)")
    if (narrow.matches) document.documentElement.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.documentElement.style.overflow = ""
    }
  }, [open])

  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }

  return (
    <>
      <div className="sticky top-[3.75rem] z-30 -mx-[clamp(1rem,4vw,2rem)] border-b border-[var(--site-rule-strong)] bg-[var(--site-paper)] px-[clamp(1rem,4vw,2rem)] lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3">
          <button ref={trigger} type="button" className="sp-chip" aria-expanded={open} aria-controls="tpl-filters" onClick={() => setOpen(true)}>
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters{active ? ` (${active})` : ""}
          </button>
          <span className="sp-data">
            {results} {results === 1 ? "template" : "templates"}
          </span>
        </div>
      </div>

      {open ? <div className="fixed inset-0 z-[55] bg-[rgba(16,17,20,0.18)] lg:hidden" aria-hidden onClick={close} /> : null}

      <div
        ref={panel}
        id="tpl-filters"
        tabIndex={-1}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Filters"
        data-open={open}
        className="hidden outline-none data-[open=true]:fixed data-[open=true]:inset-x-0 data-[open=true]:bottom-0 data-[open=true]:z-[60] data-[open=true]:flex data-[open=true]:max-h-[85vh] data-[open=true]:flex-col data-[open=true]:border-t data-[open=true]:border-[var(--site-ink)] data-[open=true]:bg-[var(--site-paper)] lg:!sticky lg:top-24 lg:col-span-3 lg:!flex lg:!max-h-none lg:self-start lg:!border-0 lg:!bg-transparent lg:pr-8"
      >
        <div className="flex items-center justify-between border-b border-[var(--site-rule)] px-4 py-3 lg:hidden">
          <span className="font-semibold">Filters</span>
          <button type="button" className="sp-chip !px-3" onClick={close} aria-label="Close filters">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:overflow-visible lg:p-0">{children}</div>
        <div className="grid grid-cols-2 gap-3 border-t border-[var(--site-rule)] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 lg:hidden">
          <Link href={clearHref} className="site-btn site-btn-secondary" onClick={() => setOpen(false)}>
            <span className="site-btn-label">Clear</span>
          </Link>
          <button type="button" className="site-btn site-btn-primary" onClick={close}>
            <span className="site-btn-label">Show {results}</span>
          </button>
        </div>
      </div>
    </>
  )
}
