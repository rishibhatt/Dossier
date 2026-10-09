import type { MouseEvent } from "react"

import { siteConfig } from "@/config/site"

export type CreditMode = "free" | "none"

export function creditHref(slug?: string | null): string {
  const p = new URLSearchParams({ utm_source: "portfolio", utm_medium: "badge", utm_campaign: "made_with" })
  if (slug) p.set("ref", slug)
  return `${siteConfig.url}/?${p.toString()}`
}

type Props = {
  slug?: string | null
  /** Studio: open the upgrade sheet instead of following the link. */
  onClick?: () => void
}

/**
 * "Made with Dossier" floater: a small paper pill pinned bottom-right of the portfolio (sticky inside the page,
 * so the studio canvas keeps it over the preview, not over the studio UI). Shows the full logo + wordmark on
 * load, tucks into the logo tile after a few seconds, opens again on hover or focus. Pre-rendered SVG, so
 * portfolios never load the brand font. Backlink with UTM tags. Pure, so it renders in the static export too.
 */
export function DossierCredit({ slug, onClick }: Props) {
  const handle = onClick
    ? (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        onClick()
      }
    : undefined
  return (
    <div className="pf-float" data-dossier-credit="">
      <a href={creditHref(slug)} target="_blank" rel="noopener" onClick={handle} aria-label="Made with Dossier: build your own portfolio">
        <svg className="pf-float__tile" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <rect width="40" height="40" rx="10" fill="#0b0c11" />
          <g stroke="#f5f3ff" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 8.2 31.6 13.1 20 18 8.4 13.1 20 8.2Z" fill="#f5f3ff" strokeWidth="1.6" />
            <path d="M8.4 20.1 20 25l11.6-4.9" fill="none" strokeWidth="2.75" />
            <path d="M8.4 27.3 20 32.2l11.6-4.9" fill="none" strokeWidth="2.75" />
          </g>
        </svg>
        <span className="pf-float__label">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG; must work in the ZIP export */}
          <img src={`${siteConfig.url}/brand/made-with-dossier.svg`} alt="" width={140} height={34} decoding="async" />
        </span>
      </a>
    </div>
  )
}