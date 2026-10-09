import { Block, cx, has, Meta } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

/** list: ruled rows (finance, legal). grid: compact cards (nurses, trades with many licences). */
const certifications = (kind: "list" | "grid") =>
  function Certifications({ section, ctx }: VariantProps<"certifications">) {
    const { T } = ctx
    return (
      <Block type="certifications" className={`pf-cert pf-cert--${kind}`}>
        <ul className={kind === "grid" ? "pf-grid pf-grid--3" : "pf-list"} data-pf-items="">
          {section.data.items.map((c, i) => {
            const at = (field: string) => ({ sectionId: section.id, field, index: i })
            return (
              <li key={i} className={cx("pf-item", kind === "grid" && "pf-card")} data-pf-item="">
                <div className="pf-item__head">
                  <T as="h3" className="pf-item__title" path={at("name")} value={c.name} />
                  <Meta ctx={ctx} parts={[[at("year"), c.year]]} />
                </div>
                {has(c.issuer) || ctx.editing ? <T as="p" className="pf-item__sub" path={at("issuer")} value={c.issuer} /> : null}
              </li>
            )
          })}
        </ul>
      </Block>
    )
  }

export const certificationsModule: SectionModule<"certifications"> = {
  variants: { list: certifications("list"), grid: certifications("grid") },
  fallback: "list",
  isEmpty: (s) => !s.data.items.some((c) => has(c.name)),
}
