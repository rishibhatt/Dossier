import type { Metadata } from "next"

import { FinalCta } from "@/components/marketing/FinalCta"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { ROUTES } from "@/lib/constants/routes"
import { TEMPLATES } from "@/lib/design/templates"

export const metadata: Metadata = buildPageMetadata({
  title: "Features: what Dossier does with your resume",
  description:
    "Resume reading, a design engine with 20+ looks, line-by-line editing, phone-first publishing and a ZIP download on paid plans.",
  path: ROUTES.features,
})

type Row = { name: string; detail: string; plan?: "Free" | "Starter" | "Pro"; soon?: boolean }

const GROUPS: { title: string; summary: string; rows: Row[] }[] = [
  {
    title: "Reading your resume",
    summary: "The part that saves you an evening of copying and pasting.",
    rows: [
      { name: "PDF upload", detail: "Any text-based PDF up to 10 MB, from a laptop or a phone.", plan: "Free" },
      { name: "Section sorting", detail: "Name, headline, jobs, projects, skills, education and contact are found and filled in.", plan: "Free" },
      { name: "Check every field", detail: "See what was read before anything is laid out, and correct it.", plan: "Free" },
      { name: "Wording polish", detail: "Ask the AI panel for a tighter version of your wording, then edit it as you like.", plan: "Free" },
    ],
  },
  {
    title: "The design engine",
    summary: "Rules, not guesswork, so every look works with your content.",
    rows: [
      { name: `${TEMPLATES.length} looks`, detail: "Each one a full pairing of type, palette, layout and hero, tuned for a kind of career.", plan: "Free" },
      { name: "Suggested first look", detail: "Picked from your profession and how much your resume says.", plan: "Free" },
      { name: "Shuffle", detail: "Re-set the same content in another look. Instant, and nothing is lost.", plan: "Free" },
      { name: "Unlimited shuffles", detail: "Free includes 3 a day. Starter and Pro remove the limit.", plan: "Starter" },
      { name: "Contrast checks", detail: "Palettes are checked for readable text before they reach you.", plan: "Free" },
    ],
  },
  {
    title: "Editing",
    summary: "Change anything without learning a website builder.",
    rows: [
      { name: "Edit on the page", detail: "Tap a line on the preview and type.", plan: "Free" },
      { name: "Reorder and hide sections", detail: "Lead with projects, or drop education, in a couple of taps.", plan: "Free" },
      { name: "Light and dark preview", detail: "See both before you publish.", plan: "Free" },
    ],
  },
  {
    title: "Publishing and sharing",
    summary: "A link that works in every application form.",
    rows: [
      { name: "Dossier link", detail: "Your site lives at dossier-cv.com/p/ followed by a short code.", plan: "Free" },
      { name: "Private from search", detail: "Pages ask search engines to skip them until you switch indexing on.", plan: "Free" },
      { name: "Republish, same link", detail: "Edits go live at the address you already sent.", plan: "Free" },
      { name: "No Dossier badge", detail: "Remove the small \"Made with Dossier\" footer link.", plan: "Starter" },
      { name: "Up to 5 portfolios", detail: "One per kind of role you apply for.", plan: "Pro" },
      { name: "Your own domain", detail: "Point yourname.com at your Dossier site.", plan: "Pro", soon: true },
      { name: "Visit counts", detail: "See how many people opened each page.", plan: "Pro", soon: true },
    ],
  },
  {
    title: "Owning your site",
    summary: "Leave whenever you like and take it with you.",
    rows: [
      { name: "ZIP download", detail: "Plain HTML, CSS and images you can host anywhere.", plan: "Starter" },
      { name: "PDF copy of your resume", detail: "A clean PDF generated from your edited content.", plan: "Pro", soon: true },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <>
      <PageHead
        running={["Features", `${GROUPS.reduce((n, g) => n + g.rows.length, 0)} items`]}
        title="Everything it does, on one sheet."
        lead={<p>Every feature, which plan includes it, and what is still planned. Nothing here is a mock-up.</p>}
      />
      <div className="site-wrap pb-10">
        {GROUPS.map((g) => (
          <section key={g.title} aria-labelledby={`f-${g.title}`} className="grid gap-6 border-t border-[var(--site-ink)] py-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id={`f-${g.title}`} className="site-h3">
                {g.title}
              </h2>
              <p className="mt-2 text-[0.9375rem] text-[var(--site-ink-2)]">{g.summary}</p>
            </div>
            <dl className="lg:col-span-8">
              {g.rows.map((r) => (
                <div key={r.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-b border-[var(--site-rule)] py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_6rem]">
                  <dt className="font-semibold">{r.name}</dt>
                  <dd className="sp-data col-start-2 row-start-1 text-right sm:col-start-3">
                    {r.plan}
                    {r.soon ? " (planned)" : ""}
                  </dd>
                  <dd className="col-span-2 text-[0.9375rem] text-[var(--site-ink-2)] sm:col-span-1 sm:col-start-2 sm:row-start-1">{r.detail}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <FinalCta />
    </>
  )
}
