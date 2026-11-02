# Proposal 2: AI search and brand query ("dossier resume" to #1)

Date: 2026-11-03. Inputs: `ANALYSIS_2026-11-03.md`, code audit (read only), web search. Skills: ai-seo, programmatic-seo.

## Findings

1. **The name is shared, and nothing on the site claims "Dossier Resume" or "Dossier CV".** A web search for "dossier resume" returns academic promotion dossiers, Interfolio's *Dossier* (academic CV/letters service, $48/yr), a Webflow "Dossier" portfolio template, an open-source "Dossier" AI job tracker, and a local-first "Dossier" CV builder (hntwari.vercel.app). A search for `"dossier-cv.com"` returned **zero pages from our domain**. That index (Claude's search uses Brave) has not picked us up yet, so assistants have nothing to reconcile "Dossier" with.
2. **Organization JSON-LD is minimal** (`src/app/(marketing)/page.tsx`): no `@id`, no `alternateName`, no `sameAs`, no `description`. `WebSite` has no `alternateName`, which is the field Google reads for the site name shown in results. Blog `publisher` and template `creator` repeat the org inline instead of pointing to one `@id`.
3. **`sameAs` is blocked on the owner.** `src/config/site.ts` links are placeholders (`https://x.com`, `https://github.com`, `https://linkedin.com`). Do not ship them into schema.
4. **SoftwareApplication offers are ambiguous.** Starter ($9) and Pro ($39) carry no billing period, so an agent reads "$39" as monthly or one-time. Pro's monthly price ($7) and INR prices are missing.
5. **Brand facts differ across pages.** Home title, OG title, llms.txt summary, and SoftwareApplication description are all phrased differently. Models check for consensus, so the description needs to be identical everywhere (block below).
6. **llms.txt is good structurally** (`src/app/llms.txt/route.ts`, built from live data, static). It lacks a name disambiguation line, the brand variants people search, explicit plan terms (one-time vs yearly, no auto-renew), and a "who it's for" line. Evidence for llms.txt as a ranking lever is weak (Ahrefs: 97% of 137k files get no AI-bot requests). Keep it because it costs little. Do not count on it.
7. **robots.ts allows all agents.** OAI-SearchBot, ChatGPT-User, PerplexityBot, and Claude-SearchBot can crawl. No change is needed. Check that the Netlify/CDN bot protection does not challenge them.
8. **The pricing page can be read by AI.** `/pricing` renders the server-side `Pricing` component with `PLAN_CARDS` as HTML and a clear title ("free, $9 once, or $39 a year"). The gap: no `/pricing.md`, and the time-limited offers in `OFFERS` (Black Friday 30%) are not stated in plain text anywhere an agent reads.
9. **Founder signal.** The Organization `founder` and blog `AUTHOR` both name Rishab Bhatt. That helps E-E-A-T on the site. It conflicts with the "founder stays anonymous on social" decision only if social bios link back to him. Decide once and keep it consistent.

## Canonical brand facts (repeat word for word: site, llms.txt, schema, every directory)

- **Name:** Dossier (also searched as "Dossier Resume", "Dossier CV"). Site: dossier-cv.com.
- **One sentence:** Dossier is a free resume builder that also turns your resume into a portfolio website.
- **What it does:** Build a resume from tested templates and download the PDF free, with no watermark. Or upload the resume you already have, and Dossier sets it as a portfolio website you can restyle and publish at a link.
- **Pricing:** Free ($0, PDF download and 1 published portfolio). Starter $9 one time (no badge, unlimited design shuffles, ZIP download). Pro $39 a year or $7 a month (up to 5 portfolios, visit counts). Nothing renews automatically. India: ₹399 / ₹1,499 a year.
- **Who it's for:** Job seekers and students who want an ATS-readable resume PDF and a personal site without paying for a subscription.
- **Not to be confused with:** Interfolio Dossier (academic file service) or the "Dossier" Webflow template.

## Schema changes (drafts; one `@graph` on home, `@id` references elsewhere)

