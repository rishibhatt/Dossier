import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"

import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { LinkPageMotion, LinkShare } from "@/features/tools/LinkPageClient"
import { LinkPageView } from "@/features/tools/LinkPageView"
import { safeImageUrl, THEMES, visibleLinks, type ThemeId } from "@/features/tools/linkPage"
import { loadLinkPage } from "@/lib/profile/linkPage"
import { renamedTo } from "@/lib/profile/usernameServer"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

type PageProps = { params: Promise<{ handle: string }>; searchParams: Promise<{ look?: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const row = await loadLinkPage(handle)
  if (!row) return { title: "Page not found", robots: { index: false } }
  const { name, bio } = row.page
  return {
    ...buildPageMetadata({
      title: `${name} (@${row.handle}) | Links`,
      description: bio.trim() || `${name}'s links, in one place.`,
      path: `/l/${row.handle}`,
      image: `/og/l/${row.handle}`,
    }),
    // Owner content: kept out of search results so thin pages never weigh on the site, but followed, so the
    // "Made with Dossier" links still count.
    robots: { index: false, follow: true },
  }
}

export default async function LinkPage({ params, searchParams }: PageProps) {
  const { handle } = await params
  const row = await loadLinkPage(handle)
  if (!row) {
    // A link shared before the owner changed their username: send it on to the new name.
    const admin = createAdminSupabaseClient()
    const current = admin ? await renamedTo(admin, handle.toLowerCase()) : null
    if (current) permanentRedirect(`/l/${current}`)
    notFound()
  }
  if (handle !== row.handle) permanentRedirect(`/l/${row.handle}`)

  // Development only: /l/sample?look=marquee shows the sample in any look.
  const { look } = await searchParams
  const page = process.env.NODE_ENV !== "production" && look && look in THEMES ? { ...row.page, theme: look as ThemeId } : row.page

  const url = `${siteConfig.url}/l/${row.handle}`
  const { buttons, icons } = visibleLinks(page)
  const ld = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      name: page.name,
      description: page.bio || undefined,
      image: page.photo ? (safeImageUrl(page.photoUrl) ?? safeImageUrl(row.avatarUrl) ?? undefined) : undefined,
      sameAs: [...icons, ...buttons].filter((l) => !l.href.startsWith("mailto:")).map((l) => l.href),
    },
  }

  return (
    <main className="site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <LinkPageMotion theme={page.theme} name={page.name}>
        <LinkPageView full page={page} handle={row.handle} avatarUrl={row.avatarUrl} action={<LinkShare url={url} title={page.name} />} />
      </LinkPageMotion>
    </main>
  )
}
