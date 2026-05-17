import { Clock3, FileCheck2, Star, Users } from "lucide-react"

import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

const statIcons = [FileCheck2, Users, Star, Clock3] as const

export function LandingStatsTestimonialSection({ className }: { className?: string }) {
  const { stats, testimonial } = messages.landing
  const statEntries = [
    { value: stats.portfolios, label: stats.portfoliosLabel },
    { value: stats.countries, label: stats.countriesLabel },
    { value: stats.rating, label: stats.ratingLabel },
    { value: stats.support, label: stats.supportLabel },
  ] as const

  return (
    <section className={cn("border-t border-outline-variant bg-surface-container-low py-16 sm:py-20 lg:py-24", className)}>
      <div className="mx-auto max-w-(--container-landing) px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {statEntries.map((row, i) => {
              const Icon = statIcons[i] ?? FileCheck2
              return (
                <div
                  key={row.label}
                  className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-shadow duration-300 hover:shadow-md sm:p-6"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <p className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{row.value}</p>
                  <p className="typo-label-sm mt-1 text-on-surface-variant">{row.label}</p>
                </div>
              )
            })}
          </div>
          <figure className="relative rounded-lg border border-outline-variant bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8 lg:p-10">
            <div
              className="absolute -left-1 top-6 hidden h-16 w-1 rounded-full bg-primary lg:block"
              aria-hidden
            />
            <blockquote className="typo-body-lg text-pretty text-foreground sm:text-xl">
              &quot;{testimonial.quote}&quot;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-outline-variant pt-6">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-sm font-bold text-primary-foreground"
                aria-hidden
              >
                {testimonial.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="typo-label-sm text-on-surface-variant">{testimonial.role}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
