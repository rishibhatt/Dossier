import { countLabel, SECTION_CATALOG } from "@/features/studio/sectionCatalog"
import type { BuildPreview } from "@/types/buildStream"
import type { PortfolioSectionType } from "@/types/dossier"

type Palette = { bg: string; fg: string; accent: string; display: string }

const COUNT_KEY: Partial<Record<PortfolioSectionType, keyof NonNullable<BuildPreview["counts"]>>> = {
  experience: "roles",
  projects: "projects",
  skills: "skills",
  education: "education",
  highlights: "highlights",
}

function Bar({ w, o = 0.18, h = "0.45em" }: { w: string; o?: number; h?: string }) {
  return <span data-soft className="lb-bar" style={{ width: w, height: h, opacity: o }} />
}

/**
 * The skeleton site, filled with whatever the server has read so far. Rendered twice by LiveBuild:
 * once in neutral ink, once in the chosen look, which wipes over the first.
 */
export function LiveSite({ preview, palette, stage }: { preview: BuildPreview; palette: Palette; stage: number }) {
  const sections = (preview.sections ?? []).filter((t) => t !== "hero")
  const name = preview.name?.trim()
  const links = sections.filter((t) => t !== "contact").slice(0, 4)

  return (
    <div className="lb-site" style={{ background: palette.bg, color: palette.fg, ["--lb-bg" as string]: palette.bg }} data-sharp={stage >= 2}>
      <div data-nav className="lb-nav">
        <span className="truncate font-semibold" style={{ fontFamily: palette.display }}>
          {name ?? <Bar w="5em" o={0.3} />}
        </span>
        <span className="lb-links">
          {links.length ? links.map((t) => <span key={t}>{SECTION_CATALOG[t]?.label ?? t}</span>) : [0, 1, 2].map((i) => <Bar key={i} w="2.6em" />)}
        </span>
      </div>

      <div className="lb-hero">
        <p data-name className="lb-name" style={{ fontFamily: palette.display }} aria-hidden>
          {name ? (
            Array.from(name).map((ch, i) => (
              <span key={i} data-ch>
                {ch === " " ? " " : ch}
              </span>
            ))
          ) : (
            <Bar w="70%" h="0.8em" o={0.22} />
          )}
        </p>
        <p className="lb-title">{preview.title?.trim() || <Bar w="45%" />}</p>
        <span className="lb-accent" style={{ background: palette.accent }} />
      </div>

      <div className="lb-blocks">
        {(sections.length ? sections : (["about", "experience", "skills"] as PortfolioSectionType[])).map((t, i) => {
          const known = sections.length > 0
          const key = COUNT_KEY[t]
          const n = key ? preview.counts?.[key] : undefined
          return (
            <div key={known ? t : `ghost-${i}`} data-block className="lb-block">
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-semibold" style={{ fontFamily: palette.display }}>
                  {known ? (SECTION_CATALOG[t]?.label ?? t) : <Bar w="4em" o={0.28} />}
                </span>
                {known && n != null ? <span className="lb-count">{countLabel(t, n)}</span> : null}
              </p>
              <Bar w="92%" />
              <Bar w={i % 2 ? "64%" : "78%"} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
