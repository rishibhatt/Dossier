import Link from "next/link"
import { Plus } from "lucide-react"

import { RunningHead } from "@/components/marketing/PageHead"
import { ROUTES } from "@/lib/constants/routes"

export type FaqItem = { q: string; a: string; group: "Basics" | "Your data" | "Design" | "Publishing" | "Plans" }

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    group: "Basics",
    q: "Do I need to know how to code or design?",
    a: "No. You upload a PDF, pick a look and press publish. If you do code, Starter and Pro let you download the site as plain HTML and CSS and edit it yourself.",
  },
  {
    group: "Basics",
    q: "What file can I upload?",
    a: "A PDF up to 10 MB. Export it from Word, Google Docs or Pages if your resume lives there. Scanned images of a resume do not read well yet.",
  },
  {
    group: "Basics",
    q: "Can I do all of it on my phone?",
    a: "Yes. Upload, edit, restyle and publish all work on a phone browser. Nothing needs installing.",
  },
  {
    group: "Your data",
    q: "What happens to my resume?",
    a: "The text is sent to an AI service (Groq, with OpenRouter as a backup) so it can be read and sorted into sections. The AI reads and tidies wording only; it does not design your page. Nothing is public until you press Publish.",
  },
  {
    group: "Your data",
    q: "Can people find my portfolio on Google?",
    a: "Not by default. Every published page asks search engines to skip it. You can switch indexing on for a portfolio you want found.",
  },
  {
    group: "Your data",
    q: "Can I delete my portfolio?",
    a: "Yes. Email us from the address on your account and we will take the page down and delete the saved copy. A delete button in the dashboard is on the way.",
  },
  {
    group: "Design",
    q: "Will shuffling the design mess up my content?",
    a: "No. Looks are set by rules over your saved content, so a shuffle changes type, colour and layout and leaves every word where you put it. You can shuffle back.",
  },
  {
    group: "Design",
    q: "Is my site made by AI?",
    a: "The layout is not. Dossier's design engine picks from a fixed catalogue of looks using rules. AI is used for two jobs only: reading your resume and, if you ask, polishing wording.",
  },
  {
    group: "Publishing",
    q: "Can I change the site after I publish?",
    a: "Yes. Edit or shuffle, then publish again. The link stays the same.",
  },
  {
    group: "Publishing",
    q: "Can I use my own domain?",
    a: "Not yet. Custom domains are planned for Pro. Until then every portfolio gets a Dossier link, and Starter users can host the downloaded files anywhere they like.",
  },
  {
    group: "Plans",
    q: "What is the Dossier badge?",
    a: "Free portfolios show a small \"Made with Dossier\" link in the footer. Starter and Pro remove it.",
  },
  {
    group: "Plans",
    q: "Is Starter really a single payment?",
    a: "Yes. $9 once covers one portfolio with no badge, unlimited shuffles and the ZIP download. Pro is $39 a year for up to five portfolios.",
  },
  {
    group: "Plans",
    q: "How do invite credits work?",
    a: "Send a friend your invite link. When they sign up and publish their first portfolio, you both get a credit. One credit adds 20 extra shuffles for a week. Three credits unlock Starter.",
  },
] as const

function Item({ item }: { item: FaqItem }) {
  return (
    <details className="group border-b border-[var(--site-rule)]">
      <summary className="flex min-h-16 items-center justify-between gap-6 py-4 text-left">
        <span className="faq-q text-lg font-semibold tracking-[-0.015em]">{item.q}</span>
        <Plus className="faq-plus size-5 shrink-0 transition-transform duration-300" aria-hidden />
      </summary>
      <div>
        <div>
          <p className="site-body pb-6">{item.a}</p>
        </div>
      </div>
    </details>
  )
}

/** Short FAQ for the home and pricing pages, linking to the full page. */
export function Faq({ ids }: { ids?: readonly number[] }) {
  const items = (ids ?? [0, 3, 6, 4, 10, 8]).map((i) => FAQ_ITEMS[i]!).filter(Boolean)
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq scroll-mt-20 border-t border-[var(--site-rule-strong)] py-20 sm:py-28">
      <div className="site-wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
        <RunningHead label="Questions" no="007" className="!mb-0 lg:col-span-12" />
        <div className="lg:col-span-4">
          <h2 id="faq-title" className="site-h2">
            Fair questions.
          </h2>
          <p className="mt-5 text-[0.9375rem] text-[var(--site-ink-2)]">
            <Link href={ROUTES.faq} className="site-link-mark font-medium text-[var(--site-ink)]">
              Read all {FAQ_ITEMS.length} answers
            </Link>
          </p>
        </div>
        <div className="min-w-0 border-t border-[var(--site-ink)] lg:col-span-8">
          {items.map((item) => (
            <Item key={item.q} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Every answer, grouped, for /faq. */
export function FaqFull() {
  const groups = [...new Set(FAQ_ITEMS.map((i) => i.group))]
  return (
    <div className="faq site-wrap pb-24">
      {groups.map((g) => (
        <section key={g} aria-labelledby={`faq-${g}`} className="grid grid-cols-1 gap-6 border-t border-[var(--site-ink)] py-10 lg:grid-cols-12">
          <h2 id={`faq-${g}`} className="site-h3 lg:col-span-4">
            {g}
          </h2>
          <div className="min-w-0 lg:col-span-8">
            {FAQ_ITEMS.filter((i) => i.group === g).map((item) => (
              <Item key={item.q} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
