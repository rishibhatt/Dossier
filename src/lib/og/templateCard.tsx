import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { getThumb, getVerification } from "@/content/resume/evidence"
import { getTemplatePage } from "@/content/resume/templates"
import { Glyph, loadFont, OG_SIZE } from "./specimenCard"

const INK = "#101114"
const PAPER = "#f7f5f0"
const MUTED = "#4f5562"
const OK = "#1f7a4d"

/**
 * Share card: paper ground, the template's real page-one render (the PNG the thumbnail script wrote) tilted on
 * the right, the name and a dated "Tested" chip on the left. Served from /og/resume-templates/<slug>.
 */
export async function templateCard(slug: string) {
  const t = getTemplatePage(slug)
  const v = t ? getVerification(t.templateId) : null
  const og = t ? getThumb(t.templateId, t.sample, "a4")?.og : null
  const [display, script, png] = await Promise.all([
    loadFont("Bricolage Grotesque", 700),
    loadFont("Mr Dafoe", 400, "Dossier"),
    og ? readFile(join(process.cwd(), "public", og)).catch(() => null) : null,
  ])
  const src = png ? `data:image/png;base64,${png.toString("base64")}` : null

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, position: "relative", overflow: "hidden", color: INK }}>
        <div style={{ display: "flex", flexDirection: "column", width: 640, padding: "44px 0 44px 56px", fontFamily: display ? "Display" : undefined }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: MUTED, paddingBottom: 14, borderBottom: `2px solid ${INK}` }}>
            <span>Resume templates</span>
            <span>No. {t?.engine.no ?? "R-000"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -4, lineHeight: 0.95 }}>{t?.engine.name ?? "Resume"}</div>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1, marginTop: 14, color: MUTED }}>resume template, free PDF</div>
            {v ? (
              <div style={{ display: "flex", alignSelf: "flex-start", alignItems: "center", gap: 10, marginTop: 30, border: `2px solid ${OK}`, color: OK, padding: "8px 16px", fontSize: 24 }}>
                <div style={{ width: 14, height: 14, background: OK }} />
                Tested {v.testedLabel} · {v.passed}/{v.runs} passed
              </div>
            ) : null}
            <div style={{ fontSize: 22, color: MUTED, marginTop: 18 }}>Shown with a fictional sample resume</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Glyph />
            <div style={{ display: "flex", fontSize: 54, lineHeight: 1, fontFamily: script ? "Script" : undefined }}>Dossier</div>
          </div>
        </div>
        {src ? (
          <div
            style={{
              position: "absolute",
              left: 700,
              top: 46,
              width: 440,
              display: "flex",
              transform: "rotate(4deg)",
              border: "1px solid rgba(16,17,20,0.24)",
              boxShadow: "0 18px 40px -18px rgba(16,17,20,0.45)",
              background: "#fff",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
            <img src={src} width={440} height={Math.round(440 * 1.4142)} alt="" />
          </div>
        ) : null}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        ...(display ? [{ name: "Display", data: display, weight: 700 as const, style: "normal" as const }] : []),
        ...(script ? [{ name: "Script", data: script, weight: 400 as const, style: "normal" as const }] : []),
      ],
    },
  )
}
