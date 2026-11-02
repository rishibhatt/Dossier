# Growth proposals, 2026-11-03

Five research passes, merged and ranked. Nothing here is built yet; each batch waits for the owner's go-ahead. Detail lives in the numbered files.

| File | Skills run | Topic |
|---|---|---|
| [1-how-it-works.md](1-how-it-works.md) | copywriting, cro | `/how-it-works` title, meta, above-the-fold CTA |
| [2-ai-seo-brand.md](2-ai-seo-brand.md) | ai-seo, programmatic-seo | Brand query, schema, llms.txt, AI citations |
| [3-content-plan.md](3-content-plan.md) | copywriting, content-strategy | Ireland, Australia, Canada posts; 12 more posts; blog SEO gaps |
| [4-pricing.md](4-pricing.md) | pricing, churn-prevention | Why nobody pays; checkout path; cancel flow |
| [5-ideas.md](5-ideas.md) | marketing-ideas, free-tools, referrals | 15 new traffic ideas |

## Batches, in recommended order

### A. Payment path (highest value per hour)
1. Open Razorpay checkout straight from `/pricing` and the upgrade sheet, instead of linking to `/dashboard/billing` (five steps today).
2. International payments: `INTERNATIONAL` is true only when `NEXT_PUBLIC_RAZORPAY_INTERNATIONAL === "1"` (`src/lib/billing/pricing.ts:6`). When it is off, UK, German and Gulf visitors see $9 on `/pricing` and ₹399 at billing, and foreign cards may be declined. Owner action: check the Netlify value and Razorpay's international payments approval.
3. Show the same price everywhere (Diwali price on billing cards and upgrade sheet, not a fixed "$9").
4. Mention the 7-day refund on `/pricing`; add a click event on every pricing button.
5. Remind Pro buyers before their pass ends (no reminder exists, so no renewals).

### B. Brand and AI search
1. Owner action today: add the site to Bing Webmaster Tools (import from Search Console). ChatGPT and Copilot search use Bing.
2. Use "Dossier Resume" and "Dossier CV" on the site: home title, Organization `alternateName`, llms.txt.
3. One combined Organization/WebSite/SoftwareApplication schema with `@id`, `alternateName`, description, and prices with their billing period. `sameAs` only with real profile URLs (current `site.ts` links are placeholders).
4. llms.txt rewrite with brand facts and "not Interfolio Dossier".
5. `/how-it-works`: title "Dossier Resume: How It Works, From PDF to Website", new description, CTA buttons above the fold.

### C. Content
1. Blog template first: a `sources` field shown on the page, `seoTitle` capped at 50 characters, separate OG copy, `/resume/new?format=` so a post opens the builder on that country's format.
2. Ireland and Australia posts (they already get impressions), then Canada. Four sources must be checked in a browser before publishing; claims without an official source are cut or worded as convention.
3. Add sources to the existing UK and German posts.
4. Migration posts: German CV for the Opportunity Card (Chancenkarte), UK CV for Skilled Worker visa jobs, Gulf jobs from India.
5. Later: New Zealand, US, Dutch, Europass alternative, "CV format by country" hub.

Overleaf: per the 2026-10-20 decision, templates are studied, never copied. Posts link to Dossier's own templates (Ledger with the matching country format).

### D. Off-site and bets (owner time, not code)
Quora answers as the brand, Product Hunt, AlternativeTo, Wikidata, honest "free alternative to Zety / Resume.io" pages, UK university careers pages, Telegram job channels, campus ambassadors. See 5-ideas.md for scores.

## Owner decisions needed
- Real brand profile URLs for `sameAs` (X, LinkedIn page, Instagram, Product Hunt, and so on), or skip `sameAs` for now.
- Whether the founder's name stays in schema and blog bylines, given the anonymous-social decision.
- Razorpay international payments: approved or not.
- Whether to name competitors on alternative pages.
- Semrush volumes for the country and migration posts before final ordering.
