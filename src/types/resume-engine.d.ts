// The Typst and pdf.js builds the resume worker imports by file path. Their types live on the package roots.
declare module "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler.mjs" {
  export * from "@myriaddreamin/typst-ts-web-compiler"
}
declare module "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer.mjs" {
  export * from "@myriaddreamin/typst-ts-renderer"
}
declare module "pdfjs-dist/build/pdf.min.mjs" {
  export * from "pdfjs-dist"
}
declare module "pdfjs-dist/build/pdf.worker.min.mjs" {
  export const WorkerMessageHandler: unknown
}
