"use client"

import { TemplateGrid } from "@/features/resume/editor/DesignPanel"
import { PRESETS } from "@/lib/resume/presets"
import { ACCENT_HEX } from "@/lib/resume/renderModel"
import { ACCENTS, DENSITIES, PRESET_IDS, type Accent, type Density, type PresetId } from "@/lib/resume/schema"
import { getTemplate } from "@/lib/resume/templates"

import { useLetterEditor } from "../lib/store"

const ACCENT_NAMES: Record<Accent, string> = { ink: "Ink", violet: "Violet", navy: "Navy", forest: "Forest", oxblood: "Oxblood", slate: "Slate" }
const DENSITY_NAMES: Record<Density, string> = { comfortable: "Roomy", standard: "Standard", compact: "Compact" }

/** R-001 to R-012 are hand-written resume layouts; their letters use the closest matching letterhead. */
export const isHandMade = (templateId: string) => /^r0(0\d|1[0-2])-/.test(templateId)

/** "Matches R-014 Harbor" (or "Close to R-003 Column" for the hand-made ones). */
export function matchLabel(templateId: string) {
  const t = getTemplate(templateId)
  return `${isHandMade(t.id) ? "Close to" : "Matches"} ${t.no} ${t.name}`
}

export function LetterDesignPanel() {
  const draft = useLetterEditor((s) => s.draft)
  const setDesign = useLetterEditor((s) => s.setDesign)
  if (!draft) return null
  const { design } = draft
  const preset = PRESETS[design.preset]
  const sameAsResume = draft.resumeTemplateId === design.templateId

  return (
    <>
      <section className="rz-block" aria-label="Letterhead">
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">Letterhead</h2>
          <p className="rz-hint">
            The letter takes its name block, fonts and accent from a resume template. Pick the one your resume uses and the two read as a set.
          </p>
        </div>
        <p className="rz-hint rz-mono" style={{ marginBottom: "0.75rem" }} aria-live="polite">
          {matchLabel(design.templateId)}
          {isHandMade(design.templateId) ? " · a hand-made layout, so the letterhead is a close match, not a copy" : ""}
        </p>
        <TemplateGrid value={design.templateId} onChange={(templateId) => setDesign({ templateId })} chosenLabel={sameAsResume ? "Same as your resume" : "In use"} />
      </section>

      <section className="rz-block" aria-label="Country format">
        <div className="rz-block-head" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <h2 className="rz-h">Country format</h2>
          <p className="rz-hint">Sets the paper size, how the date is written, where it sits, and the usual sign-off.</p>
        </div>
        <div className="rz-field">
          <label className="rz-label" htmlFor="lt-preset">
            Where you’re applying
          </label>
          <select id="lt-preset" className="rz-select" value={design.preset} onChange={(e) => setDesign({ preset: e.target.value as PresetId })}>
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
          <p className="rz-hint">Compact helps a long letter stay on one page.</p>
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
          <p className="rz-hint">Use the same one as your resume so the pair matches.</p>
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
