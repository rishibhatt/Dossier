import { CircleDot } from "lucide-react"

import { HeroPortfolioMockup } from "@/components/marketing/Mockups"
import { EyebrowPill, MarketingButton } from "@/components/marketing/MarketingPrimitives"
import { ROUTES } from "@/lib/constants/routes"

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-76px)] overflow-hidden pb-20 pt-20 md:pt-24">
      <div className="mk-container-wide grid grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="max-w-[540px]">
          <EyebrowPill>AI-powered portfolio studio</EyebrowPill>
          <h1 className="mk-display-xl mt-7 text-balance">
            Turn your resume into a portfolio that <span className="mk-hero-accent">opens doors.</span>
          </h1>
          <p className="mk-body-lg mt-7 max-w-[520px]">
            Dossier reads your resume, understands your work, and helps you launch a beautiful portfolio in minutes. No
            code. No guesswork. Just your story, perfectly told.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MarketingButton href={ROUTES.build}>Build my portfolio</MarketingButton>
            <MarketingButton href="#how-it-works" variant="secondary">
              See how it works
            </MarketingButton>
          </div>
          <p className="mt-9 flex items-center gap-2 text-sm text-[var(--mk-text-muted)]">
            <CircleDot className="size-4 text-[var(--mk-text-secondary)]" aria-hidden />
            Designed for professionals who care about their work
          </p>
        </div>

        <HeroPortfolioMockup />
      </div>
    </section>
  )
}
