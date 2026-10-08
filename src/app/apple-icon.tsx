import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** iOS home-screen icon. iOS rounds the corners itself, so the tile is full-bleed. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0c11",
        }}
      >
        <svg width="124" height="124" viewBox="0 0 40 40">
          <g stroke="#f5f3ff" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 8.2 31.6 13.1 20 18 8.4 13.1 20 8.2Z" fill="#f5f3ff" strokeWidth="1.6" />
            <path d="M8.4 20.1 20 25l11.6-4.9" fill="none" strokeWidth="2.75" />
            <path d="M8.4 27.3 20 32.2l11.6-4.9" fill="none" strokeWidth="2.75" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  )
}
