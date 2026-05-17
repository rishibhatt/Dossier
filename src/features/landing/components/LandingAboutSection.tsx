import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

export function LandingAboutSection({ className }: { className?: string }) {
  const { title, body } = messages.landing.about

  return (
    <section
      id="about"
      className={cn(
        "scroll-mt-[calc(var(--marketing-nav-height)+0.5rem)] py-14 sm:py-16 lg:py-20",
        className
      )}
    >
      <div className="mx-auto max-w-(--container-landing) px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-8 sm:px-10 sm:py-10">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="typo-body-lg max-w-3xl text-pretty text-on-surface-variant">{body}</p>
        </div>
      </div>
    </section>
  )
}
