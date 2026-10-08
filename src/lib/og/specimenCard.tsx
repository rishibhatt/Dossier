import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }

const INK = "#101114"
const PAPER = "#f7f5f0"
const SHEET = "#fffefb"
const MUTED = "#4f5562"
const ACCENT = "#6d5cf6"

/**
 * Fetches a Google font as TrueType for ImageResponse (an old Safari user agent makes Google serve TTF).
 * Any failure returns null and the card falls back to the default sans, so the image always renders.
 */
async function loadFont(family: string, weight: number, text?: string): Promise<ArrayBuffer | null> {
  try {
    const q = `family=${family.replace(/\s+/g, "+")}:wght@${weight}${text ? `&text=${encodeURIComponent(text)}` : ""}`
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?${q}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1" },
      })
    ).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    if (!url) return null
    return await (await fetch(url)).arrayBuffer()
  } catch {
    return null
  }
}

function Glyph() {
  return (
    <svg width="52" height="52" viewBox="0 0 40 40">
      <rect width="40" height="40" rx="10" fill="#0b0c11" />
      <g stroke="#f5f3ff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 8.2 31.6 13.1 20 18 8.4 13.1 20 8.2Z" fill="#f5f3ff" strokeWidth="1.6" />
        <path d="M8.4 20.1 20 25l11.6-4.9" fill="none" strokeWidth="2.75" />
        <path d="M8.4 27.3 20 32.2l11.6-4.9" fill="none" strokeWidth="2.75" />
      </g>
    </svg>
  )
}

/**
 * Share card in the Specimen Sheet world: a ruled sheet with crop marks, a running head (section and number),
 * the headline set large, and the script wordmark. Used by the site card and every free-tool card.
 */
export async function specimenCard({ title, running, no, footnote }: { title: string; running: string; no: string; footnote: string }) {
  const [display, script] = await Promise.all([loadFont("Bricolage Grotesque", 700), loadFont("Mr Dafoe", 400, "Dossier")])
  const mark = (pos: Record<string, number>) => (
    <div style={{ position: "absolute", width: 22, height: 22, display: "flex", ...pos }}>
      <div style={{ position: "absolute", left: 0, top: 10, width: 22, height: 2, background: INK }} />
      <div style={{ position: "absolute", left: 10, top: 0, width: 2, height: 22, background: INK }} />
    </div>
  )

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, padding: 34, position: "relative" }}>
        {mark({ left: 12, top: 12 })}
        {mark({ right: 12, top: 12 })}
        {mark({ left: 12, bottom: 12 })}
        {mark({ right: 12, bottom: 12 })}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: SHEET,
            border: `2px solid ${INK}`,
            padding: "26px 48px 34px",
            color: INK,
            fontFamily: display ? "Display" : undefined,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: MUTED, paddingBottom: 14, borderBottom: `2px solid ${INK}` }}>
            <span>{running}</span>
            <span>No. {no}</span>
          </div>
          <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
            <div style={{ fontSize: title.length > 40 ? 76 : 92, fontWeight: 700, letterSpacing: -3.5, lineHeight: 0.98, maxWidth: 1000 }}>{title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Glyph />
              <div style={{ display: "flex", fontSize: 54, lineHeight: 1, fontFamily: script ? "Script" : undefined }}>Dossier</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: MUTED }}>
              <div style={{ width: 14, height: 14, background: ACCENT }} />
              {footnote}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        ...(display ? [{ name: "Display", data: display, weight: 700 as const, style: "normal" as const }] : []),
        ...(script ? [{ name: "Script", data: script, weight: 400 as const, style: "normal" as const }] : []),
      ],
    }
  )
}
