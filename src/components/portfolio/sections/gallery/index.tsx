import { isImageSrc } from "@/lib/portfolio/media"
import type { GalleryEntry } from "@/types/dossier"

import { Block, cx, has, OutLink } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

type Kind = "grid" | "masonry" | "strip" | "compare"

const shown = (items: GalleryEntry[]) => items.map((g, i) => ({ g, i })).filter(({ g }) => isImageSrc(g.imageUrl))

function Shot({ src, alt, natural }: { src: string; alt: string; natural?: boolean }) {
  return (
    <div className={cx("pf-shot", natural && "pf-shot--natural")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  )
}

/**
 * grid: even 4:3 frames (interiors, products). masonry: natural heights (photography, mood boards).
 * strip: one tall row that scrolls sideways (architecture, sets). compare: before and after side by side.
 */
const gallery = (kind: Kind) =>
  function Gallery({ section, ctx }: VariantProps<"gallery">) {
    const { T } = ctx
    const items = shown(section.data.items)
    const list = kind === "strip" ? "pf-strip" : kind === "masonry" ? "pf-masonry" : kind === "compare" ? "pf-compare" : "pf-grid pf-grid--3"
    return (
      <Block type="gallery" className={`pf-gallery pf-gallery--${kind}`}>
        <ul className={list} data-pf-items="" {...(kind === "strip" ? { tabIndex: 0, "aria-label": "Gallery, scroll sideways" } : {})}>
          {items.map(({ g, i }) => {
            const caption = has(g.caption) || ctx.editing ? <T as="figcaption" className="pf-shot__cap" path={{ sectionId: section.id, field: "caption", index: i }} value={g.caption} /> : null
            const before = kind === "compare" && isImageSrc(g.beforeUrl) ? g.beforeUrl : null
            return (
              <li key={i} className="pf-item" data-pf-item="">
                <figure className="pf-figure">
                  {before ? (
                    <div className="pf-pair">
                      <div>
                        <Shot src={before} alt={has(g.caption) ? `${g.caption}, before` : "Before"} />
                        <span className="pf-pair__tag">Before</span>
                      </div>
                      <div>
                        <Shot src={g.imageUrl} alt={has(g.caption) ? `${g.caption}, after` : "After"} />
                        <span className="pf-pair__tag">After</span>
                      </div>
                    </div>
                  ) : (
                    <Shot src={g.imageUrl} alt={g.caption} natural={kind === "masonry" || kind === "strip"} />
                  )}
                  {caption}
                </figure>
                {has(g.link) ? <OutLink className="pf-item__link" href={g.link}>View project</OutLink> : null}
              </li>
            )
          })}
        </ul>
      </Block>
    )
  }

export const galleryModule: SectionModule<"gallery"> = {
  variants: { grid: gallery("grid"), masonry: gallery("masonry"), strip: gallery("strip"), compare: gallery("compare") },
  fallback: "grid",
  isEmpty: (s) => shown(s.data.items).length === 0,
}
