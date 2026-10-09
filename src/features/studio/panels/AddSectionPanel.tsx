"use client"

import { Plus } from "lucide-react"

import { canvasRoot, revealSection } from "@/features/studio/canvasDom"
import { PanelFrame } from "@/features/studio/panels/PanelFrame"
import { SECTION_CATALOG } from "@/features/studio/sectionCatalog"
import { addableTypes, insertSection } from "@/features/studio/sectionOps"
import { SectionPreview } from "@/features/studio/SectionPreview"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"
import type { PortfolioSectionType } from "@/types/dossier"

/** Adds the section before Contact, opens its editor, and scrolls the canvas to it with a reveal. */
export function addAndReveal(type: PortfolioSectionType) {
  const id = insertSection(type)
  if (!id) return
  const ui = useStudioUiStore.getState()
  ui.editSection(id, ui.snap === "closed" ? "closed" : "peek")
  requestAnimationFrame(() => revealSection(canvasRoot(), id))
}

/** The section gallery: every section the page can still take, each previewed in the current look. */
export function AddSectionPanel() {
  const active = useStudioUiStore((s) => s.panel === "add")
  const types = usePortfolioStore((s) => s.document?.sections.map((x) => x.type).join(","))
  const present = (types ?? "").split(",").filter(Boolean) as PortfolioSectionType[]
  const list = addableTypes(present)

  return (
    <PanelFrame title="Add a section" hint="Each preview uses your current look and, where it can, your resume.">
      {list.length === 0 ? (
        <p className="border border-[var(--site-rule-strong)] p-4 text-sm text-[var(--site-ink-2)] [border-radius:4px]">
          Your page has every kind of section. Remove one in Edit to add it again somewhere else.
        </p>
      ) : (
        <ul className="ws-gallery" aria-label="Sections you can add">
          {list.map((type) => {
            const { label, blurb, Icon } = SECTION_CATALOG[type]
            return (
              <li key={type} className="ws-gallery-cell">
                {/* Previews mount only while the gallery is open: each is a real section render. */}
                {active ? <SectionPreview type={type} /> : <div className="ws-mini" />}
                <div className="flex items-start gap-3 p-3">
                  <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <span className="font-semibold">{label}</span>
                      {present.includes(type) ? <span className="sp-data">On your page</span> : null}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--site-ink-2)]">{blurb}</p>
                  </div>
                  <button type="button" onClick={() => addAndReveal(type)} aria-label={present.includes(type) ? `Add another ${label} section` : `Add ${label}`} className="site-btn site-btn-secondary site-btn-sm shrink-0">
                    <Plus className="size-4" aria-hidden />
                    <span className="site-btn-label">Add</span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </PanelFrame>
  )
}
