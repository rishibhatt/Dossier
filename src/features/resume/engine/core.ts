/**
 * Typst engine core, shared by the browser worker and the Node verification script so both run the exact
 * same compiler, fonts and templates. Nothing here touches the DOM or the network: callers hand in the wasm
 * glue modules, font bytes and template sources.
 */
import type * as CompilerGlue from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler.mjs"
import type * as RendererGlue from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer.mjs"

export type CompilerModule = typeof CompilerGlue
export type RendererModule = typeof RendererGlue

export type EngineSources = { path: string; text: string }[]

export type CompileOk = { ok: true; bytes: Uint8Array; ms: number }
export type CompileFail = { ok: false; error: string; line: number | null; ms: number }

export class TypstEngine {
  private constructor(
    private compiler: CompilerGlue.TypstCompiler,
    private renderer: RendererGlue.TypstRenderer | null,
  ) {}

  static async create(opts: {
    compiler: CompilerModule
    renderer?: RendererModule
    fonts: Uint8Array[]
    sources: EngineSources
  }) {
    const builder = new opts.compiler.TypstCompilerBuilder()
    // No file system and no package registry: templates can only read what we map in.
    builder.set_dummy_access_model()
    for (const font of opts.fonts) await builder.add_raw_font(font)
    const compiler = await builder.build()
    for (const s of opts.sources) compiler.add_source(s.path, s.text)
    const renderer = opts.renderer ? await new opts.renderer.TypstRendererBuilder().build() : null
    return new TypstEngine(compiler, renderer)
  }

  addSource(path: string, text: string) {
    this.compiler.add_source(path, text)
  }

  private run(main: string, data: string, fmt: "pdf" | "vector"): CompileOk | CompileFail {
    const t = now()
    try {
      const r = this.compiler.compile(main, [["data", data]], fmt, 1) as { result?: Uint8Array }
      if (!r?.result) return { ok: false, error: "The typesetter returned nothing.", line: null, ms: now() - t }
      return { ok: true, bytes: r.result, ms: now() - t }
    } catch (e) {
      return { ok: false, ...describeError(e), ms: now() - t }
    }
  }

  pdf(main: string, data: string) {
    return this.run(main, data, "pdf")
  }

  /** Vector artifact rendered to one SVG string covering every page. */
  svg(main: string, data: string): (CompileOk & { svg: string }) | CompileFail {
    const r = this.run(main, data, "vector")
    if (!r.ok) return r
    if (!this.renderer) return { ok: false, error: "Renderer not loaded.", line: null, ms: r.ms }
    const session = this.renderer.create_session()
    try {
      this.renderer.manipulate_data(session, "reset", r.bytes)
      // typst.ts appends an interactivity <script> (unescaped, so not valid XML inside an <img>). The preview is
      // a still image, so drop it: smaller, parses, and nothing in the preview can run.
      const svg = this.renderer.svg_data(session).replace(/<script\b[\s\S]*?<\/script>/gi, "")
      return { ...r, svg }
    } finally {
      session.free()
    }
  }
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now())

/** Typst throws a Rust debug string; pull out the first message and a line number when one is present. */
export function describeError(e: unknown): { error: string; line: number | null } {
  const raw = typeof e === "string" ? e : e instanceof Error ? e.message : String(e)
  const msg = raw.match(/message: "((?:[^"\\]|\\.)*)"/)?.[1]?.replace(/\\"/g, '"') ?? raw.slice(0, 240)
  const line = raw.match(/at (\d+):\d+\)/)?.[1]
  return { error: msg, line: line ? Number(line) : null }
}
