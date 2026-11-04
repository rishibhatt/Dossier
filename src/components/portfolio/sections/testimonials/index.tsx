import { Block, cx, has } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

/** quotes: one large quote after another (few, strong). cards: a grid (many, short). */
const testimonials = (kind: "quotes" | "cards") =>
  function Testimonials({ section, ctx }: VariantProps<"testimonials">) {
    const { T } = ctx
    return (
      <Block type="testimonials" className={`pf-testimonials pf-testimonials--${kind}`}>
        <ul className={kind === "cards" ? "pf-grid" : "pf-quotes"} data-pf-items="">
          {section.data.items.map((q, i) => {
            if (!has(q.quote) && !ctx.editing) return null
            const at = (field: string) => ({ sectionId: section.id, field, index: i })
            return (
              <li key={i} className={cx("pf-item", kind === "cards" && "pf-card")} data-pf-item="">
                <figure className="pf-quote">
                  <blockquote>
                    <T as="p" path={at("quote")} value={q.quote} />
                  </blockquote>
                  <figcaption className="pf-meta">
                    <T as="span" className="pf-quote__name" path={at("name")} value={q.name} />
                    {has(q.role) || ctx.editing ? (
                      <>
                        <span className="pf-sep" aria-hidden="true"> · </span>
                        <T path={at("role")} value={q.role} />
                      </>
                    ) : null}
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </Block>
    )
  }

export const testimonialsModule: SectionModule<"testimonials"> = {
  variants: { quotes: testimonials("quotes"), cards: testimonials("cards") },
  fallback: "quotes",
  isEmpty: (s) => !s.data.items.some((q) => has(q.quote)),
}
