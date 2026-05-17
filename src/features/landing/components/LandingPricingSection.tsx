import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

export function LandingPricingSection({ className }: { className?: string }) {
  return (
    <section id="pricing" className={cn("scroll-mt-20 border-t border-outline-variant py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-(--container-landing) px-4 sm:px-6 lg:px-8">
        <h2 className="typo-h1 mb-4 text-foreground">{messages.landing.pricing.title}</h2>
        <p className="typo-body-lg max-w-2xl text-muted-foreground">{messages.landing.pricing.body}</p>
      </div>
    </section>
  )
}
