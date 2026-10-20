"use client"

import { PRESETS } from "@/lib/resume/presets"
import { ACCENT_HEX } from "@/lib/resume/renderModel"
import { ACCENTS, DENSITIES, PRESET_IDS, type Accent, type Density } from "@/lib/resume/schema"
import { RESUME_TEMPLATES } from "@/lib/resume/templates"

import { useResumeEditor } from "../lib/store"
import { useTemplateThumbs } from "../lib/useTemplateThumbs"

const ACCENT_NAMES: Record<Accent, string> = {
  ink: "Ink",
  violet: "Violet",
  navy: "Navy",
  forest: "Forest",
  oxblood: "Oxblood",
  slate: "Slate",
}

const DENSITY_NAMES: Record<Density, string> = { comfortable: "Roomy", standard: "Standard", compact: "Compact" }

export function TemplateGrid({
  thumbs,
  value,
  onChange,
  className = "rz-templates",
  chosenLabel = "In use",
}: {
  thumbs: Record<string, string>
  value: string
  onChange: (id: string) => void
  className?: string
  chosenLabel?: string
}) {
  return (
    <div className={className} role="radiogroup" aria-label="Template">
      {RESUME_TEMPLATES.map((t) => {
        const chosen = t.id === value
        return (
          <button key={t.id} type="button" role="radio" aria-checked={chosen} className="rz-tpl" onClick={() => onChange(t.id)}>
            <span className="rz-tpl-plate">
              {thumbs[t.id] ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob: SVG from the typesetter
                <img src={thumbs[t.id]} alt={`${t.name} template, page one`} />
              ) : null}
            </span>
            <span className="rz-tpl-name">
              <span>{t.name}</span>
              {chosen ? <span className="rz-tpl-chosen rz-mono">{chosenLabel}</span> : <span className="rz-mono">{t.no}</span>}
            </span>
            <span className="rz-tpl-best">{t.bestFor}</span>
          </button>
        )
      })}
    </div>
  )
}

export function DesignPanel({ active }: { active: boolean }) {
  const draft = useResumeEditor((s) => s.draft)
  const setDesign = useResumeEditor((s) => s.setDesign)
  const thumbs = useTemplateThumbs(draft?.doc ?? null, draft?.design ?? null, active)
  if (!draft) return null
  const { design } = draft
  const preset = PRESETS[design.preset]

  return (
    <>
      <section className="rz-block" aria-label="Template">
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">Template</h2>
          <p className="rz-hint">Your own resume in each layout. Switching never changes what you wrote.</p>
        </div>
        <TemplateGrid thumbs={thumbs} value={design.templateId} onChange={(templateId) => setDesign({ templateId })} />
      </section>

      <section className="rz-block" aria-label="Country format">
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">Country format</h2>
          <p className="rz-hint">Sets the paper size, date style and which personal details belong.</p>
        </div>
        <div className="rz-field">
          <label className="rz-label" htmlFor="rz-preset">
            Where you’re applying
          </label>
          <select
            id="rz-preset"
            className="rz-select"
            value={design.preset}
            onChange={(e) => setDesign({ preset: e.target.value as (typeof PRESET_IDS)[number] })}
          >
            {PRESET_IDS.map((id) => (
              <option key={id} value={id}>
                {PRESETS[id].label}
              </option>
            ))}
          </select>
          <p className="rz-hint">{preset.note}</p>
        </div>
      </section>

      <section className="rz-block" aria-label="Paper">
        <div className="rz-block-head">
          <h2 className="rz-h">Paper</h2>
        </div>
        <div className="rz-segment" role="radiogroup" aria-label="Paper size">
          {(
            [
              [null, `Country (${preset.paper === "a4" ? "A4" : "Letter"})`],
              ["a4", "A4"],
              ["us-letter", "US Letter"],
            ] as const
          ).map(([value, label]) => (
            <button key={label} type="button" role="radio" aria-checked={design.paper === value} onClick={() => setDesign({ paper: value })}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rz-block" aria-label="Spacing">
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">Spacing</h2>
          <p className="rz-hint">Compact fits more on one page. No text goes below 9 pt.</p>
        </div>
        <div className="rz-segment" role="radiogroup" aria-label="Spacing">
          {DENSITIES.map((d) => (
            <button key={d} type="button" role="radio" aria-checked={design.density === d} onClick={() => setDesign({ density: d })}>
              {DENSITY_NAMES[d]}
            </button>
          ))}
        </div>
      </section>

      <section className="rz-block" aria-label="Accent colour">
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">Accent colour</h2>
          <p className="rz-hint">Used on headings and rules only. Every option reads clearly when printed in black and white.</p>
        </div>
        <div className="rz-swatches" role="radiogroup" aria-label="Accent colour">
          {ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={design.accent === a}
              className="rz-swatch"
              style={{ ["--sw" as string]: ACCENT_HEX[a] }}
              onClick={() => setDesign({ accent: a })}
            >
              <i aria-hidden />
              {ACCENT_NAMES[a]}
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
