import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Byline } from "@/components/blog/Byline"
import { Prose } from "@/components/blog/Prose"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata, SCHEMA_IDS } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { AUTHOR, formatDate, getPost, POSTS, readingMinutes } from "@/content/blog/posts"
import { getFreeTool } from "@/features/tools/catalog"
import { ROUTES } from "@/lib/constants/routes"

export const dynamicParams = false

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  const base = buildPageMetadata({
    title: `${post.seoTitle ?? post.title} | Dossier`,
    description: post.description,
    path: `${ROUTES.blog}/${post.slug}`,
    image: post.hero ?? `/og/blog/${post.slug}`,
    openGraph: { title: post.ogTitle, description: post.ogDescription },
  })
  return {
    ...base,
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    openGraph: { ...base.openGraph, type: "article", publishedTime: post.published, modifiedTime: post.updated ?? post.published, authors: [AUTHOR.name] },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const url = `${siteConfig.url}${ROUTES.blog}/${post.slug}`
  const heroSrc = post.hero ?? `/og/blog/${post.slug}`
  const freeTool = post.tool === "resume-builder" || post.tool === "cover-letter" ? undefined : getFreeTool(post.tool)
  const tool =
    post.tool === "resume-builder"
      ? { name: "Free resume builder", href: ROUTES.resume, cta: "Build your resume free" }
      : post.tool === "cover-letter"
        ? { name: "Cover letter maker", href: ROUTES.coverLetterNew, cta: "Write my cover letter" }
        : freeTool && { name: freeTool.name, href: `${ROUTES.tools}/${freeTool.slug}`, cta: "Try it free" }
  // Inline offer goes before the second section heading: after the reader got the first answer.
  const h2s = post.body.flatMap((b, i) => (b.t === "h2" ? [i] : []))
  const ctaAt = h2s[1] ?? -1
  const others = POSTS.filter((p) => p.slug !== post.slug)
  const related = [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3)

  const ld: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      image: `${siteConfig.url}${heroSrc}`,
      datePublished: post.published,
      dateModified: post.updated ?? post.published,
      mainEntityOfPage: url,
      inLanguage: post.inLanguage ?? "en",
      author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
      publisher: { "@type": "Organization", "@id": SCHEMA_IDS.org, name: siteConfig.name, url: siteConfig.url },
      ...(post.sources?.length ? { citation: post.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.url })) } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}${ROUTES.blog}` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ]
  if (post.faq?.length) {
    ld.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    })
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead running={[`Blog / ${post.category}`, `${readingMinutes(post)} min read`]} title={post.title} lead={<p>{post.description}</p>}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--site-rule)] py-4">
          <Byline meta={`${AUTHOR.role} · ${formatDate(post.published)}`} />
        </div>
      </PageHead>

      <article className="site-wrap pb-16">
        <Image src={heroSrc} alt={`Cover for: ${post.title}`} width={1200} height={630} priority unoptimized={!post.hero} className="mb-12 h-auto w-full border border-[var(--site-rule)]" />
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {tool && ctaAt > 0 ? (
              <>
                <Prose blocks={post.body.slice(0, ctaAt)} />
                {/* On phones the sidebar box only appears after the whole article, so readers get one inline offer early. */}
                <aside aria-label="Free tool" className="my-10 max-w-[40rem] border border-[var(--site-ink)] bg-[var(--site-sheet)] p-5 lg:hidden">
                  <p className="font-semibold">{tool.name}</p>
                  <p className="mt-1 text-[0.9375rem] text-[var(--site-ink-2)]">{post.toolPitch}</p>
                  <Link href={tool.href} className="site-btn site-btn-primary mt-4 w-full">
                    <span className="site-btn-label">{tool.cta}</span>
                  </Link>
                </aside>
                <Prose blocks={post.body.slice(ctaAt)} />
              </>
            ) : (
              <Prose blocks={post.body} />
            )}
            {post.faq?.length ? (
              <section aria-labelledby="post-faq" className="mt-14 max-w-[40rem] border-t border-[var(--site-rule)] pt-8">
                <h2 id="post-faq" className="site-h3">
                  Questions people ask
                </h2>
                <dl className="mt-4">
                  {post.faq.map((f) => (
                    <div key={f.q} className="border-b border-[var(--site-rule)] py-5">
                      <dt className="font-semibold">{f.q}</dt>
                      <dd className="mt-2 text-[1.0625rem] leading-[1.75] text-[var(--site-ink-2)]">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
            {post.sources?.length ? (
              <section aria-labelledby="post-sources" className="mt-14 max-w-[40rem] border-t border-[var(--site-rule)] pt-8">
                <h2 id="post-sources" className="site-h3">
                  Sources
                </h2>
                <ol className="mt-4 list-decimal space-y-2 pl-6 text-[0.9375rem] leading-relaxed text-[var(--site-ink-2)]">
                  {post.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} rel="noopener" target="_blank" className="underline decoration-[var(--site-rule-strong)] underline-offset-4 hover:text-[var(--site-accent-ink)]">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
          {tool ? (
            <aside className="lg:col-span-4" aria-label="Free tool">
              <div className="border border-[var(--site-ink)] bg-[var(--site-sheet)] p-5 lg:sticky lg:top-24">
                <p className="sp-data">{post.tool === "resume-builder" ? "Dossier Resume" : post.tool === "cover-letter" ? "Dossier Cover Letter" : "Free tool"}</p>
                <p className="site-h3 mt-1">{tool.name}</p>
                <p className="mt-2 text-[0.9375rem] text-[var(--site-ink-2)]">{post.toolPitch}</p>
                <Link href={tool.href} className="site-btn site-btn-primary mt-5 w-full">
                  <span className="site-btn-label">{tool.cta}</span>
                </Link>
              </div>
            </aside>
          ) : null}
        </div>
      </article>

      <nav aria-label="More guides" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-14">
        <div className="site-wrap">
          <p className="site-h3">More guides</p>
          <ul className="mt-6 grid gap-px border border-[var(--site-rule)] bg-[var(--site-rule)] sm:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug} className="bg-[var(--site-paper)]">
                <Link href={`${ROUTES.blog}/${p.slug}`} className="flex h-full min-h-28 flex-col justify-between gap-3 p-4 hover:bg-[var(--site-sheet)]">
                  <span className="sp-data">{p.category}</span>
                  <span className="font-semibold">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}
