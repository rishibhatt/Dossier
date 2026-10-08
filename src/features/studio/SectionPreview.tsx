"use client"

import { Component, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"

import { PlainText } from "@/components/portfolio/sections/PlainText"
import { renderSectionVariant } from "@/components/portfolio/sections/registry"
import { PORTFOLIO_CSS } from "@/components/portfolio/styles/portfolioCss"
import { firstVariant, seedSection } from "@/features/studio/sectionOps"
import { portfolioCssVars, portfolioDataAttrs } from "@/lib/design/buildDesignTokens"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { PortfolioSectionType } from "@/types/dossier"

const BASE = 480

class Guard extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Palette-true schematic, used if the real section cannot render here. */
function Schematic({ bg, fg, accent }: { bg: string; fg: string; accent: string }) {
  return (
    <div className="flex h-44 flex-col gap-2 p-5" style={{ background: bg }}>
      <span className="block h-4 w-2/5 rounded-[2px]" style={{ background: fg }} />
      <span className="block h-2 w-4/5 rounded-[2px] opacity-40" style={{ background: fg }} />
      <span className="block h-2 w-3/5 rounded-[2px] opacity-40" style={{ background: fg }} />
      <span className="mt-2 block h-6 w-1/4 rounded-[2px]" style={{ background: accent }} />
    </div>
  )
}

/**
 * The real section component in the current template, drawn at a 480px container and scaled to the card.
 * Uses the person's resume data when there is some, so the preview is what Add will insert.
 */
export function SectionPreview({ type }: { type: PortfolioSectionType }) {
  const doc = usePortfolioStore((s) => s.document)
  const cfg = usePortfolioStore((s) => s.designConfig)
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)
  const section = useMemo(() => seedSection(type), [type])

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / BASE))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!doc || !cfg) return <div ref={box} className="ws-mini" />
  const c = cfg.tokens.colors
  const fallback = <Schematic bg={c.bg} fg={c.text} accent={c.accent} />
  const ctx = { config: cfg, doc: { ...doc, sections: [...doc.sections, section] }, T: PlainText, editing: false }

  return (
    <div ref={box} className="ws-mini" aria-hidden inert>
      <div className="ws-mini-stage" style={{ transform: `scale(${scale})` }}>
        <style href="dossier-portfolio-css" precedence="default">
          {PORTFOLIO_CSS}
        </style>
        <Guard fallback={fallback}>
          <div className="pf" style={portfolioCssVars(cfg) as CSSProperties} {...portfolioDataAttrs(cfg)}>
            <section className={`pf-sec pf-sec--${type}`}>{renderSectionVariant(section, firstVariant(type), ctx)}</section>
          </div>
        </Guard>
      </div>
    </div>
  )
}
