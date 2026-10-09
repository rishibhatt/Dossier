import { Block, cx, has } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

/** chips: tags. columns: ruled multi-column list (dense resumes). inline: one typeset line, slash separated. */
const skills = (kind: "chips" | "columns" | "inline") =>
  function Skills({ section, ctx }: VariantProps<"skills">) {
    const { T } = ctx
    const items = section.data.items.map((v, i) => [v, i] as const).filter(([v]) => ctx.editing || has(v))
    return (
      <Block type="skills" className={`pf-skills pf-skills--${kind}`}>
        <ul className={cx(kind === "chips" ? "pf-chips" : kind === "columns" ? "pf-cols" : "pf-inline")} data-pf-items="">
          {items.map(([v, i]) => (
            <li key={i} className={kind === "chips" ? "pf-chip" : undefined} data-pf-item="">
              <T path={{ sectionId: section.id, field: "item", index: i }} value={v} />
            </li>
          ))}
        </ul>
      </Block>
    )
  }

export const skillsModule: SectionModule<"skills"> = {
  variants: { chips: skills("chips"), columns: skills("columns"), inline: skills("inline") },
  fallback: "chips",
  isEmpty: (s) => !s.data.items.some(has),
}
