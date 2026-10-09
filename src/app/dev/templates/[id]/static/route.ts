import { renderStaticPortfolioHtml } from "@/lib/export/buildPortfolioExportZip"

import { buildSample, seedFrom } from "../../buildSample"

export const dynamic = "force-dynamic"

/** Dev-only: the ZIP export's index.html (CSS inlined) for template `id`. ?sample=dense|sparse ?seed=N */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 })
  const { id } = await params
  const url = new URL(request.url)
  const built = buildSample(id, url.searchParams.get("sample") ?? undefined, seedFrom(url.searchParams.get("seed") ?? undefined))
  if (!built) return new Response("Unknown template", { status: 404 })
  const html = await renderStaticPortfolioHtml({ document: built.document, designConfig: built.designConfig, credit: true })
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
