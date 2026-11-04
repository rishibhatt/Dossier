import type { PortfolioPressSection, PortfolioPublicationsSection } from "@/types/dossier"

import { Block, has, Meta, OutLink } from "../primitives"
import type { RenderCtx, SectionModule } from "../types"

type MentionType = "press" | "publications"

/**
 * Press (features, interviews, awards) and publications (papers, chapters, talks) share one shape.
 * list: title first, outlet and year under it. outlets: the outlet set large, the title under it.
 */
function mentions(type: MentionType, kind: "list" | "outlets") {
  return function Mentions({ section, ctx }: { section: PortfolioPressSection | PortfolioPublicationsSection; ctx: RenderCtx }) {
    const { T } = ctx
    return (
      <Block type={type} className={`pf-mentions pf-mentions--${kind}`}>
        <ul className="pf-list" data-pf-items="">
          {section.data.items.map((m, i) => {
            const at = (field: string) => ({ sectionId: section.id, field, index: i })
            const head = kind === "outlets" ? [at("outlet"), m.outlet] as const : [at("title"), m.title] as const
            const sub = kind === "outlets" ? [at("title"), m.title] as const : [at("outlet"), m.outlet] as const
            return (
              <li key={i} className="pf-item" data-pf-item="">
                <div className="pf-item__head">
                  <T as="h3" className="pf-item__title" path={head[0]} value={head[1]} />
                  <Meta ctx={ctx} parts={[[at("year"), m.year]]} />
                </div>
                {has(sub[1]) || ctx.editing ? <T as="p" className="pf-item__sub" path={sub[0]} value={sub[1]} /> : null}
                {has(m.link) ? <OutLink className="pf-item__link" href={m.link}>{type === "press" ? "Read it" : "Read the paper"}</OutLink> : null}
              </li>
            )
          })}
        </ul>
      </Block>
    )
  }
}

const isEmpty = (s: { data: { items: { title: string; outlet: string }[] } }) => !s.data.items.some((m) => has(m.title) || has(m.outlet))

export const pressModule: SectionModule<"press"> = {
  variants: { list: mentions("press", "list"), outlets: mentions("press", "outlets") },
  fallback: "list",
  isEmpty,
}

export const publicationsModule: SectionModule<"publications"> = {
  variants: { list: mentions("publications", "list"), outlets: mentions("publications", "outlets") },
  fallback: "list",
  isEmpty,
}
