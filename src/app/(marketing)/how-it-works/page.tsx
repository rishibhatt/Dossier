import type { Metadata } from "next"

import { FinalCta } from "@/components/marketing/FinalCta"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { PageHead } from "@/components/marketing/PageHead"
import { SAMPLE_PERSON } from "@/components/marketing/sample"
import { buildPageMetadata } from "@/config/seo"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "How Dossier turns a resume into a website",
  description:
    "Upload a PDF, check what Dossier read, pick a look from the design engine and publish a link. What the AI does, what the rules do, and what stays private.",
  path: ROUTES.howItWorks,
})

const SPLIT = [
  {
    who: "The AI model",
    does: ["Reads the text of your PDF", "Sorts it into name, roles, jobs, skills, education and contact", "Tidies wording, only when you ask it to"],
    never: "Design your page, invent jobs or publish anything.",
  },
  {
    who: "The design engine",
    does: ["Suggests a look from your profession and how much you have written", "Sets type, colour, layout and hero by fixed rules", "Re-sets the same content in a new look when you shuffle"],
    never: "Change or drop your words. A shuffle is always reversible.",
  },
  {
    who: "You",
    does: ["Check and correct every field", "Choose the look and the order of sections", "Decide when to publish and whether search engines can see it"],
    never: "Need to code, design, or install anything.",
  },
] as const

export default function HowItWorksPage() {
  return (
    <>
      <PageHead
        running={["How it works", "4 steps"]}
        title="What happens between your PDF and your link."
        lead={<p>Two machines and one person. Here is exactly what each of them does, so nothing about your site is a surprise.</p>}
      />

      <section aria-labelledby="split-title" className="site-wrap pb-6">
        <h2 id="split-title" className="sr-only">
          Who does what
        </h2>
        <div className="grid grid-cols-1 border-y border-[var(--site-ink)] lg:grid-cols-3">
          {SPLIT.map((c, k) => (
            <div key={c.who} className={k > 0 ? "border-t border-[var(--site-rule-strong)] p-6 lg:border-l lg:border-t-0 lg:p-8" : "p-6 lg:p-8"}>
              <h3 className="site-h3">{c.who}</h3>
              <ul className="mt-5 grid gap-2.5 text-[0.9375rem]">
                {c.does.map((d) => (
                  <li key={d} className="border-b border-[var(--site-rule)] pb-2.5">
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-[var(--site-ink-2)]">
                <b className="font-semibold text-[var(--site-ink)]">Never:</b> {c.never}
              </p>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks person={SAMPLE_PERSON} />
      <FinalCta title="Try it with your own resume." />
    </>
  )
}
