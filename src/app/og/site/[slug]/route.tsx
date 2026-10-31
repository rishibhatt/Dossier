import { specimenCard } from "@/lib/og/specimenCard"
import { loadPublishedBySlug } from "@/lib/portfolio/published"

export const runtime = "nodejs"

type Doc = { meta?: { title?: string }; sections?: { type?: string; data?: { name?: string; title?: string } }[] }

/** Share card for a published site (/p and /u pages point og:image here): the person's name and role. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const row = await loadPublishedBySlug(slug)
  const doc = (row?.payload as { document?: Doc } | undefined)?.document
  if (!doc) return new Response("Not found", { status: 404 })
  const hero = doc.sections?.find((s) => s.type === "hero")?.data
  const name = (hero?.name || doc.meta?.title || "Portfolio").trim().slice(0, 60)
  const role = (hero?.title ?? "").trim().slice(0, 70)
  const res = await specimenCard({ title: name, running: role || "Portfolio", no: "", footnote: "Portfolio on Dossier" })
  // Owners republish often: let link previews refresh within the hour.
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600")
  return res
}
