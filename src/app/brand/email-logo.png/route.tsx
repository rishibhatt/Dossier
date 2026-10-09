import { ImageResponse } from "next/og"

/** The Dossier logo as a PNG for email. Mail clients block SVG, so this renders the tile and wordmark to a bitmap. */
export const dynamic = "force-static"

export function GET() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%" }}>
        <svg width="70" height="70" viewBox="0 0 40 40">
          <rect width="40" height="40" rx="10" fill="#0b0c11" />
          <g stroke="#f5f3ff" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 8.2 31.6 13.1 20 18 8.4 13.1 20 8.2Z" fill="#f5f3ff" strokeWidth="1.6" />
            <path d="M8.4 20.1 20 25l11.6-4.9" fill="none" strokeWidth="2.75" />
            <path d="M8.4 27.3 20 32.2l11.6-4.9" fill="none" strokeWidth="2.75" />
          </g>
        </svg>
        <div style={{ marginLeft: 18, fontSize: 52, fontWeight: 700, color: "#101114", letterSpacing: -2 }}>Dossier</div>
      </div>
    ),
    { width: 300, height: 70, headers: { "cache-control": "public, max-age=86400, s-maxage=604800" } }
  )
}
