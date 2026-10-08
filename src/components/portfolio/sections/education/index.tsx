import { Block, cx, has, Meta } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

/** list: ruled rows, degree first. cards: one card per qualification (students, short resumes). */
const education = (kind: "list" | "cards") =>
  function Education({ section, ctx }: VariantProps<"education">) {
    const { T } = ctx
    return (
      <Block type="education" className={`pf-edu pf-edu--${kind}`}>
        <ol className={kind === "cards" ? "pf-grid" : "pf-list"} data-pf-items="">
          {section.data.items.map((e, i) => {
            const at = (field: string) => ({ sectionId: section.id, field, index: i })
            return (
              <li key={i} className={cx("pf-item", kind === "cards" && "pf-card")} data-pf-item="">
                <div className="pf-item__head">
                  <div>
                    <T as="h3" className="pf-item__title" path={at("degree")} value={e.degree || e.institution} />
                    {has(e.degree) && (has(e.institution) || ctx.editing) ? <T as="p" className="pf-item__sub" path={at("institution")} value={e.institution} /> : null}
                  </div>
                  <Meta ctx={ctx} parts={[[at("period"), e.period]]} />
                </div>
                {has(e.details) || ctx.editing ? <T as="div" paragraphs className="pf-prose pf-desc" path={at("details")} value={e.details} /> : null}
              </li>
            )
          })}
        </ol>
      </Block>
    )
  }

export const educationModule: SectionModule<"education"> = {
  variants: { list: education("list"), cards: education("cards") },
  fallback: "list",
  isEmpty: (s) => !s.data.items.some((e) => has(e.degree) || has(e.institution)),
}
