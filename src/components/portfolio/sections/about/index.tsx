import { Block, has } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

/** prose: one readable column. lead: first paragraph set large. columns: lead + rest in two columns on wide screens. */
const about = (kind: "prose" | "lead" | "columns") =>
  function About({ section, ctx }: VariantProps<"about">) {
    return (
      <Block type="about" className={`pf-about pf-about--${kind}`}>
        <ctx.T
          as="div"
          paragraphs
          className="pf-prose"
          path={{ sectionId: section.id, field: "body" }}
          value={section.data.body}
          attrs={{ "data-pf-reveal": "" }}
        />
      </Block>
    )
  }

export const aboutModule: SectionModule<"about"> = {
  variants: { prose: about("prose"), lead: about("lead"), columns: about("columns") },
  fallback: "prose",
  isEmpty: (s) => !has(s.data.body),
}
