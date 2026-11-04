import type { CSSProperties, ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"

import { DossierCredit } from "@/components/portfolio/DossierCredit"
import { siteConfig } from "@/config/site"
import { BrandIcon } from "@/features/tools/BrandIcon"
import { RemoteImage } from "@/features/tools/LinkPageClient"
import { displayUrl, safeImageUrl, THEMES, visibleLinks, type LinkPage } from "@/features/tools/linkPage"

/** Backlinks from a published page, tagged so first-touch attribution (dx_src) records the page it came from. */
export function linkCreditHref(handle?: string | null, path = "/tools/link-in-bio") {
  const p = new URLSearchParams({
    utm_source: "linkinbio",
    utm_medium: "badge",
    utm_campaign: "made_with",
  })
  if (handle) p.set("ref", handle)
  return `${siteConfig.url}${path}?${p.toString()}`
}

type Props = {
  page: LinkPage
  handle?: string | null
  /** The account photo, used when the photo is on and no photo URL was given. */
  avatarUrl?: string | null
  /** Top-right slot: the share button on the public page. */
  action?: ReactNode
  /** In the editor preview links do not navigate away from the editor. */
  preview?: boolean
  /** The public page: fill the viewport. */
  full?: boolean
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")

/** The Marquee ticker runs the bio as short phrases ("Product designer", "Pune", ...), else the name. */
const tickerPhrases = (page: LinkPage, name: string) => {
  const parts = page.bio
    .split(/[.,;|·•]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length ? parts : [name]
}

/**
 * The link-in-bio page itself. The editor's preview and /l/<username> both render this, so the preview is exactly
 * the published page. One markup for all five looks; each look is CSS on [data-theme] (link-page.css), and the two
 * motion looks add a GSAP moment through LinkPageMotion.
 */
export function LinkPageView({ page, handle, avatarUrl, action, preview, full }: Props) {
  const t = THEMES[page.theme] ?? THEMES.specimen
  const { buttons, icons } = visibleLinks(page)
  const vars = {
    "--lp-bg": t.bg,
    "--lp-ink": t.ink,
    "--lp-mute": t.mute,
    "--lp-btn": t.btn,
    "--lp-btn-ink": t.btnInk,
    "--lp-line": t.line,
    "--lp-flood": t.flood,
    "--lp-flood-ink": t.floodInk,
    "--lp-accent": t.accent,
    "--lp-focus": t.focus,
  } as CSSProperties
  const out = preview ? {} : { target: "_blank", rel: "noopener noreferrer me" }
  const name = page.name.trim() || "Your name"
  const initials = <span className="lp-photo lp-initials">{initialsOf(name)}</span>
  const photo = page.photo ? (safeImageUrl(page.photoUrl) ?? safeImageUrl(avatarUrl)) : null
  const phrases = page.theme === "marquee" ? tickerPhrases(page, name) : []

  return (
    <div className={full ? "lp lp-full" : "lp"} style={vars} data-theme={page.theme} data-motion={t.motion || undefined}>
      <div className="lp-col">
        {handle || action ? (
          <div className="lp-head">
            <span className="lp-handle">{handle ? `@${handle}` : null}</span>
            {action}
          </div>
        ) : null}

        <div className="lp-card">
          <div className="lp-id" data-lp-rise>
            {photo ? <RemoteImage key={photo} src={photo} size={96} className="lp-photo" fallback={initials} /> : initials}
            <h1 className="lp-name">
              {/* Keyed: Highlight's SplitText rewrites this span's nodes, so a new name gets a fresh span from React. */}
              <span key={name} data-lp-name>
                {name}
              </span>
            </h1>
            {page.bio.trim() && page.theme !== "marquee" ? <p className="lp-bio">{page.bio}</p> : null}
          </div>

          {phrases.length ? (
            <div className="lp-ticker" data-lp-rise>
              {/* Screen readers get the bio once; the moving copies are decoration. */}
              {page.bio.trim() ? <p className="sr-only">{page.bio}</p> : null}
              <div className="lp-ticker-track" aria-hidden>
                {[0, 1].map((copy) => (
                  <span key={copy}>
                    {Array.from({ length: Math.max(2, Math.ceil(6 / phrases.length)) }, () => phrases)
                      .flat()
                      .map((ph, j) => (
                        <span key={j} className="lp-ticker-item">
                          {ph}
                          <i />
                        </span>
                      ))}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {buttons.length ? (
            <ul className="lp-links">
              {buttons.map((l) => (
                <li key={l.id} data-lp-rise>
                  <a className="lp-btn" href={preview ? undefined : l.href} {...out}>
                    <span className="lp-ico" data-letter={(!l.platform && !l.favicon) || undefined} aria-hidden>
                      {l.platform ? (
                        <BrandIcon name={l.platform.key} />
                      ) : l.favicon ? (
                        <RemoteImage key={l.favicon} src={l.favicon} size={20} className="lp-favicon" fallback={l.title[0]?.toUpperCase()} />
                      ) : (
                        l.title[0]?.toUpperCase()
                      )}
                    </span>
                    <span className="lp-txt">
                      <span className="lp-t" data-label={l.title}>
                        <span>{l.title}</span>
                      </span>
                      <span className="lp-u">{displayUrl(l.href)}</span>
                    </span>
                    <ArrowUpRight className="lp-btn-arrow" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lp-empty">Links you add show here.</p>
          )}

          {icons.length ? (
            <ul className="lp-icons" aria-label="Profiles" data-lp-rise>
              {icons.map((l) => (
                <li key={l.id}>
                  <a className="lp-icon" href={preview ? undefined : l.href} aria-label={l.title} title={l.title} {...out}>
                    <BrandIcon name={l.platform!.key} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* The same "Made with Dossier" floater as published portfolios, pointed back at this tool. */}
      <DossierCredit
        href={preview ? "#" : linkCreditHref(handle)}
        label="Made with Dossier: make your own link page, free"
        onClick={preview ? () => {} : undefined}
      />
    </div>
  )
}
