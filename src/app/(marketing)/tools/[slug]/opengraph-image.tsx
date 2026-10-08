import { FREE_TOOLS, getFreeTool } from "@/features/tools/catalog"
import { OG_SIZE, specimenCard } from "@/lib/og/specimenCard"

export const alt = "A free tool by Dossier"
export const size = OG_SIZE
export const contentType = "image/png"

export function generateStaticParams() {
  return FREE_TOOLS.map((t) => ({ slug: t.slug }))
}

export default async function ToolOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = getFreeTool(slug)
  return specimenCard({
    title: tool?.h1 ?? "Free tools for job seekers.",
    running: `Free tools / ${tool?.name ?? "Dossier"}`,
    no: tool?.no ?? "000",
    footnote: "Free, runs in your browser",
  })
}