```json
{ "@context": "https://schema.org", "@graph": [
  { "@type": "Organization", "@id": "https://dossier-cv.com/#org",
    "name": "Dossier", "alternateName": ["Dossier Resume", "Dossier CV", "dossier-cv.com"],
    "url": "https://dossier-cv.com", "description": "<one sentence above>",
    "logo": { "@type": "ImageObject", "url": "https://dossier-cv.com/brand/email-logo.png" },
    "email": "help@dossier-cv.com",
    "founder": { "@type": "Person", "name": "Rishab Bhatt", "url": "https://rishieee.netlify.app" },
    "sameAs": ["<OWNER: see list below>"] },
  { "@type": "WebSite", "@id": "https://dossier-cv.com/#website", "name": "Dossier",
    "alternateName": ["Dossier Resume", "Dossier CV"], "url": "https://dossier-cv.com",
    "publisher": { "@id": "https://dossier-cv.com/#org" }, "inLanguage": "en" },
  { "@type": "SoftwareApplication", "@id": "https://dossier-cv.com/#app",
    "name": "Dossier Resume Builder", "alternateName": "Dossier",
    "applicationCategory": "BusinessApplication", "applicationSubCategory": "Resume builder",
    "operatingSystem": "Web", "url": "https://dossier-cv.com", "description": "<what it does>",
    "publisher": { "@id": "https://dossier-cv.com/#org" },
    "offers": [
      { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD", "description": "Resume PDF download, no watermark, 1 portfolio" },
      { "@type": "Offer", "name": "Starter", "price": "9", "priceCurrency": "USD", "description": "One-time payment" },
      { "@type": "Offer", "name": "Pro", "price": "39", "priceCurrency": "USD",
        "priceSpecification": { "@type": "UnitPriceSpecification", "price": "39", "priceCurrency": "USD", "unitCode": "ANN" } },
      { "@type": "Offer", "name": "Pro monthly", "price": "7", "priceCurrency": "USD",
        "priceSpecification": { "@type": "UnitPriceSpecification", "price": "7", "priceCurrency": "USD", "unitCode": "MON" } } ] }
]}
```

- Blog `publisher` and template `creator` become `{ "@id": "https://dossier-cv.com/#org" }`. Build the `@id` from `siteConfig.url`.
- Add `aggregateRating` only after real, verifiable reviews exist (G2 or Product Hunt). Never invent one.
- Put `sameAs` in `siteConfig.links` so the footer and schema read the same values.

**sameAs URLs the owner must supply** (only profiles that exist and say "Dossier"):
1. X / Twitter brand page 2. LinkedIn company page 3. Instagram 4. GitHub org (if public)
5. Product Hunt product page 6. Wikidata item (Q-number) 7. Crunchbase 8. AlternativeTo 9. G2 or Capterra listing 10. YouTube channel (if any)

## On-page brand moves (rank #1 for "dossier resume")

- Home `<title>`: "Dossier Resume: Free Resume Builder and Portfolio Website". The brand variant goes first. Keep the rest.
- One visible line on the home page and footer: "Dossier (dossier-cv.com) is a free resume builder..." This puts the exact brand phrases in body text.
- `/about` page (it does not exist): the canonical facts, founder, launch date, and contact. Assistants look for an "official" source, and ChatGPT's retrieval now favors `site:` and "official" queries.
- Submit the site in **Bing Webmaster Tools** (it feeds ChatGPT search and Copilot) and check that Brave can find it (Claude). Today `"dossier-cv.com"` is not in that index at all.

## llms.txt rewrite (top block; keep the generated lists below it)

```
# Dossier (Dossier Resume / Dossier CV)

> Dossier is a free resume builder that also turns your resume into a portfolio website. Build a resume from tested templates and download the PDF free with no watermark, or upload the resume you already have and publish it as a site at a link. Website: https://dossier-cv.com

Dossier at dossier-cv.com is not Interfolio Dossier (academic file service) and not the "Dossier" Webflow template.

- Who it's for: job seekers and students who want an ATS-readable resume PDF and a personal website without a subscription.
- Pricing: Free $0 (resume PDF + 1 portfolio). Starter $9 one time. Pro $39/year or $7/month. Nothing renews automatically. India: ₹399, ₹1,499/yr.
- Template testing: every template is set as a PDF and read back with a parser (pdf.js); results and dates are on each template page. Commercial ATS products are not yet tested.
- Formats: English; 7 country formats (US/Canada, UK/Ireland, Europe, Germany, India, Gulf, Australia/NZ).
- Machine-readable pricing: https://dossier-cv.com/pricing.md
- Contact: help@dossier-cv.com
```

