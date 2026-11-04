import { loadLinkPage } from "@/lib/profile/linkPage"
import { specimenCard } from "@/lib/og/specimenCard"

/** Share card for /l/<username>: the owner's name set as the showing, their handle in the running head. */
export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const row = await loadLinkPage(handle)
  if (!row) return new Response("Not found", { status: 404 })
  return specimenCard({ title: row.page.name, running: `Links / @${row.handle}`, no: "004", footnote: "Made with Dossier" })
}
