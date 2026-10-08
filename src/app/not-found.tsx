import type { Metadata } from "next"

import { Logo, SiteButton } from "@/components/marketing/primitives"
import { ROUTES } from "@/lib/constants/routes"
import Link from "next/link"

export const metadata: Metadata = { title: "Page not found — Dossier", robots: { index: false } }

export default function NotFound() {
  return (
    <main className="site flex min-h-dvh flex-col">
      <header className="site-wrap flex h-[72px] items-center">
        <Link href={ROUTES.home} aria-label="Dossier home" className="rounded-lg">
          <Logo />
        </Link>
      </header>
      <section className="site-wrap flex flex-1 flex-col justify-center pb-24">
        <p className="site-mono text-sm text-[var(--site-ink-2)]">Error 404</p>
        <h1 className="site-h1 mt-4 max-w-3xl">This page is not here.</h1>
        <p className="site-lead mt-6">The link may be old, or the address may have a typo. Your portfolios are safe.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <SiteButton href={ROUTES.home} arrow>
            Back to home
          </SiteButton>
          <SiteButton href={ROUTES.build} variant="ghost">
            Build a portfolio
          </SiteButton>
        </div>
      </section>
    </main>
  )
}
