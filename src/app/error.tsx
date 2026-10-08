"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Logo } from "@/components/marketing/primitives"
import { ROUTES } from "@/lib/constants/routes"

export default function GlobalRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="site flex min-h-dvh flex-col">
      <header className="site-wrap flex h-[72px] items-center">
        <Link href={ROUTES.home} aria-label="Dossier home" className="rounded-lg">
          <Logo />
        </Link>
      </header>
      <section className="site-wrap flex flex-1 flex-col justify-center pb-24">
        <p className="site-mono text-sm text-[var(--site-ink-2)]">Something broke</p>
        <h1 className="site-h1 mt-4 max-w-3xl">That did not work.</h1>
        <p className="site-lead mt-6">
          The page hit an error. Trying again often fixes it. If it keeps happening, go back to the home page and start over.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="site-btn site-btn-primary">
            <span className="site-btn-label">Try again</span>
          </button>
          <Link href={ROUTES.home} className="site-btn site-btn-ghost">
            <span className="site-btn-label">Back to home</span>
          </Link>
        </div>
        {error.digest ? <p className="site-mono mt-8 text-xs text-[var(--site-ink-2)]">Reference: {error.digest}</p> : null}
      </section>
    </main>
  )
}
