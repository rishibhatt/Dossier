import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ModeCompareSlider } from "@/components/marketing/ModeCompareSlider"
import { Eyebrow } from "@/components/marketing/MarketingPrimitives"

export function ModeComparison() {
  return (
    <section id="modes" className="mk-anchor-section mk-mode-section py-20 md:py-24">
      <div className="mk-container-wide grid grid-cols-1 items-center gap-12 lg:grid-cols-[330px_1fr]">
        <div className="max-w-[330px]">
          <Eyebrow>Two modes. One story.</Eyebrow>
          <h2 className="mk-heading-xl mt-5">Classic or Creative? You choose.</h2>
          <p className="mk-body-md mt-6">
            Present your work your way. Classic for clarity and professionalism. Creative for impact and expression.
          </p>
          <Link
            href="#studio"
            className="mk-focus mt-6 inline-flex items-center gap-2 rounded-md text-sm font-bold text-[var(--mk-accent)]"
          >
            Preview both modes
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ModeCompareSlider />
      </div>
    </section>
  )
}
