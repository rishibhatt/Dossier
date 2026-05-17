import { FileText, Send, SlidersHorizontal } from "lucide-react"

import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

const icons = [FileText, SlidersHorizontal, Send] as const

export function LandingHowItWorksSection({ className }: { className?: string }) {
  const { title, subtitle, steps } = messages.landing.howItWorks

  return (
    <section
      id="how-it-works"
      className={cn("scroll-mt-[calc(var(--marketing-nav-height)+0.5rem)] py-16 sm:py-20 lg:py-24", className)}
    >
      <div className="mx-auto max-w-(--container-landing) px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl sm:mb-14">
          <h2 className="mb-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:mb-4 sm:text-4xl">{title}</h2>
          <p className="typo-body-lg text-on-surface-variant">{subtitle}</p>
        </div>
        <div className="relative grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden h-px border-t border-dashed border-outline-variant md:block lg:left-[15%] lg:right-[15%]"
            aria-hidden
          />
          {steps.map((step, index) => {
            const Icon = icons[index] ?? FileText
            return (
              <div
                key={step.title}
                className="group relative flex flex-col items-start rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-left shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="relative z-10 mb-5 flex size-12 items-center justify-center rounded-lg border border-outline-variant bg-primary-fixed/80 shadow-sm transition-shadow duration-300 group-hover:border-primary/35 group-hover:shadow-md">
                  <Icon className="size-6 text-primary" aria-hidden />
                </div>
                <h3 className="typo-h3 mb-2 text-foreground">{step.title}</h3>
                <p className="typo-body-md text-on-surface-variant">{step.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
