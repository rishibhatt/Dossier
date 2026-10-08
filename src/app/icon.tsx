import { ImageResponse } from "next/og"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

/** Browser tab icon: the Dossier mark, a black tile with three stacked layers. */
export default function Icon() {
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
          borderRadius: 15,
        }}
      >
        <svg width="46" height="46" viewBox="0 0 40 40">
          <g stroke="#f5f3ff" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 8.2 31.6 13.1 20 18 8.4 13.1 20 8.2Z" fill="#f5f3ff" strokeWidth="1.6" />
            <path d="M8.4 20.1 20 25l11.6-4.9" fill="none" strokeWidth="2.9" />
            <path d="M8.4 27.3 20 32.2l11.6-4.9" fill="none" strokeWidth="2.9" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  )
}
