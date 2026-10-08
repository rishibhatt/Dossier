import { Fragment, type CSSProperties, type ReactNode, type Ref } from "react"

import { PortfolioShell, type NavItem } from "@/components/layouts/PortfolioShell"
import { DossierCredit } from "@/components/portfolio/DossierCredit"
import { anchorFor } from "@/components/portfolio/sections/anchors"
import { PlainText } from "@/components/portfolio/sections/PlainText"
import { isSectionEmpty, renderSectionVariant, resolveVariant } from "@/components/portfolio/sections/registry"
import type { RenderCtx, TextSlot } from "@/components/portfolio/sections/types"
import { PORTFOLIO_CSS } from "@/components/portfolio/styles/portfolioCss"
import { getPortfolioNavLabel } from "@/config/portfolioSections"
import { portfolioCssVars, portfolioDataAttrs } from "@/lib/design/buildDesignTokens"
import { googleFontsHref } from "@/lib/design/googleFonts"
import { pairSections, templateVariant } from "@/lib/portfolio/pairSections"
import type { DesignConfig, DesignSectionPlan } from "@/types/designEngine"
import type { PortfolioDocument, PortfolioSection } from "@/types/dossier"

export type SectionSurfaceOverrides = Record<string, { bg?: string } | undefined>

export type SectionWrapInfo = { section: PortfolioSection; plan: DesignSectionPlan; index: number; hidden: boolean }

export type PortfolioPageProps = {
  document: PortfolioDocument
  config: DesignConfig
  /** Ids hidden by the owner. Array (published payload) or map (studio store). */
  hidden?: readonly string[] | Record<string, boolean>
  surfaces?: SectionSurfaceOverrides
  credit?: { show: boolean; slug?: string | null; onClick?: () => void }
  /** Text slot; PlainText by default (server + export). */
  T?: TextSlot
  /** Studio edit mode: keep hidden/empty sections so they can be edited. */
  editing?: boolean
  /** Inject the stylesheet and Google Fonts link (off for the static export, which links files). */
  head?: boolean
  rootRef?: Ref<HTMLDivElement>
  wrapSection?: (node: ReactNode, info: SectionWrapInfo) => ReactNode
  wrapList?: (children: ReactNode) => ReactNode
}

const toSet = (h: PortfolioPageProps["hidden"]) =>
  new Set(Array.isArray(h) ? h : Object.entries(h ?? {}).filter(([, v]) => v).map(([k]) => k))

/**
 * The portfolio, as one pure tree: tokens, shell, nav, sections, credit. Rendered by the published
 * page, preview, studio canvas (with edit wrappers) and the ZIP export (react-dom/server).
 */
export function PortfolioPage({
  document: doc,
  config,
  hidden,
  surfaces,
  credit,
  T = PlainText,
  editing = false,
  head = true,
  rootRef,
  wrapSection,
  wrapList,
}: PortfolioPageProps) {
  const ctx: RenderCtx = { config, doc, T, editing }
  const hiddenIds = toSet(hidden)
  const rows = pairSections(doc, config)
    .map((r) => ({ ...r, hidden: hiddenIds.has(r.section.id) }))
    .filter((r) => editing || (!r.hidden && !isSectionEmpty(r.section)))

  const wide = portfolioDataAttrs(config)["data-pf-shell"] === "wide"
  const hero = rows.find((r) => r.section.type === "hero")?.section
  const heroData = hero?.type === "hero" ? hero.data : null

  const navItems: NavItem[] = rows
    .filter((r) => r.section.type !== "hero" && !r.hidden)
    .map((r) => ({ href: `#${anchorFor(r.section, doc)}`, label: getPortfolioNavLabel(r.section.type) }))
  const nav = config.layout.navStyle === "none" || navItems.length < 2 ? null : navItems

  let tone = 0
  const nodes = rows.map(({ section, plan, hidden: isHidden }, index) => {
    const variant = resolveVariant(section.type, plan.variant, templateVariant(config, section.type))
    const alt = !wide && section.type !== "hero" && tone++ % 2 === 1
    const bg = surfaces?.[section.id]?.bg
    const node = (
      <section
        key={section.id}
        id={anchorFor(section, doc)}
        className={`pf-sec pf-sec--${section.type}`}
        data-section-id={section.id}
        data-variant={variant}
        data-tone={alt ? "alt" : undefined}
        style={bg ? ({ background: bg, "--pf-sec-bg": bg } as CSSProperties) : undefined}
      >
        {renderSectionVariant(section, variant, ctx)}
      </section>
    )
    return wrapSection ? <Fragment key={section.id}>{wrapSection(node, { section, plan, index, hidden: isHidden })}</Fragment> : node
  })

  const ty = config.tokens.typography
  return (
    <div
      ref={rootRef}
      id="pf-top"
      className="pf"
      style={portfolioCssVars(config) as CSSProperties}
      {...portfolioDataAttrs(config)}
      data-pf-editing={editing ? "" : undefined}
    >
      {head ? (
        <>
          <style href="dossier-portfolio-css" precedence="default">
            {PORTFOLIO_CSS}
          </style>
          <link rel="stylesheet" href={googleFontsHref([ty.displayFont, ty.bodyFont, ty.monoFont])} precedence="default" />
        </>
      ) : null}
      <a className="pf-skip" href="#pf-content">
        Skip to content
      </a>
      <PortfolioShell nav={nav} name={heroData?.name || doc.meta.title} role={heroData?.title ?? ""}>
        {wrapList ? wrapList(nodes) : nodes}
        {credit?.show ? <DossierCredit slug={credit.slug} onClick={credit.onClick} /> : null}
      </PortfolioShell>
    </div>
  )
}
