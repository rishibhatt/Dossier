import { FileSearch, Globe, GripVertical, Palette } from "lucide-react"

import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

const featureIcons = [FileSearch, GripVertical, Palette, Globe] as const

export function LandingFeaturesSection({ className }: { className?: string }) {
  const { sectionTitle, sectionSubtitle, cards } = messages.landing.features

  return (
    <section
      id="features"
      className={cn(
        "scroll-mt-[calc(var(--marketing-nav-height)+0.5rem)] border-y border-outline-variant bg-surface-container-low py-16 sm:py-20 lg:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-(--container-landing) px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <h2 className="mb-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:mb-4 sm:text-4xl">
            {sectionTitle}
          </h2>
          <p className="typo-body-lg text-on-surface-variant">{sectionSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2">
          {cards.map((card, index) => {
            const Icon = featureIcons[index] ?? FileSearch
            return (
              <div
                key={card.title}
                className="group flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-8"
              >
                <div className="flex size-11 items-center justify-center rounded-lg border border-outline-variant bg-primary-fixed/80 text-primary transition-colors duration-300 group-hover:bg-primary-fixed">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="typo-h2 text-foreground">{card.title}</h3>
                <p className="typo-body-md text-on-surface-variant">{card.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
