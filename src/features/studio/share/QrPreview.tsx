"use client"

import { useEffect, useState } from "react"
import { Download, Loader2 } from "lucide-react"

const COLORS = { dark: "#111111", light: "#ffffff" }

function save(href: string, name: string) {
  const a = document.createElement("a")
  a.href = href
  a.download = name
  a.click()
}

/**
 * The portfolio link as a QR code, previewed before download: PNG for documents and print, SVG for anything
 * that is scaled up (a poster, a banner). Generated in the browser; nothing is uploaded.
 */
export function QrPreview({ url, onDownload }: { url: string; onDownload: (format: "png" | "svg") => void }) {
  const [png, setPng] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let live = true
    import("qrcode")
      .then(({ toDataURL }) => toDataURL(url, { width: 1024, margin: 2, errorCorrectionLevel: "M", color: COLORS }))
      .then((data) => live && setPng(data))
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [url])

  async function downloadSvg() {
    const { toString } = await import("qrcode")
    const svg = await toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: COLORS })
    const href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
    save(href, "portfolio-qr.svg")
    setTimeout(() => URL.revokeObjectURL(href), 1000)
    onDownload("svg")
  }

  if (failed) {
    return (
      <p role="status" className="mt-2.5 text-xs text-[var(--site-ink-2)]">
        The QR code could not be made in this browser. Try again, or copy the link instead.
      </p>
    )
  }

  return (
    <figure className="mt-2.5 grid gap-3 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-3 [border-radius:4px] @[22rem]:grid-cols-[9rem_minmax(0,1fr)] @[22rem]:items-center">
      <div className="mx-auto grid aspect-square w-full max-w-[11rem] place-items-center border border-[var(--site-rule)] bg-white p-1.5 [border-radius:2px] @[22rem]:max-w-none">
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL generated in the browser
          <img src={png} alt={`QR code that opens ${url.replace(/^https?:\/\//, "")}`} width={1024} height={1024} className="block h-auto w-full [image-rendering:pixelated]" />
        ) : (
          <Loader2 className="size-5 animate-spin text-[var(--site-ink-3)] motion-reduce:animate-none" aria-label="Making the QR code" />
        )}
      </div>
      <figcaption className="grid min-w-0 gap-2.5">
        <p className="text-xs text-[var(--site-ink-2)]">Scan it with a phone camera to check, then add it to a printed CV, a business card or a slide.</p>
        <p className="site-mono break-all text-xs">{url.replace(/^https?:\/\//, "")}</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={!png} onClick={() => png && (save(png, "portfolio-qr.png"), onDownload("png"))} className="site-btn site-btn-primary site-btn-sm !px-2">
            <Download className="size-4" aria-hidden />
            <span className="site-btn-label">PNG</span>
          </button>
          <button type="button" disabled={!png} onClick={() => void downloadSvg()} className="site-btn site-btn-ghost site-btn-sm !px-2">
            <Download className="size-4" aria-hidden />
            <span className="site-btn-label">SVG</span>
          </button>
        </div>
      </figcaption>
    </figure>
  )
}
