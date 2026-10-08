import { Block, Bullets, cx, has, Meta } from "../primitives"
import type { RenderCtx, SectionModule, VariantProps } from "../types"
import type { ExperienceEntry } from "@/types/dossier"

type Kind = "timeline" | "rows" | "cards" | "list"

function Entry({ kind, e, i, sectionId, ctx }: { kind: Kind; e: ExperienceEntry; i: number; sectionId: string; ctx: RenderCtx }) {
  const { T } = ctx
  const at = (field: string) => ({ sectionId, field, index: i })
  const role = <T as="h3" className="pf-item__title" path={at("role")} value={e.role} />
  const company = has(e.company) || ctx.editing ? <T as="p" className="pf-item__sub" path={at("company")} value={e.company} /> : null
  const when = <Meta ctx={ctx} parts={[[at("duration"), e.duration], [at("location"), e.location]]} />
  const body = <Bullets ctx={ctx} sectionId={sectionId} index={i} entry={e} />

  if (kind === "rows")
    return (
      <>
        <div className="pf-row__side">
          {when}
          {company}
        </div>
        <div className="pf-row__main">
          {role}
          {body}
        </div>
      </>
    )
  if (kind === "cards")
    return (
      <>
        {when}
        {role}
        {company}
        {body}
      </>
    )
  return (
    <>
      <div className="pf-item__head">
        <div>
          {role}
          {company}
        </div>
        {when}
      </div>
      {body}
    </>
  )
}

const LIST_CLASS: Record<Kind, string> = {
  timeline: "pf-tl",
  rows: "pf-rows",
  cards: "pf-grid",
  list: "pf-list",
}

const experience = (kind: Kind) =>
  function Experience({ section, ctx }: VariantProps<"experience">) {
    return (
      <Block type="experience" className={`pf-exp pf-exp--${kind}`}>
        <ol className={LIST_CLASS[kind]} data-pf-items="">
          {section.data.items.map((e, i) => (
            <li key={i} className={cx("pf-item", kind === "cards" && "pf-card", kind === "rows" && "pf-row")} data-pf-item="">
              <Entry kind={kind} e={e} i={i} sectionId={section.id} ctx={ctx} />
            </li>
          ))}
        </ol>
      </Block>
    )
  }

export const experienceModule: SectionModule<"experience"> = {
  variants: { timeline: experience("timeline"), rows: experience("rows"), cards: experience("cards"), list: experience("list") },
  fallback: "timeline",
  isEmpty: (s) => !s.data.items.some((e) => has(e.role) || has(e.company)),
}
