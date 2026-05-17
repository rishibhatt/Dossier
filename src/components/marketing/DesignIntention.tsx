import { FileText, Layers3, MonitorSmartphone, SlidersHorizontal } from "lucide-react"

import { Eyebrow } from "@/components/marketing/MarketingPrimitives"

const features = [
  {
    title: "Structured content",
    body: "We extract what matters and structure it the right way.",
    Icon: Layers3,
  },
  {
    title: "Intentional design",
    body: "Typography, spacing, and color systems that elevate your work.",
    Icon: SlidersHorizontal,
  },
  {
    title: "Fully editable",
    body: "Everything is editable. Because your story deserves control.",
    Icon: FileText,
  },
  {
    title: "Responsive by default",
    body: "Looks perfect on every screen, everywhere.",
    Icon: MonitorSmartphone,
  },
] as const

export function DesignIntention() {
  return (
    <section id="features" className="mk-anchor-section mk-section bg-[#F8F6F1]">
      <div id="about" className="mk-anchor-section mk-container-wide grid grid-cols-1 gap-12 lg:grid-cols-[330px_1fr]">
        <div>
          <Eyebrow>Design that works for you</Eyebrow>
          <h2 className="mk-heading-xl mt-5 max-w-[430px]">Designed with intention, not left to chance.</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, body, Icon }) => (
            <article key={title}>
              <div className="mk-feature-icon">
                <Icon className="size-6 text-[#1F2330]" aria-hidden />
              </div>
              <h3 className="mt-7 text-sm font-extrabold text-[var(--mk-text-primary)]">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-[var(--mk-text-secondary)]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
