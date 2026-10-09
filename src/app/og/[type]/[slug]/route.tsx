import { getPost, POSTS } from "@/content/blog/posts"
import { FREE_TOOLS, getFreeTool } from "@/features/tools/catalog"
import { specimenCard } from "@/lib/og/specimenCard"

/**
 * Share cards at a stable URL (/og/blog/<slug>, /og/tools/<slug>). File-based opengraph-image routes under a
 * dynamic segment get a hashed URL, so an explicit og:image path pointing at them returns 404.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return [
    ...POSTS.map((p) => ({ type: "blog", slug: p.slug })),
    ...FREE_TOOLS.map((t) => ({ type: "tools", slug: t.slug })),
  ]
}

export async function GET(_req: Request, { params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params
  if (type === "blog") {
    const post = getPost(slug)
    if (!post) return new Response("Not found", { status: 404 })
    return specimenCard({
      title: post.title,
      running: `Blog / ${post.category}`,
      no: String(POSTS.findIndex((p) => p.slug === slug) + 1).padStart(3, "0"),
      footnote: "By Rishab Bhatt",
    })
  }
  const tool = type === "tools" ? getFreeTool(slug) : undefined
  if (!tool) return new Response("Not found", { status: 404 })
  return specimenCard({ title: tool.h1, running: `Free tools / ${tool.name}`, no: tool.no, footnote: "Free, runs in your browser" })
}
