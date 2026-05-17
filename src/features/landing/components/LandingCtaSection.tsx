import { LinkButton } from "@/components/atoms/LinkButton"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

export function LandingCtaSection({ className }: { className?: string }) {
  const { title, subtitle, primary, secondary } = messages.landing.cta

  return (
    <section className={cn("mx-auto mb-16 max-w-(--container-landing) px-4 sm:px-6 lg:mb-24 lg:px-8", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border px-6 py-12 shadow-xl sm:px-10 sm:py-14 lg:px-14 lg:py-16",
          "border-outline-variant bg-inverse-surface text-inverse-on-surface"
        )}
      >
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl lg:min-w-0 lg:flex-1">
            <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
              {title}
            </h2>
            <p className="typo-body-lg mt-4 max-w-xl text-inverse-on-surface/75">{subtitle}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:justify-end">
            <LinkButton
              href={ROUTES.build}
              className="min-h-11 border-0 bg-background px-6 py-3 font-semibold text-foreground shadow-lg shadow-black/20 hover:bg-background/90"
            >
              {primary}
            </LinkButton>
            <LinkButton
              href={`${ROUTES.home}#features`}
              variant="outline"
              className="min-h-11 border-inverse-on-surface/35 bg-transparent px-6 py-3 font-semibold text-inverse-on-surface hover:bg-inverse-on-surface/10 hover:text-inverse-on-surface"
            >
              {secondary}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}
