import { transform } from "sucrase"

export type CompileResult =
  | { ok: true; executable: string }
  | { ok: false; error: string }

/**
 * Transpiles JSX/TS function source into classic-runtime JS for `new Function("React","motion", ...)`.
 */
export function compileGeneratedJsx(functionSource: string): CompileResult {
  try {
    const { code } = transform(functionSource, {
      transforms: ["jsx", "typescript"],
      production: true,
      jsxRuntime: "classic",
    })
    return { ok: true, executable: code.trim() }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown_compile_error" }
  }
}

export function getFallbackExecutable(sectionType: "projects" | "hero" | "about"): string {
  const label =
    sectionType === "projects" ? "Projects" : sectionType === "hero" ? "Hero" : "About"
  return `
function GeneratedSection(props) {
  return React.createElement(
    "section",
    { className: "mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-950" },
    React.createElement("h2", { className: "text-lg font-semibold text-neutral-900 dark:text-neutral-100" }, "${label} (fallback)"),
    React.createElement("p", { className: "mt-2 text-sm text-neutral-500 dark:text-neutral-400" }, "Generation failed validation — showing safe fallback."),
    React.createElement("pre", { className: "mt-4 max-h-64 overflow-auto rounded-lg bg-neutral-100 p-4 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300" }, JSON.stringify(props, null, 2))
  );
}
`.trim()
}
