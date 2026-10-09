import { Block, cx, has, ProjectBody } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

type P = VariantProps<"projects">

function Items({ section, ctx, from = 0, list, item, media = true }: P & { from?: number; list: string; item: string; media?: boolean }) {
  const rest = section.data.items.slice(from)
  if (!rest.length) return null
  return (
    <ul className={list} data-pf-items="">
      {rest.map((p, k) => (
        <li key={k + from} className={cx("pf-item", item, !has(p.imageUrl) && "pf-item--text")} data-pf-item="">
          <ProjectBody ctx={ctx} sectionId={section.id} index={k + from} p={p} media={media} />
        </li>
      ))}
    </ul>
  )
}

const Cards = (p: P) => (
  <Block type="projects" className="pf-projects pf-projects--cards">
    <Items {...p} list={cx("pf-grid", p.section.data.items.length > 2 && "pf-grid--3")} item="pf-card" />
  </Block>
)

const List = (p: P) => (
  <Block type="projects" className="pf-projects pf-projects--list">
    <Items {...p} list="pf-list" item="" media={false} />
  </Block>
)

/** Image-led grid; projects without a cover become typographic tiles instead of fake art. */
const Gallery = (p: P) => (
  <Block type="projects" className="pf-projects pf-projects--gallery">
    <Items {...p} list="pf-gallery" item="pf-tile" />
  </Block>
)

/** First project large, the rest as a compact list. */
function Feature(p: P) {
  const first = p.section.data.items[0]
  return (
    <Block type="projects" className="pf-projects pf-projects--feature">
      {first ? (
        <article className={cx("pf-feature", has(first.imageUrl) && "pf-feature--media")} data-pf-reveal="">
          <ProjectBody ctx={p.ctx} sectionId={p.section.id} index={0} p={first} />
        </article>
      ) : null}
      <Items {...p} from={1} list="pf-list" item="" media={false} />
    </Block>
  )
}

export const projectsModule: SectionModule<"projects"> = {
  variants: { cards: Cards, feature: Feature, list: List, gallery: Gallery },
  fallback: "cards",
  isEmpty: (s) => !s.data.items.some((x) => has(x.name)),
}
