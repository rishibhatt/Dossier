"use client"

import { useMemo } from "react"
import { Check } from "lucide-react"

import { linkHref } from "@/lib/portfolio/links"
import { isImageSrc } from "@/lib/portfolio/media"
import { portfolioGroup } from "@/lib/portfolio/professions"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { PortfolioDocument } from "@/types/dossier"

type Item = { label: string; done: boolean }

const filled = (v: string | null | undefined) => Boolean(v?.trim())

/** Visual and performing fields are judged on the work itself: ask for pictures or a video. */
function mediaItem(doc: PortfolioDocument | null, shown: PortfolioDocument["sections"]): Item[] {
  const group = portfolioGroup(doc?.portfolioMeta)
  if (group === "visual") {
    const pictures = shown.some((s) => (s.type === "gallery" && s.data.items.some((g) => isImageSrc(g.imageUrl))) || (s.type === "projects" && s.data.items.some((p) => isImageSrc(p.imageUrl))))
    return [{ label: "Pictures of your work (Gallery)", done: pictures }]
  }
  if (group === "performer") return [{ label: "A video of your work (Showreel)", done: shown.some((s) => s.type === "showreel" && s.data.items.some((v) => v.videoUrl.trim())) }]
  return []
}

/** What a recruiter looks for on a portfolio, checked against the visible sections. */
export function readiness(doc: PortfolioDocument | null, hidden: Record<string, boolean>): Item[] {
  const shown = (doc?.sections ?? []).filter((s) => !hidden[s.id])
  const hero = shown.find((s) => s.type === "hero")
  const about = shown.find((s) => s.type === "about")
  const contact = shown.find((s) => s.type === "contact")
  const work = shown.some((s) => (s.type === "experience" || s.type === "projects") && s.data.items.length > 0)
  return [
    { label: "Your name and role", done: hero?.type === "hero" && filled(hero.data.name) && filled(hero.data.title) },
    { label: "A short intro about you", done: (hero?.type === "hero" && filled(hero.data.tagline)) || (about?.type === "about" && filled(about.data.body)) },
    { label: "Experience or a project", done: work },
    { label: "A way to reach you", done: contact?.type === "contact" && (filled(contact.data.email) || filled(contact.data.phone)) },
    { label: "A profile link (LinkedIn, GitHub...)", done: contact?.type === "contact" && contact.data.links.some((l) => /^https?:/i.test(linkHref(l) ?? "")) },
    ...mediaItem(doc, shown),
  ]
}

/**
 * "3 of 5 ready" before the first publish: a nudge, never a gate. Publishing works at any count, because a
 * live page with gaps still beats a perfect draft nobody sees.
 */
export function PublishChecklist() {
  // Select the inputs, not the derived list: a new array per render would make the store re-render forever.
  const doc = usePortfolioStore((s) => s.document)
  const hidden = usePortfolioStore((s) => s.hiddenSectionIds)
  const items = useMemo(() => readiness(doc, hidden), [doc, hidden])
  const done = items.filter((i) => i.done).length
  return (
    <div className="mb-3 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-3 [border-radius:4px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">{done === items.length ? "Ready to publish" : "Before you publish"}</p>
        <p className="sp-data sp-no">
          {done} of {items.length} ready
        </p>
      </div>
      <div className="mt-2 h-1 overflow-hidden bg-[var(--site-rule)]" aria-hidden>
        <div className="h-full origin-left bg-[var(--site-ink)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ transform: `scaleX(${done / items.length})` }} />
      </div>
      <ul className="mt-3 grid gap-1.5">
        {items.map((i) => (
          <li key={i.label} className={`flex items-center gap-2 text-sm ${i.done ? "" : "text-[var(--site-ink-2)]"}`}>
            <span
              className={`grid size-4 shrink-0 place-items-center rounded-full border ${i.done ? "border-[var(--site-ink)] bg-[var(--site-ink)] text-[var(--site-paper)]" : "border-[var(--site-rule-strong)]"}`}
              aria-hidden
            >
              {i.done ? <Check className="size-3" strokeWidth={3} /> : null}
            </span>
            {i.label}
            <span className="sr-only">{i.done ? "(done)" : "(not yet)"}</span>
          </li>
        ))}
      </ul>
      {done < items.length ? <p className="mt-2 text-xs text-[var(--site-ink-2)]">Add these in Edit. You can publish now and fill them in later.</p> : null}
    </div>
  )
}

