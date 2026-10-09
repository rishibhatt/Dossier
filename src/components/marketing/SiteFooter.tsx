import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { BuilderAvatar } from "@/components/marketing/BuilderAvatar"
import { FooterWordmark } from "@/components/marketing/FooterWordmark"
import { Logo } from "@/components/marketing/primitives"
import { ROUTES } from "@/lib/constants/routes"

const BUILDER = {
  name: "Rishab Bhatt",
  url: "https://rishieee.netlify.app",
  avatar: "/brand/builder.webp",
  initials: "RB",
} as const

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: ROUTES.howItWorks },
      { label: "Features", href: ROUTES.features },
      { label: "Every look", href: `${ROUTES.home}#specimens` },
      { label: "Pricing", href: ROUTES.pricing },
      { label: "Questions", href: ROUTES.faq },
      { label: "Blog", href: ROUTES.blog },
      { label: "Resume keywords by role", href: ROUTES.resumeKeywords },
    ],
  },
  {
    title: "Free tools",
    links: [
      { label: "ATS resume scanner", href: `${ROUTES.tools}/ats-checker` },
      { label: "Headline writer", href: `${ROUTES.tools}/headline-writer` },
      { label: "LinkedIn About builder", href: `${ROUTES.tools}/linkedin-about` },
      { label: "Link-in-bio page", href: `${ROUTES.tools}/link-in-bio` },
      { label: "All tools", href: ROUTES.tools },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Upload my resume", href: ROUTES.build },
      { label: "Create account", href: ROUTES.signup },
      { label: "Log in", href: ROUTES.login },
      { label: "Invite a friend", href: ROUTES.invite },
    ],
  },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--site-ink)] bg-[var(--site-paper)] pt-14 sm:pt-20">
      <div className="site-wrap grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--site-ink-2)]">
            Sets your resume as a portfolio website you can restyle, publish and share.
          </p>

          <a
            href={BUILDER.url}
            target="_blank"
            rel="noopener noreferrer"
            className="builder-card group mt-8 flex items-center gap-4 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-3 pr-4 transition-[transform,box-shadow,border-color] duration-500 [transition-timing-function:var(--site-ease)] hover:-translate-y-0.5 hover:border-[var(--site-ink)] hover:shadow-[0_18px_32px_-22px_rgba(16,17,20,0.5)]"
          >
            <BuilderAvatar src={BUILDER.avatar} initials={BUILDER.initials} className="builder-pic size-14" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-[var(--site-ink-2)]">Built by</span>
              <span className="block truncate text-base font-semibold tracking-[-0.01em]">{BUILDER.name}</span>
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--site-ink)] text-[var(--site-paper)] transition-[transform,background-color] duration-500 [transition-timing-function:var(--site-ease)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-[var(--site-accent)]">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold text-[var(--site-ink)]">{col.title}</h2>
            <ul className="mt-4 space-y-0.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="site-navlink inline-flex min-h-11 items-center text-[0.9375rem]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-14 pb-4 sm:mt-20 sm:pb-6">
        <FooterWordmark />
      </div>
    </footer>
  )
}

