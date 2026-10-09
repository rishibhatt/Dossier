import { Block, has } from "../primitives"
import type { SectionModule, VariantProps } from "../types"
import type { HighlightEntry } from "@/types/dossier"

/** A highlight only shows publicly when its value holds a real figure (placeholders never publish). */
const isNumber = (v: HighlightEntry["value"]) => has(v) && /\d/.test(v)

/**
 * Numbers taken from the resume (never invented). figures: ruled row of large values that count up once.
 * list: sentence rows, value inline. The section hides itself when there are no entries.
 */
const highlights = (kind: "figures" | "list") =>
  function Highlights({ section, ctx }: VariantProps<"highlights">) {
    const { T } = ctx
    const items = section.data.items.map((h, i) => [h, i] as const).filter(([h]) => ctx.editing || isNumber(h.value))
    return (
      <Block type="highlights" className={`pf-hl pf-hl--${kind}`}>
        <dl className={kind === "figures" ? "pf-figs" : "pf-hl-list"} data-pf-items="">
          {items.map(([h, i]) => (
            <div key={i} className="pf-fig" data-pf-item="">
              {/* dt first for valid markup; CSS puts the value on top */}
              <T as="dt" className="pf-fig__label" path={{ sectionId: section.id, field: "label", index: i }} value={h.label} />
              <dd className="pf-fig__value">
                <T path={{ sectionId: section.id, field: "value", index: i }} value={h.value} attrs={{ "data-pf-count": "" }} />
              </dd>
            </div>
          ))}
        </dl>
      </Block>
    )
  }

export const highlightsModule: SectionModule<"highlights"> = {
  variants: { figures: highlights("figures"), list: highlights("list") },
  fallback: "figures",
  isEmpty: (s) => !s.data.items.some((h) => isNumber(h.value)),
}
