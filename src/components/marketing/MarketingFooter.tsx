import Link from "next/link"

import { LogoMark } from "@/components/marketing/MarketingPrimitives"
import { ROUTES } from "@/lib/constants/routes"

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Studio", href: "#studio" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Vision", href: "#about" },
    ],
  },
] as const

export function MarketingFooter() {
  return (
    <footer className="border-t border-black/[0.08] bg-[#F8F6F1] py-12 md:py-16">
      <div className="mk-container-wide grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.7fr_0.7fr_0.9fr]">
        <div>
          <Link href={ROUTES.home} className="mk-focus inline-flex rounded-xl">
            <LogoMark />
          </Link>
          <p className="mt-5 max-w-[240px] text-sm leading-6 text-[var(--mk-text-secondary)]">
            Turn your resume into a portfolio that opens doors.
          </p>
          <p className="mt-10 text-xs text-[var(--mk-text-muted)]">© 2026 Dossier. All rights reserved.</p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-bold text-[var(--mk-text-primary)]">{group.title}</p>
            <div className="mt-5 flex flex-col gap-3">
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="mk-focus w-fit rounded-md text-sm text-[var(--mk-text-secondary)] transition hover:text-[var(--mk-text-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="text-sm font-bold text-[var(--mk-text-primary)]">Resources</p>
          <p className="mt-5 text-sm text-[var(--mk-text-secondary)]">Changelog <span className="text-[var(--mk-text-muted)]">Coming soon</span></p>
        </div>
      </div>
    </footer>
  )
}
