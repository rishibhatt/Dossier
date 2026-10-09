import JSZip from "jszip"
import { createElement } from "react"

import { PortfolioPage } from "@/components/portfolio/page/PortfolioPage"
import { PORTFOLIO_CSS } from "@/components/portfolio/styles/portfolioCss"
import { googleFontsHref } from "@/lib/design/googleFonts"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export type ExportInput = {
  document: PortfolioDocument
  designConfig: DesignConfig
  /** Kept for API compatibility (palette variation lives in DesignConfig). */
  variationSeed?: number
  hiddenSectionIds?: string[]
  sectionSurfaceOverrides?: Record<string, { bg?: string }>
  /** Show "Made with Dossier" in the exported site (exports are a paid feature, so off by default). */
  credit?: boolean
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg", "image/avif": "avif" }

/** Move inline data: images into assets/ so the site is plain files. Returns the rewritten document. */
function extractAssets(doc: PortfolioDocument, zip: JSZip): PortfolioDocument {
  let n = 0
  const take = (src: string | null | undefined): string | null | undefined => {
    const m = src?.match(/^data:([\w/+.-]+);base64,(.+)$/)
    if (!m) return src
    const ext = EXT[m[1]!]
    if (!ext) return null
    const path = `assets/image-${++n}.${ext}`
    zip.file(path, m[2]!, { base64: true })
    return path
  }
  return {
    ...doc,
    sections: doc.sections.map((s) => {
      if (s.type === "hero") return { ...s, data: { ...s.data, imageUrl: take(s.data.imageUrl) } }
      if (s.type === "projects") return { ...s, data: { items: s.data.items.map((p) => ({ ...p, imageUrl: take(p.imageUrl) })) } }
      return s
    }),
  }
}

function readme(title: string) {
  return `# ${title}

A static copy of your Dossier portfolio. No build step.

- \`index.html\` the page
- \`styles.css\` the layout and theme (colours and fonts are set on the root element)
- \`assets/\` images you uploaded
- \`data/portfolio.json\` your content, if you want to rebuild it elsewhere

Open \`index.html\` in a browser, or upload the folder to any static host (Netlify, GitHub Pages, Cloudflare Pages, S3).
`
}

/**
 * ZIP of a real static site rendered from the same components as the live page
 * (PortfolioPage through react-dom/server). Motion is omitted; the page is complete without it.
 */
export async function buildPortfolioExportZip(input: ExportInput): Promise<Blob> {
  const { renderToStaticMarkup } = await import("react-dom/server")
  const zip = new JSZip()
  const document = extractAssets(input.document, zip)
  const cfg = input.designConfig
  const ty = cfg.tokens.typography

  const body = renderToStaticMarkup(
    createElement(PortfolioPage, {
      document,
      config: cfg,
      hidden: input.hiddenSectionIds ?? [],
      surfaces: input.sectionSurfaceOverrides,
      credit: { show: Boolean(input.credit) },
      head: false,
    })
  )

  const { title, description } = document.meta
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(googleFontsHref([ty.displayFont, ty.bodyFont, ty.monoFont]))}">
<link rel="stylesheet" href="styles.css">
</head>
<body>
${body}
</body>
</html>
`

  zip.file("index.html", html)
  zip.file("styles.css", `html,body{margin:0;background:${cfg.tokens.colors.bg};overflow-x:clip}\nhtml{scroll-behavior:smooth}\n@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}\n${PORTFOLIO_CSS.trim()}\n`)
  zip.file("README.md", readme(title))
  zip.file("data/portfolio.json", JSON.stringify(input.document, null, 2))
  return zip.generateAsync({ type: "blob" })
}

/** Same page as a single HTML string with inlined CSS (dev QA route). */
export async function renderStaticPortfolioHtml(input: ExportInput): Promise<string> {
  const zip = await JSZip.loadAsync(await (await buildPortfolioExportZip(input)).arrayBuffer())
  const html = (await zip.file("index.html")!.async("string")).replace('<link rel="stylesheet" href="styles.css">', `<style>${await zip.file("styles.css")!.async("string")}</style>`)
  return html
}
