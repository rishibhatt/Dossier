import { firstOfType } from "../anchors"
import { Arrow, cx, has, Media } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

type P = VariantProps<"hero">

const at = (s: P["section"], field: string) => ({ sectionId: s.id, field })

function Name({ section, ctx, className }: P & { className?: string }) {
  return <ctx.T as="h1" split className={cx("pf-hero__name", className)} path={at(section, "name")} value={section.data.name} />
}

function Role({ section, ctx }: P) {
  if (!has(section.data.title) && !ctx.editing) return null
  return <ctx.T as="p" className="pf-hero__role" path={at(section, "title")} value={section.data.title} attrs={{ "data-pf-reveal": "" }} />
}

function Tagline({ section, ctx }: P) {
  if (!has(section.data.tagline) && !ctx.editing) return null
  return <ctx.T as="p" className="pf-hero__tagline" path={at(section, "tagline")} value={section.data.tagline} attrs={{ "data-pf-reveal": "" }} />
}

/** Real destinations only: email if present, then the first work section that exists. */
function Ctas({ ctx }: { ctx: P["ctx"] }) {
  const email = firstOfType(ctx.doc, "contact")?.data.email?.trim()
  const work = firstOfType(ctx.doc, "projects")?.data.items.length
    ? (["projects", "See projects"] as const)
    : firstOfType(ctx.doc, "experience")?.data.items.length
      ? (["experience", "See experience"] as const)
      : null
  if (!email && !work) return null
  return (
    <div className="pf-ctas" data-pf-reveal="">
      {email ? (
        <a className="pf-btn" href={`mailto:${email}`}>
          Email me
        </a>
      ) : null}
      {work ? (
        <a className="pf-btn pf-btn--quiet" href={`#portfolio-section-${work[0]}`}>
          {work[1]}
          <Arrow />
        </a>
      ) : null}
    </div>
  )
}

/** Name first, role and tagline in a foot row. `banner` only sets the name larger. */
const big = (kind: "statement" | "banner") =>
  function BigHero(p: P) {
    return (
      <div className={`pf-wrap pf-hero pf-hero--${kind}`}>
        <Name {...p} />
        <div className="pf-hero__foot">
          <Role {...p} />
          <div>
            <Tagline {...p} />
            <Ctas ctx={p.ctx} />
          </div>
        </div>
      </div>
    )
  }

const Statement = big("statement")
const Banner = big("banner")

function Centered(p: P) {
  return (
    <div className="pf-wrap pf-hero pf-hero--centered">
      <Name {...p} />
      <Role {...p} />
      <Tagline {...p} />
      <Ctas ctx={p.ctx} />
    </div>
  )
}

/** Facts from the resume itself (never invented): where, current role. */
function Facts({ ctx }: { ctx: P["ctx"] }) {
  const loc = firstOfType(ctx.doc, "contact")?.data.location?.trim()
  const job = firstOfType(ctx.doc, "experience")?.data.items[0]
  const facts: [string, string][] = []
  if (job && (has(job.role) || has(job.company))) facts.push(["Currently", [job.role, job.company].filter(has).join(", ")])
  if (loc) facts.push(["Based in", loc])
  if (!facts.length) return null
  return (
    <dl className="pf-facts" data-pf-reveal="">
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Split(p: P) {
  const img = p.section.data.imageUrl?.trim()
  const aside = img ? <Media src={img} alt={p.section.data.name} ratio="4 / 5" /> : <Facts ctx={p.ctx} />
  return (
    <div className={cx("pf-wrap pf-hero pf-hero--split", !aside && "pf-hero--solo")}>
      <div className="pf-hero__main">
        <Name {...p} />
        <Role {...p} />
        <Tagline {...p} />
        <Ctas ctx={p.ctx} />
      </div>
      {aside ? <div className="pf-hero__aside">{aside}</div> : null}
    </div>
  )
}

function Card(p: P) {
  const img = p.section.data.imageUrl?.trim()
  return (
    <div className="pf-wrap pf-hero pf-hero--card">
      <div className="pf-hero__panel">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="pf-avatar" src={img} alt="" />
        ) : null}
        <Name {...p} />
        <Role {...p} />
        <Tagline {...p} />
        <Ctas ctx={p.ctx} />
      </div>
    </div>
  )
}

function Terminal(p: P) {
  const { T } = p.ctx
  return (
    <div className="pf-wrap pf-hero pf-hero--terminal">
      <Name {...p} />
      {has(p.section.data.title) || p.ctx.editing ? (
        <p className="pf-hero__role" data-pf-reveal="">
          <span className="pf-term" aria-hidden="true">
            $
          </span>{" "}
          <T path={at(p.section, "title")} value={p.section.data.title} />
        </p>
      ) : null}
      <Tagline {...p} />
      <Ctas ctx={p.ctx} />
    </div>
  )
}

export const hero: SectionModule<"hero"> = {
  variants: { statement: Statement, banner: Banner, centered: Centered, split: Split, card: Card, terminal: Terminal },
  fallback: "statement",
  isEmpty: () => false,
}
