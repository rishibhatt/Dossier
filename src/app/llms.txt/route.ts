import { siteConfig } from "@/config/site"
import { templateEntries } from "@/content/resume/templates"
import { exampleEntries } from "@/content/resume/examples"
import { FREE_TOOLS } from "@/features/tools/catalog"
import { PLAN_CARDS } from "@/lib/billing/pricing"
import { ROUTES } from "@/lib/constants/routes"

/**
 * /llms.txt (llmstxt.org): a plain summary of what Dossier is and where the key pages are, for AI assistants and
 * agents. Built from the same data as the pages, so it stays current. Static at build time.
 */
export const dynamic = "force-static"

export function GET() {
  const u = (path: string) => `${siteConfig.url}${path}`
  const templates = templateEntries()
  const lines = [
    "# Dossier",
    "",
    "> Dossier is a free resume builder and a resume-to-portfolio website builder. Build a resume from tested templates and download the PDF free with no watermark, or upload the resume you already have and Dossier sets it as a portfolio website you can restyle and publish at a link.",
    "",
    `Every resume template is tested by setting it as a PDF and reading the text back with a parser (pdf.js): each field must come out complete and in order. Results and test dates are published on each template page. ${templates.length} templates; English only; 7 country formats (US/Canada, UK/Ireland, Europe, Germany, India, Gulf, Australia/NZ). Commercial ATS products have not been tested yet, and Dossier does not claim they have.`,
    "",
    "## Resume builder",
    `- [Resume builder](${u(ROUTES.resume)}): build a resume in the browser, live preview, free PDF download with a free account`,
    `- [Resume templates](${u(ROUTES.resumeTemplates)}): all templates with test results, filter by role, country, career stage and style`,
    `- [Resume examples by role](${u(ROUTES.resumeExamples)}): fictional sample resumes for ${exampleEntries().length} roles, each in a tested template`,
    `- [Resume keywords by role](${u(ROUTES.resumeKeywords)}): skills, tools and verbs for common roles`,
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
    ...PLAN_CARDS.map((p) => `- ${p.name}: ${p.price} ${p.cadence}. ${p.summary}`),
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
