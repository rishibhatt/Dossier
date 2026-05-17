import { ArrowRight, CheckCircle2, FileText, LayoutTemplate, ShieldCheck, SlidersHorizontal } from "lucide-react"

import { LinkButton } from "@/components/atoms/LinkButton"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const workflowIcons = [FileText, LayoutTemplate, SlidersHorizontal] as const

export function LandingHeroSection({ className }: { className?: string }) {
  const copy = messages.landing.hero
  const m = messages.marketing

  return (
    <section
      className={cn(
        "relative mx-auto mb-12 max-w-(--container-landing) px-4 sm:mb-16 sm:px-6 lg:mb-20 lg:px-8",
        className
      )}
    >
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12">
        <div className="flex w-full flex-col gap-stack-md">
          <span className="typo-label-sm inline-flex w-fit items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 uppercase tracking-[0.18em] text-primary shadow-sm">
            <ShieldCheck className="size-4 shrink-0" aria-hidden />
            {m.heroEyebrow}
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-[3.8rem]">
            {m.heroTitleLead} <span className="text-primary">{m.heroTitleAccent}</span>.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">{m.heroSubtitle}</p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={ROUTES.build} size="lg" className="min-h-11 px-5 font-semibold">
              {m.heroPrimaryCta}
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
            <LinkButton
              href={`${ROUTES.home}#features`}
              variant="outline"
              size="lg"
              className="min-h-11 px-5 font-semibold"
            >
              {m.heroSecondaryCta}
            </LinkButton>
          </div>

          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            {copy.proofPoints.map((point) => (
              <div key={point} className="flex items-start gap-2 text-sm leading-5 text-on-surface-variant">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  )
}

function ProductPreview() {
  const copy = messages.landing.hero

  return (
    <div className="relative">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-2xl shadow-black/[0.08] dark:shadow-black/30">
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-background">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-destructive/80" aria-hidden />
              <span className="size-2.5 rounded-full bg-chart-3" aria-hidden />
              <span className="size-2.5 rounded-full bg-primary" aria-hidden />
            </div>
            <span className="typo-label-sm rounded-full border border-outline-variant bg-card px-3 py-1 text-on-surface-variant">
              {copy.preview.status}
            </span>
          </div>

          <div className="grid min-h-[26rem] bg-card md:grid-cols-[14rem_1fr]">
            <aside className="border-b border-outline-variant bg-surface-container-low p-4 md:border-b-0 md:border-r">
              <div className="mb-5">
                <p className="typo-label-sm mb-2 uppercase text-on-surface-variant">{copy.preview.sidebarLabel}</p>
                <div className="h-2.5 w-24 rounded-full bg-primary" />
              </div>
              <div className="space-y-3">
                {copy.workflow.map((item, index) => {
                  const Icon = workflowIcons[index] ?? FileText
                  return (
                    <div key={item.title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className="size-4 text-primary" aria-hidden />
                        <p className="typo-label-sm font-semibold text-foreground">{item.title}</p>
                      </div>
                      <p className="text-xs leading-5 text-on-surface-variant">{item.body}</p>
                    </div>
                  )
                })}
              </div>
            </aside>

            <div className="p-4 sm:p-6">
              <div className="rounded-xl border border-outline-variant bg-background p-5">
                <div className="mb-8 grid gap-5 sm:grid-cols-[1fr_7rem] sm:items-start">
                  <div>
                    <p className="typo-label-sm mb-3 uppercase text-primary">{copy.preview.eyebrow}</p>
                    <h2 className="text-2xl font-semibold leading-tight text-foreground">{copy.preview.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">{copy.preview.role}</p>
                  </div>
                  <div className="hidden aspect-square rounded-lg border border-outline-variant bg-surface-container-high sm:block" />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {copy.preview.sections.map((section) => (
                    <div key={section} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
                      <div className="mb-3 h-1.5 w-10 rounded-full bg-primary/80" />
                      <p className="typo-label-sm font-semibold text-foreground">{section}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-lg border border-outline-variant bg-surface-container-low p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="typo-label-sm font-semibold text-foreground">{copy.preview.panelTitle}</p>
                    <p className="text-xs text-on-surface-variant">{copy.preview.panelMeta}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-primary/80" />
                    <div className="h-2 w-10/12 rounded-full bg-outline-variant" />
                    <div className="h-2 w-7/12 rounded-full bg-outline-variant" />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden />
                  <p className="typo-label-sm font-semibold text-foreground">{copy.preview.footerTitle}</p>
                </div>
                <p className="text-xs text-on-surface-variant">{copy.preview.footerBody}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
