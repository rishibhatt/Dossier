/**
 * Loads the browser's Typst engine (src/features/resume/engine/core.ts) in Node with the same wasm, fonts and
 * templates, so scripts see exactly what a visitor's browser renders. Shared by verify.ts and thumbnails.ts.
 */
import fs from "node:fs"
import path from "node:path"

import { TypstEngine } from "../../src/features/resume/engine/core"

const root = process.cwd()
export const typstDir = path.join(root, "src/resume/typst")
const fontDir = path.join(root, "public/fonts/resume")

async function initGlue(pkg: string, base: string) {
  const dir = path.join(root, "node_modules/@myriaddreamin", pkg, "pkg")
  const glue = await import(path.join(dir, `${base}.mjs`))
  glue.initSync({ module: await WebAssembly.compile(fs.readFileSync(path.join(dir, `${base}_bg.wasm`))) })
  return glue
}

export async function loadEngine({ renderer = false } = {}) {
  const compiler = await initGlue("typst-ts-web-compiler", "typst_ts_web_compiler")
  const fonts = fs
    .readdirSync(fontDir)
    .filter((f) => f.endsWith(".ttf"))
    .map((f) => new Uint8Array(fs.readFileSync(path.join(fontDir, f))))
  const sources = fs
    .readdirSync(typstDir)
    .filter((f) => f.endsWith(".typ"))
    .map((f) => ({ path: `/${f}`, text: fs.readFileSync(path.join(typstDir, f), "utf8") }))
  return TypstEngine.create({
    compiler,
    renderer: renderer ? await initGlue("typst-ts-renderer", "typst_ts_renderer") : undefined,
    fonts,
    sources,
  })
}
