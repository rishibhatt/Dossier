"use client"

import type { CSSProperties } from "react"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { portfolioTypo, SectionTitleFromConfig } from "@/components/portfolio/ui/PortfolioTypography"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { getDirectionOverrides, sectionTitleClassName } from "@/lib/portfolio/directionOverrides"
import { cn } from "@/lib/utils"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioSkillsSection } from "@/types/dossier"

function skillBadgeFaceClass(config: DesignConfig) {
  return config.components.badge === "square-mono"
    ? "de-font-mono text-xs uppercase tracking-wider"
    : "de-font-body text-sm font-medium"
}

function renderSectionTitle(config: DesignConfig, label: string, sectionIndex: number) {
  const o = getDirectionOverrides(config)
  return (
    <SectionTitleFromConfig config={config}>
      {o.showSectionNumbers ? (
        <span className="de-font-display mr-3 inline-block min-w-[2.25ch] text-left text-sm font-bold tabular-nums text-[var(--color-text-muted,var(--de-muted))]">
          {String(sectionIndex + 1).padStart(2, "0")}
        </span>
      ) : null}
      {label}
    </SectionTitleFromConfig>
  )
}

function MarqueeChips({
  items,
  config,
  keyPrefix,
}: {
  items: string[]
  config: DesignConfig
  keyPrefix: string
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 pr-10">
      {items.map((t, i) => (
        <span
          key={`${keyPrefix}-${t}-${i}`}
          className={cn(
            "shrink-0 rounded-full border border-[color-mix(in_oklab,var(--color-border,var(--de-border))_85%,var(--color-primary,var(--de-accent)))] bg-[color-mix(in_oklab,var(--color-surface,var(--de-elevated))_94%,transparent)] px-4 py-2 text-[var(--color-text,var(--de-fg))] shadow-sm backdrop-blur-sm",
            skillBadgeFaceClass(config)
          )}
        >
          <CanvasText as="span" sectionType="skills" field="item" value={t} skillIndex={i} />
        </span>
      ))}
    </div>
  )
}

export function SkillsMarqueeStrip({
  section,
  config,
  sectionIndex,
}: {
  section: PortfolioSkillsSection
  config: DesignConfig
  sectionIndex: number
}) {
  const items = section.data.items.filter(Boolean)
  const label = getPortfolioSectionLabel("skills")
  const duration = Math.min(56, Math.max(22, items.length * 2.8))
  const style = { "--de-skills-marquee-duration": `${duration}s` } as CSSProperties

  if (!items.length) {
    return (
      <section id="portfolio-section-skills" className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
        <h2 className={sectionTitleClassName(config)}>{label}</h2>
        <p className="de-font-body mt-4 text-sm text-[var(--de-muted)]">Add skills to see the marquee.</p>
      </section>
    )
  }

  return (
    <section
      id="portfolio-section-skills"
      style={style}
      className="border-b border-[var(--de-border)] px-[var(--de-pad-x)] py-[var(--de-pad-y)]"
    >
      {renderSectionTitle(config, label, sectionIndex)}
      <div className="skills-marquee-root relative mt-8 overflow-hidden rounded-[var(--effect-radius,0.75rem)] border border-[var(--color-border,var(--de-border))] bg-[color-mix(in_oklab,var(--color-surface,var(--de-elevated))_88%,transparent)] py-4">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--color-bg,var(--de-bg))] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--color-bg,var(--de-bg))] to-transparent"
          aria-hidden
        />
        <div className="de-skills-marquee-inner flex w-max">
          <MarqueeChips items={items} config={config} keyPrefix="a" />
          <MarqueeChips items={items} config={config} keyPrefix="b" />
        </div>
      </div>
      <p className={cn(portfolioTypo.label(), "mt-3 text-[var(--de-muted)]")}>Hover to pause</p>
    </section>
  )
}
