import { videoEmbed } from "@/lib/portfolio/media"
import type { ShowreelEntry } from "@/types/dossier"

import { Block, cx, has, OutLink } from "../primitives"
import type { RenderCtx, SectionModule, VariantProps } from "../types"

/**
 * Lazy iframes (no script), so the reel also plays in the static ZIP export. YouTube runs on its
 * no-cookie domain, Vimeo with do-not-track. Links that cannot be embedded show as a titled link card.
 */
function Reel({ item, index, sectionId, ctx, lead }: { item: ShowreelEntry; index: number; sectionId: string; ctx: RenderCtx; lead?: boolean }) {
  const { T } = ctx
  const embed = videoEmbed(item.videoUrl)
  const at = (field: string) => ({ sectionId, field, index })
  return (
    <li className={cx("pf-item pf-reel", lead && "pf-reel--lead")} data-pf-item="">
      {embed ? (
        <div className="pf-video">
          <iframe
            src={embed.src}
            title={has(item.title) ? item.title : "Video"}
            loading="lazy"
            allow="fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : null}
      {has(item.title) || ctx.editing ? <T as="h3" className="pf-item__title" path={at("title")} value={item.title} /> : null}
      {has(item.note) || ctx.editing ? <T as="p" className="pf-meta" path={at("note")} value={item.note} /> : null}
      {!embed && has(item.videoUrl) ? <OutLink className="pf-item__link" href={item.videoUrl}>Watch</OutLink> : null}
    </li>
  )
}

const showreel = (kind: "feature" | "grid") =>
  function Showreel({ section, ctx }: VariantProps<"showreel">) {
    const items = section.data.items.map((item, index) => ({ item, index })).filter(({ item }) => has(item.videoUrl))
    return (
      <Block type="showreel" className={`pf-showreel pf-showreel--${kind}`}>
        <ul className={kind === "grid" ? "pf-grid" : "pf-reels"} data-pf-items="">
          {items.map(({ item, index }, n) => (
            <Reel key={index} item={item} index={index} sectionId={section.id} ctx={ctx} lead={kind === "feature" && n === 0} />
          ))}
        </ul>
      </Block>
    )
  }

export const showreelModule: SectionModule<"showreel"> = {
  variants: { feature: showreel("feature"), grid: showreel("grid") },
  fallback: "feature",
  isEmpty: (s) => !s.data.items.some((v) => has(v.videoUrl)),
}
