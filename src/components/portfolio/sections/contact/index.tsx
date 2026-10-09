import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { linkHref, linkLabel, linkText, telHref } from "@/lib/portfolio/links"

import { Arrow, Block, cx, has } from "../primitives"
import type { RenderCtx, SectionModule, TextPath, VariantProps } from "../types"

type P = VariantProps<"contact">
type Row = { label: string; href: string | null; path: TextPath | null; text: string }

/** Every way to reach the person, in order, empty ones dropped (kept as prompts while editing). */
function rows({ section, ctx }: P): Row[] {
  const d = section.data
  const id = section.id
  const out: Row[] = []
  if (has(d.email) || ctx.editing) out.push({ label: "Email", href: has(d.email) ? `mailto:${d.email.trim()}` : null, path: { sectionId: id, field: "email" }, text: d.email })
  if (has(d.phone) || ctx.editing) out.push({ label: "Phone", href: has(d.phone) ? telHref(d.phone) : null, path: { sectionId: id, field: "phone" }, text: d.phone })
  if (has(d.location) || ctx.editing) out.push({ label: "Based in", href: null, path: { sectionId: id, field: "location" }, text: d.location ?? "" })
  d.links.forEach((l, i) => {
    const href = linkHref(l)
    if (href) out.push({ label: linkLabel(l), href, path: { sectionId: id, field: "link", index: i }, text: linkText(l) })
  })
  return out
}

function Value({ r, ctx, className }: { r: Row; ctx: RenderCtx; className?: string }) {
  const { T } = ctx
  const text = r.path ? <T path={r.path} value={r.text} /> : r.text
  if (!r.href || ctx.editing) return <span className={className}>{text}</span>
  const ext = /^https?:/i.test(r.href)
  return (
    <a className={cx("pf-link", className)} href={r.href} {...(ext ? { target: "_blank", rel: "noopener" } : {})}>
      <span className="pf-link__text">{text}</span>
      {ext ? <Arrow up /> : null}
    </a>
  )
}

function Headline({ section, ctx, className }: P & { className: string }) {
  const value = section.data.headline?.trim() || getPortfolioSectionLabel("contact")
  return <ctx.T as="h2" className={className} path={{ sectionId: section.id, field: "headline" }} value={value} attrs={{ "data-pf-reveal": "" }} />
}

function Rows({ list, ctx, className }: { list: Row[]; ctx: RenderCtx; className: string }) {
  if (!list.length) return null
  return (
    <dl className={className} data-pf-items="">
      {list.map((r, i) => (
        <div key={i} data-pf-item="">
          <dt>{r.label}</dt>
          <dd>
            <Value r={r} ctx={ctx} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** Big headline, the primary channel set large, the rest underneath. */
function Statement(p: P) {
  const [lead, ...rest] = rows(p)
  return (
    <div className="pf-wrap pf-contact pf-contact--statement">
      <Headline {...p} className="pf-contact__headline" />
      {lead ? <Value r={lead} ctx={p.ctx} className="pf-contact__lead" /> : null}
      <Rows list={rest} ctx={p.ctx} className="pf-contact__rows" />
    </div>
  )
}

function Footer(p: P) {
  return (
    <div className="pf-contact pf-contact--footer">
      <div className="pf-wrap">
        <Headline {...p} className="pf-contact__headline" />
        <Rows list={rows(p)} ctx={p.ctx} className="pf-contact__rows" />
      </div>
    </div>
  )
}

const boxed = (kind: "card" | "list") =>
  function Boxed(p: P) {
    const { T } = p.ctx
    const title = <T path={{ sectionId: p.section.id, field: "headline" }} value={p.section.data.headline?.trim() || getPortfolioSectionLabel("contact")} />
    return (
      <Block type="contact" title={title} className={`pf-contact pf-contact--${kind}`}>
        <Rows list={rows(p)} ctx={p.ctx} className={cx("pf-contact__rows", kind === "card" && "pf-card")} />
      </Block>
    )
  }

export const contactModule: SectionModule<"contact"> = {
  variants: { statement: Statement, footer: Footer, card: boxed("card"), list: boxed("list") },
  fallback: "list",
  isEmpty: (s) => !has(s.data.email) && !has(s.data.phone) && !has(s.data.location) && !s.data.links.some((l) => linkHref(l)),
}
