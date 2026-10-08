import Link from "next/link"
import { notFound } from "next/navigation"

import { VARIANT_IDS } from "@/components/portfolio/sections/registry"
import { TEMPLATE_SPECS, checkPaletteContrast, contrastRatio } from "@/lib/design/templates"
import type { TemplateSpec } from "@/lib/design/templates"
import type { PortfolioSectionType } from "@/types/dossier"

import { seedFrom } from "./buildSample"

export const dynamic = "force-dynamic"

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

const VIEWPORTS = { desktop: { w: 1440, scale: 0.25, h: 520 }, mobile: { w: 375, scale: 0.6, h: 560 } } as const
const FULL_H = 4200

/** Variant ids in the spec that the registry does not know (should always be empty). */
function unknownVariants(s: TemplateSpec): string[] {
  const bad = Object.entries(s.variants).filter(([t, v]) => !VARIANT_IDS[t as PortfolioSectionType]?.includes(v)).map(([t, v]) => `${t}:${v}`)
  if (!VARIANT_IDS.hero.includes(s.heroSection)) bad.push(`hero:${s.heroSection}`)
  return bad
}

/**
 * Dev-only template QA: every template rendered with the dense and the sparse sample, side by side,
 * through the real renderer in iframes at true widths (container queries respond to the frame).
 * Query: ?vp=desktop|mobile ?seed=N ?only=<id> ?full=1
 */
export default async function TemplatesDevPage({ searchParams }: Props) {
  if (process.env.NODE_ENV === "production") notFound()
  const sp = await searchParams
  const seed = seedFrom(sp.seed)
  const vpName = first(sp.vp) === "mobile" ? "mobile" : "desktop"
  const vp = VIEWPORTS[vpName]
  const only = first(sp.only)
  const full = first(sp.full) === "1"
  const frameH = full ? FULL_H * vp.scale : vp.h
  const specs = only ? TEMPLATE_SPECS.filter((s) => s.id === only) : TEMPLATE_SPECS
  const qs = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries({ seed: String(seed), vp: vpName, only, full: full ? "1" : undefined, ...patch }))
      if (v !== undefined && v !== "") p.set(k, String(v))
    return `/dev/templates?${p.toString()}`
  }
  const pill = { padding: "4px 10px", border: "1px solid #bbb", borderRadius: 6, background: "#fff", color: "#151515", textDecoration: "none" }

  return (
    <div style={{ background: "#f4f4f2", minHeight: "100vh", padding: 24, fontFamily: "ui-sans-serif, system-ui, sans-serif", color: "#151515" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Template QA ({TEMPLATE_SPECS.length})</h1>
        <p style={{ fontSize: 13, margin: "6px 0 12px", color: "#555" }}>
          Dev only. Dense and sparse sample per template. Seed {seed}. Viewport {vpName} ({vp.w}px).
        </p>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 13 }}>
          {[
            ["desktop 1440", qs({ vp: "desktop" })],
            ["mobile 375", qs({ vp: "mobile" })],
            ["seed 0", qs({ seed: 0 })],
            ["seed 1", qs({ seed: 1 })],
            ["seed 2", qs({ seed: 2 })],
            [full ? "short frames" : "full pages", qs({ full: full ? "" : "1" })],
            ["all templates", qs({ only: undefined })],
          ].map(([label, href]) => (
            <Link key={label} href={href!} style={pill}>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${Math.round(vp.w * vp.scale) * 2 + 48}px, 1fr))`, gap: 20 }}>
        {specs.map((s) => {
          const pal = s.palettes[seed % s.palettes.length]!
          const worst = Math.min(...s.palettes.map((p) => Math.min(contrastRatio(p.text, p.bg), contrastRatio(p.muted, p.bg2), contrastRatio(p.primary, p.bg2))))
          const issues = s.palettes.flatMap((p) => checkPaletteContrast(p))
          const bad = unknownVariants(s)
          return (
            <section key={s.id} style={{ background: "#fff", border: "1px solid #d8d8d4", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <strong style={{ fontSize: 15 }}>{s.name}</strong>
                <code style={{ fontSize: 11, color: "#666" }}>{s.id}</code>
              </div>
              <p style={{ fontSize: 12, margin: "4px 0", color: "#444" }}>{s.bestFor.join(", ")}</p>
              <p style={{ fontSize: 11, margin: "0 0 8px", color: "#666" }}>
                {s.mode} / {s.layout} / hero {s.heroSection} / {s.fonts.display} + {s.fonts.body} / {s.motion.preset} / min contrast {worst.toFixed(1)}:1{" "}
                {issues.length ? <b style={{ color: "#b00020" }}>({issues.length} contrast issues)</b> : <span style={{ color: "#0a7a3f" }}>AA ok</span>}
                {bad.length ? <b style={{ color: "#b00020" }}> unknown variants: {bad.join(", ")}</b> : null}
              </p>
              <div style={{ display: "flex", gap: 4, marginBottom: 8, alignItems: "center" }}>
                {[pal.bg, pal.bg2, pal.text, pal.muted, pal.primary, pal.accent].map((c) => (
                  <span key={c} title={c} style={{ width: 18, height: 18, borderRadius: 4, background: c, border: "1px solid #0002" }} />
                ))}
                <Link href={qs({ only: s.id })} style={{ marginLeft: "auto", fontSize: 11 }}>
                  isolate
                </Link>
                <a href={`/dev/templates/${s.id}/static?seed=${seed}`} target="_blank" rel="noreferrer" style={{ fontSize: 11 }}>
                  static export
                </a>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {(["dense", "sparse"] as const).map((sample) => (
                  <figure key={sample} style={{ margin: 0 }}>
                    <figcaption style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>
                      {sample}{" "}
                      <a href={`/dev/templates/${s.id}?sample=${sample}&seed=${seed}`} target="_blank" rel="noreferrer">
                        open
                      </a>
                    </figcaption>
                    <div style={{ width: vp.w * vp.scale, height: frameH, overflow: "hidden", border: "1px solid #ccc", borderRadius: 6, background: "#fff" }}>
                      <iframe
                        title={`${s.name} ${sample}`}
                        loading="lazy"
                        src={`/dev/templates/${s.id}?sample=${sample}&seed=${seed}${full ? "&compact=1" : ""}`}
                        style={{ width: vp.w, height: frameH / vp.scale, border: 0, transform: `scale(${vp.scale})`, transformOrigin: "top left", display: "block" }}
                      />
                    </div>
                  </figure>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
