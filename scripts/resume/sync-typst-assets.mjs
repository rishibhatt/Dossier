/**
 * Copies the Typst compiler and renderer wasm plus the resume templates into public/typst/ under
 * content-hashed names, and writes public/typst/manifest.json for the browser worker.
 * Hashed names let the CDN cache them forever (see netlify.toml); the manifest itself is never cached.
 * Runs before `next dev` and `next build`. Output is gitignored.
 */
import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const out = path.join(root, "public/typst")
const hash = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 12)

fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(path.join(out, "a", "templates"), { recursive: true })

function copy(src, name, ext, dir = "") {
  const buf = fs.readFileSync(src)
  // Hashed files live under /typst/a/ so their "immutable" cache rule can't also match manifest.json.
  const file = path.join("a", dir, `${name}.${hash(buf)}${ext}`)
  fs.writeFileSync(path.join(out, file), buf)
  return `/typst/${file}`
}

const wasm = {
  compiler: copy(
    path.join(root, "node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm"),
    "compiler",
    ".wasm",
  ),
  renderer: copy(
    path.join(root, "node_modules/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm"),
    "renderer",
    ".wasm",
  ),
}

const typstDir = path.join(root, "src/resume/typst")
const sources = {}
for (const f of fs.readdirSync(typstDir).filter((f) => f.endsWith(".typ")).sort()) {
  sources[`/${f}`] = copy(path.join(typstDir, f), f.replace(/\.typ$/, ""), ".typ", "templates")
}

const fontDir = path.join(root, "public/fonts/resume")
const fonts = {}
for (const f of fs.readdirSync(fontDir).filter((f) => f.endsWith(".ttf")).sort()) {
  fonts[f.replace(/\.ttf$/, "")] = `/fonts/resume/${f}?v=${hash(fs.readFileSync(path.join(fontDir, f)))}`
}

const manifest = { engine: "typst.ts 0.7.0 / typst 0.14.2", wasm, sources, fonts }
fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
console.log(`typst assets: ${Object.keys(sources).length} templates, ${Object.keys(fonts).length} fonts -> public/typst`)
