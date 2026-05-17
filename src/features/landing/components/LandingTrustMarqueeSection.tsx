import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

export function LandingTrustMarqueeSection({ className }: { className?: string }) {
  const { trust, marquee, trustLogos } = messages.landing
  const line = marquee.items.map((t) => `• ${t}`).join("  ")

  return (
    <section
      className={cn(
        "relative overflow-hidden border-y border-outline-variant py-12 sm:py-16 lg:py-20",
        className
      )}
      aria-label={trust.label}
    >
      <div className="landing-trust-grid pointer-events-none absolute inset-0 opacity-[0.28] dark:opacity-15" aria-hidden />

      <div className="relative mx-auto max-w-(--container-landing) px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-10">
          <span className="inline-flex items-center rounded-full border border-outline-variant bg-card/90 px-4 py-1.5 typo-label-sm font-bold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur-sm">
            {trust.label}
          </span>
          <p className="max-w-md typo-body-md text-on-surface-variant">{trust.subtitle}</p>
        </div>

        <div className="mb-10 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 sm:pb-2 [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex min-w-min flex-nowrap justify-center gap-2 sm:flex-wrap sm:justify-center sm:gap-3">
            {trustLogos.map((name) => (
              <div
                key={name}
                className="shrink-0 rounded-lg border border-outline-variant/80 bg-surface-container-lowest px-4 py-2.5 text-center typo-label-sm font-semibold text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-outline-variant/80 bg-card/85 py-4 shadow-inner backdrop-blur-md dark:bg-card/60">
          <div className="landing-marquee">
            <div className="landing-marquee__track typo-label-sm font-semibold uppercase tracking-[0.18em] text-primary sm:typo-body-md">
              <span className="whitespace-nowrap text-foreground/90">{line}</span>
              <span className="whitespace-nowrap text-foreground/90" aria-hidden>
                {line}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
