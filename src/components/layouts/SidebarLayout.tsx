"use client"

import type { PropsWithChildren } from "react"

import { messages } from "@/config/messages"
import { findSectionByType } from "@/lib/portfolio/findSection"
import { useDesignEngine } from "@/context/DesignEngineContext"

export function SidebarLayout({ children }: PropsWithChildren) {
  const { document } = useDesignEngine()
  const studio = messages.dossier.studio
  const hero = findSectionByType(document.sections, "hero")
  const navName = hero?.type === "hero" ? hero.data.name : document.meta.title

  return (
    <div className="flex min-h-[50vh] flex-col lg:flex-row">
      <aside className="sticky top-0 z-30 shrink-0 border-b border-[var(--de-border)] bg-[color-mix(in_oklab,var(--de-elevated)_94%,transparent)] px-5 py-5 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--de-elevated)_88%,transparent)] lg:top-0 lg:max-h-[100dvh] lg:w-56 lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--de-accent)]">Dossier</p>
        <p className="mt-6 text-sm font-semibold tracking-tight text-[var(--de-fg)]">{navName}</p>
        <nav className="mt-8 flex flex-col gap-3 text-sm text-[var(--de-muted)]" aria-label={studio.portfolioNavAria}>
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
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
