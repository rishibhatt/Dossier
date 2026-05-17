"use client"

import type { PropsWithChildren } from "react"

import { messages } from "@/config/messages"
import { findSectionByType } from "@/lib/portfolio/findSection"
import { useDesignEngine } from "@/context/DesignEngineContext"

export function CenteredLayout({ children }: PropsWithChildren) {
  const { document } = useDesignEngine()
  const studio = messages.dossier.studio
  const hero = findSectionByType(document.sections, "hero")
  const navName = hero?.type === "hero" ? hero.data.name : document.meta.title

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-[var(--de-border)] bg-[color-mix(in_oklab,var(--de-elevated)_92%,transparent)] px-[var(--de-pad-x)] py-4 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--de-elevated)_88%,transparent)] sm:py-5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <span className="text-base font-semibold tracking-tight text-[var(--de-fg)]">{navName}</span>
          <nav className="flex flex-wrap gap-6 text-xs font-medium uppercase tracking-widest text-[var(--de-muted)]" aria-label={studio.portfolioNavAria}>
            <a className="hover:text-[var(--de-fg)]" href="#portfolio-section-projects">
              {studio.navWorks}
            </a>
            <a className="hover:text-[var(--de-fg)]" href="#portfolio-section-about">
              {studio.navAbout}
            </a>
            <a className="hover:text-[var(--de-fg)]" href="#portfolio-section-contact">
              {studio.navContact}
            </a>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  )
}
