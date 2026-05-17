import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ProcessIcon } from "@/components/marketing/Mockups"
import { Eyebrow } from "@/components/marketing/MarketingPrimitives"

const steps = [
  {
    title: "Upload resume",
    body: "Upload your PDF. We extract the key information automatically.",
    type: "upload",
  },
  {
    title: "Structure content",
    body: "We organize your experience, projects, skills, and achievements.",
    type: "structure",
  },
  {
    title: "Design system",
    body: "A unique design system is generated to match your professional identity.",
    type: "design",
  },
  {
    title: "Live portfolio",
    body: "Your portfolio is ready to edit, refine, and publish with ease.",
    type: "live",
  },
] as const

export function ProcessSection() {
  return (
    <section id="how-it-works" className="mk-anchor-section mk-section border-y border-black/[0.06] bg-[#F8F6F1]">
      <div className="mk-container-wide grid grid-cols-1 gap-12 lg:grid-cols-[320px_1fr]">
        <div className="max-w-[330px]">
          <Eyebrow>From PDF to presence</Eyebrow>
          <h2 className="mk-heading-xl mt-5">We handle the heavy lifting. You get the spotlight.</h2>
          <p className="mk-body-md mt-6">
            Dossier turns your resume into a structured portfolio with the right content, layout, and design - ready to
            share with the world.
          </p>
          <Link
            href="#studio"
            className="mk-focus mt-6 inline-flex items-center gap-2 rounded-md text-sm font-bold text-[var(--mk-accent)]"
          >
            See how it works
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mk-process-row -mx-6 grid auto-cols-[13.75rem] grid-flow-col gap-5 overflow-x-auto px-6 pb-4 sm:mx-0 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <article key={step.title} className="mk-process-card relative">
              {index > 0 ? <span className="mk-process-connector hidden lg:block" aria-hidden /> : null}
              <div className="flex justify-center">
                <ProcessIcon type={step.type} />
              </div>
              <p className="mt-8 text-sm font-extrabold text-[var(--mk-text-primary)]">
                {index + 1}. {step.title}
              </p>
              <p className="mt-4 text-xs leading-6 text-[var(--mk-text-secondary)]">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
