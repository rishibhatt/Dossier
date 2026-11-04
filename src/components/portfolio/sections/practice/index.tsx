import { Arrow, Block, has } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

/** Where and when to find the person. card: one panel. split: details left, the two actions right. */
const practice = (kind: "card" | "split") =>
  function Practice({ section, ctx }: VariantProps<"practice">) {
    const { T } = ctx
    const d = section.data
    const at = (field: string) => ({ sectionId: section.id, field })
    const hours = d.hours.filter(has)
    const actions =
      has(d.bookingUrl) || has(d.mapUrl) ? (
        <div className="pf-practice__actions">
          {has(d.bookingUrl) ? (
            <a className="pf-btn" href={d.bookingUrl} target="_blank" rel="noopener">
              Book an appointment <Arrow up />
            </a>
          ) : null}
          {has(d.mapUrl) ? (
            <a className="pf-btn pf-btn--quiet" href={d.mapUrl} target="_blank" rel="noopener">
              Directions <Arrow up />
            </a>
          ) : null}
        </div>
      ) : null
    return (
      <Block type="practice" className={`pf-practice pf-practice--${kind}`}>
        <div className={kind === "split" ? "pf-practice__split" : "pf-card"} data-pf-reveal="">
          <div>
            {has(d.name) || ctx.editing ? <T as="h3" className="pf-item__title" path={at("name")} value={d.name} /> : null}
            {has(d.address) || ctx.editing ? <T as="div" className="pf-practice__address" paragraphs path={at("address")} value={d.address} /> : null}
            {hours.length ? (
              <ul className="pf-hours" aria-label="Hours">
                {hours.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : null}
          </div>
          {actions}
        </div>
      </Block>
    )
  }

export const practiceModule: SectionModule<"practice"> = {
  variants: { card: practice("card"), split: practice("split") },
  fallback: "card",
  isEmpty: (s) => !has(s.data.name) && !has(s.data.address) && !s.data.hours.some(has) && !has(s.data.bookingUrl),
}
