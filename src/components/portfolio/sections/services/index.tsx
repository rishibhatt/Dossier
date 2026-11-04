import { Block, cx, has } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

/** list: name and price on one ruled line (clinics, chambers). cards: a grid of offers (studios, trainers). */
const services = (kind: "list" | "cards") =>
  function Services({ section, ctx }: VariantProps<"services">) {
    const { T } = ctx
    return (
      <Block type="services" className={`pf-services pf-services--${kind}`}>
        <ul className={kind === "cards" ? "pf-grid pf-grid--3" : "pf-list"} data-pf-items="">
          {section.data.items.map((s, i) => {
            const at = (field: string) => ({ sectionId: section.id, field, index: i })
            return (
              <li key={i} className={cx("pf-item", kind === "cards" && "pf-card")} data-pf-item="">
                <div className="pf-item__head">
                  <T as="h3" className="pf-item__title" path={at("name")} value={s.name} />
                  {has(s.price) || ctx.editing ? <T as="p" className="pf-price" path={at("price")} value={s.price} /> : null}
                </div>
                {has(s.description) || ctx.editing ? <T as="p" className="pf-desc" path={at("description")} value={s.description} /> : null}
              </li>
            )
          })}
        </ul>
      </Block>
    )
  }

export const servicesModule: SectionModule<"services"> = {
  variants: { list: services("list"), cards: services("cards") },
  fallback: "list",
  isEmpty: (s) => !s.data.items.some((x) => has(x.name)),
}
