import { BRAND } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { FORMAT_FACETS, templateEntries } from "@/content/resume/templates"
import { exampleEntries } from "@/content/resume/examples"
import { FREE_TOOLS } from "@/features/tools/catalog"
import { formatPrice, PLAN_CARDS, PRODUCTS } from "@/lib/billing/pricing"
import { POSTS } from "@/content/blog/posts"
import { ROUTES } from "@/lib/constants/routes"
import { PRESET_IDS } from "@/lib/resume/schema"

/**
 * /llms.txt (llmstxt.org): a plain summary of what Dossier is and where the key pages are, for AI assistants and
 * agents. Built from the same data as the pages, so it stays current. Static at build time. The opening block
 * repeats the brand facts from `BRAND` word for word, and prices come from the checkout config.
 */
export const dynamic = "force-static"

export function GET() {
  const u = (path: string) => `${siteConfig.url}${path}`
  const templates = templateEntries()
  const p = (id: keyof typeof PRODUCTS, currency: "USD" | "INR") => formatPrice(PRODUCTS[id].price[currency], currency)
  const formats = FORMAT_FACETS.map((f) => f.label.replace(" / ", "/")).join(", ")
  const lines = [
    `# Dossier (${BRAND.alternateNames.join(" / ")})`,
    "",
    `> ${BRAND.oneLiner} ${BRAND.whatItDoes} ${BRAND.alsoFree} Website: ${siteConfig.url}`,
    "",
    "Dossier at dossier-cv.com is not Interfolio Dossier (an academic file service) and not the \"Dossier\" Webflow template.",
    "",
    `- Also searched as: ${BRAND.alternateNames.map((n) => `"${n}"`).join(", ")}.`,
    `- Who it's for: ${BRAND.audience}`,
    `- Pricing: Free ${formatPrice(0, "USD")} forever (resume PDF download, 1 published portfolio). Starter ${p("starter", "USD")} one time. Pro ${p("pro_year", "USD")} for a year or ${p("pro_month", "USD")} for a month. Every payment is one time: nothing renews automatically. Prices are in US dollars; in India they are ${p("starter", "INR")} (Starter), ${p("pro_year", "INR")} a year or ${p("pro_month", "INR")} a month (Pro).`,
    `- Template testing: every resume template is set as a PDF and read back with a parser (pdf.js); each field must come out complete and in order. Results and test dates are on each template page. Commercial ATS products have not been tested yet, and Dossier does not claim they have.`,
    `- Formats: ${templates.length} templates; English only; ${FORMAT_FACETS.length} country formats (${formats}).`,
    `- Contact: ${siteConfig.supportEmail}`,
    "",
    "## Resume builder",
    `- [Resume builder](${u(ROUTES.resume)}): build a resume in the browser, live preview, free PDF download with a free account`,
    `- [Resume templates](${u(ROUTES.resumeTemplates)}): all templates with test results, filter by role, country, career stage and style`,
    `- [Resume examples by role](${u(ROUTES.resumeExamples)}): fictional sample resumes for ${exampleEntries().length} roles, each in a tested template`,
    `- [Resume keywords by role](${u(ROUTES.resumeKeywords)}): skills, tools and verbs for common roles`,
    "",
    "## Cover letters",
    `- [Cover letter maker](${u(ROUTES.coverLetter)}): drafts a cover letter from your Dossier resume and the job ad, in ${PRESET_IDS.length} country formats, with a letterhead in the same design as your resume; drafting needs no account, the PDF downloads free with a free account, no watermark`,
    `- [Cover letter checker](${u(ROUTES.coverLetterChecker)}): paste a letter and the job post; checks role and company, greeting, results with numbers, the post's key words, stock phrases, template gaps and length; runs in the browser; does not check grammar`,
    ...POSTS.filter((p) => p.category === "Cover letter").map((p) => `- [${p.title}](${u(`${ROUTES.blog}/${p.slug}`)})`),
    "",
    "## Templates",
    ...templates.map((t) => `- [${t.engine.name} (${t.engine.no})](${u(`${ROUTES.resumeTemplates}/${t.slug}`)}): ${t.engine.bestFor}`),
    "",
    "## Portfolio website from a resume",
    `- [Home](${u("/")}): upload a resume PDF, get a portfolio site, restyle it, publish a link`,
    `- [How it works](${u(ROUTES.howItWorks)})`,
    `- [Website looks](${u(ROUTES.looks)}): every design in the engine`,
    "",
    "## Free tools",
    ...FREE_TOOLS.map((t) => `- [${t.name}](${u(`${ROUTES.tools}/${t.slug}`)}): ${t.h1}`),
    "",
    "## Pricing",
    ...PLAN_CARDS.map((c) => `- ${c.name}: ${c.price} ${c.cadence}. ${c.summary}`),
    `- Pro is also sold for one month at ${p("pro_month", "USD")}. A paid plan is a pass for its period, not a subscription: nothing renews by itself.`,
    "- The resume PDF download is free on every plan.",
    `- [Pricing page](${u(ROUTES.pricing)})`,
    "",
    "## Optional",
    `- [Blog](${u(ROUTES.blog)}): resume, ATS and portfolio guides`,
    `- [Questions](${u(ROUTES.faq)})`,
    "",
  ]
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
