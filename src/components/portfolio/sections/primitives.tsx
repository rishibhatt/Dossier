import type { ReactNode } from "react"

import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { linkHref, linkText } from "@/lib/portfolio/links"
import type { ExperienceEntry, PortfolioSectionType, ProjectEntry } from "@/types/dossier"

import type { RenderCtx, TextPath } from "./types"

/** Server-safe primitives shared by every section module. No hooks, no client imports. */

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ")

export const has = (s: string | null | undefined): s is string => Boolean(s && s.trim())

export function Arrow({ up }: { up?: boolean }) {
  return (
    <svg className="pf-arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        d={up ? "M5 11 11 5M6 5h5v5" : "M3 8h10M9 4l4 4-4 4"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Title + body. In the wide shell the title takes a left column (see shell CSS). */
export function Block({
  type,
  title,
  children,
  className,
}: {
  type: PortfolioSectionType
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx("pf-wrap pf-block", className)}>
      <h2 className="pf-title" data-pf-reveal="">
        {title ?? getPortfolioSectionLabel(type)}
      </h2>
      <div className="pf-body">{children}</div>
    </div>
  )
}

/** "2021 – Present · Leeds" with empty parts dropped. */
export function Meta({ ctx, parts, className }: { ctx: RenderCtx; parts: [TextPath, string | undefined][]; className?: string }) {
  const { T, editing } = ctx
  const shown = parts.filter(([, v]) => editing || has(v))
  if (!shown.length) return null
  return (
    <p className={cx("pf-meta", className)}>
      {shown.map(([path, v], i) => (
        <span key={path.field}>
          {i > 0 ? <span className="pf-sep" aria-hidden="true"> · </span> : null}
          <T path={path} value={v ?? ""} />
        </span>
      ))}
    </p>
  )
}

/** Resume bullets when present, else the description as paragraphs. */
export function Bullets({ ctx, sectionId, index, entry }: { ctx: RenderCtx; sectionId: string; index: number; entry: Pick<ExperienceEntry, "description" | "highlights"> }) {
  const { T } = ctx
  const bullets = (entry.highlights ?? []).filter(has)
  if (bullets.length) {
    return (
      <ul className="pf-bullets">
        {bullets.map((b, j) => (
          <T key={j} as="li" path={{ sectionId, field: "highlights", index, sub: j }} value={b} />
        ))}
      </ul>
    )
  }
  if (!has(entry.description) && !ctx.editing) return null
  return <T as="div" className="pf-prose pf-desc" paragraphs path={{ sectionId, field: "description", index }} value={entry.description} />
}

export function Chips({ items, className }: { items: ReactNode[]; className?: string }) {
  if (!items.length) return null
  return <ul className={cx("pf-chips", className)}>{items.map((c, i) => <li key={i} className="pf-chip">{c}</li>)}</ul>
}

/** External link with visible arrow, full states via .pf-link. */
export function OutLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const h = linkHref(href)
  if (!h) return null
  const ext = /^https?:/i.test(h)
  return (
    <a className={cx("pf-link", className)} href={h} {...(ext ? { target: "_blank", rel: "noopener" } : {})}>
      <span className="pf-link__text">{children}</span>
      {ext ? <Arrow up /> : null}
    </a>
  )
}

export function Media({ src, alt, ratio = "16 / 10", parallax }: { src: string; alt: string; ratio?: string; parallax?: boolean }) {
  return (
    <figure className="pf-media" style={{ aspectRatio: ratio }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" {...(parallax ? { "data-pf-parallax": "" } : {})} />
    </figure>
  )
}

/** One project: optional cover, name, description, tools, link. Shared by every projects variant. */
export function ProjectBody({
  ctx,
  sectionId,
  index,
  p,
  level = "h3",
  media = true,
}: {
  ctx: RenderCtx
  sectionId: string
  index: number
  p: ProjectEntry
  level?: "h3" | "p"
  media?: boolean
}) {
  const { T, editing } = ctx
  const at = (field: string): TextPath => ({ sectionId, field, index })
  const tech = p.tech.filter(has)
  return (
    <>
      {media && has(p.imageUrl) ? <Media src={p.imageUrl.trim()} alt={p.name} parallax /> : null}
      <T as={level} className="pf-item__title" path={at("name")} value={p.name} />
      {editing || has(p.description) ? <T as="div" paragraphs className="pf-prose pf-desc" path={at("description")} value={p.description} /> : null}
      {tech.length || editing ? <T as="p" className="pf-tools" path={at("tech")} value={tech.join(" · ")} /> : null}
      {has(p.link) ? (
        <p className="pf-item__link">
          <OutLink href={p.link}>{linkText(p.link)}</OutLink>
        </p>
      ) : null}
    </>
  )
}