Also add `/pricing.md` as a static route built from `PLAN_CARDS` and `PRODUCTS`. Include any active `OFFERS` window with start and end dates. Link to it from llms.txt and the sitemap.

## Off-site actions (ranked by impact divided by effort)

| # | Action | Effort | Impact | Why |
|---|---|---|---|---|
| 1 | Bing Webmaster Tools + IndexNow, check Brave Search | 30 min | High | ChatGPT/Copilot use Bing; the domain is missing from one index today |
| 2 | Create brand profiles (X, LinkedIn page, Instagram) with the identical one-sentence bio, then fill `sameAs` | 1-2 h | High | Entity consolidation for the brand query |
| 3 | AlternativeTo listing as an alternative to Resume.io, Zety, Novorésumé, Read.cv | 30 min | Med-High | Often cited for "free alternative to X" prompts |
| 4 | Free SaaS directories (SaaSHub, There's An AI For That only if AI features apply, Futurepedia no, BetaList, Uneed, Fazier, Microlaunch) via the directory-submissions skill | 3-4 h | Med | Brand-name backlinks with the same description |
| 5 | Product Hunt launch (plan with the launch skill; do not post cold) | 1-2 days | High once | Ranks for "Dossier" brand queries, a citable third-party page |
| 6 | Wikidata item: instance of "web application", official website, inception date, `sameAs` IDs | 1 h | Med | Feeds the Google Knowledge Graph and LLM entity resolution. Wikipedia is out of reach (notability) |
| 7 | Reddit: honest answers in r/resumes, r/cscareerquestions, r/jobs, r/developersIndia when people ask for free builders or portfolio sites. Disclose that you built it | Ongoing | Med (volatile) | Perplexity still cites Reddit; ChatGPT less so since Aug 2026 |
| 8 | G2 / Capterra free listings, then ask paying users for reviews | 2 h + ongoing | Med later | Recommendation needs third-party consensus; few reviews are worth little at first |
| 9 | Crunchbase basic profile | 30 min | Low-Med | Another `sameAs` and entity source |

Every listing uses the canonical facts word for word. Monthly check: run 10 prompts ("free resume builder no watermark", "turn resume into website", "what is Dossier resume builder", "dossier-cv.com pricing") 3 times each in ChatGPT, Perplexity, and Claude. Log the mention rate (for example "3/9") in `docs/growth/`.

## Programmatic SEO ideas from existing data

Existing sets: `src/content/roles.ts` (16 roles: skills, tools, verbs, bullets, mistakes), resume examples (~50 fictional samples), 12+ tested templates with 7 country formats.

1. **Country CV format pages** `/resume-templates/format/[country]` (7 pages). These use the `FORMAT_FACETS` data plus the matching tested templates. UK CTR is 40% and the German post converts. Highest fit, small count.
2. **Role resume-summary and bullet pages** `/resume-keywords/[role]/bullet-points` (16). These reuse `bullets`, `verbs`, and `mistakes`, with a link to the bullet generator tool. Ship only if each page adds 10+ role-specific bullets beyond the keyword page, or it competes with that page.
3. **"[Role] portfolio website" pages** `/portfolio-examples/[role]` (16). These pair a role with real opted-in `/u/` sites plus a demo from that role's sample resume. This is the unique angle, because no resume-builder competitor has resume-to-site data. Noindex any role with fewer than 2 real sites.
4. **Template x country** combinations only where a template is actually tested for that format (for example "German CV template"). Skip blanket role x template pages because they would be thin and cannibalize the template pages.
5. **"[Competitor] alternative" pages** (Resume.io, Zety, Novorésumé, Canva resume) with a dated comparison table on PDF watermark, price, and portfolio site. 4-6 pages, built with the competitors skill. Comparisons are still cited by Perplexity and Google AI Overviews, and ChatGPT cites them less now.

Each page gets: Breadcrumb + FAQPage JSON-LD (already a pattern in the code), a "Last updated" date, a 40-60 word answer block at the top, hub links, and a sitemap entry.

## Owner decisions needed

1. The `sameAs` profile URLs (list above). 2. Whether the founder name stays in schema and the blog. 3. Approval of the home title change. 4. Whether to build `/about` and `/pricing.md`. 5. Which directories to submit to, and who submits.

Sources: web search 2026-11-03 for "dossier resume", "dossier cv builder", "dossier-cv.com"; ppc.land / Ahrefs llms.txt study; ai-seo skill references.
