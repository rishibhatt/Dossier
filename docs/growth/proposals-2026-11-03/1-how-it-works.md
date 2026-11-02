# 1. /how-it-works: title, meta and CRO proposal (2026-11-03)

Status: proposal only. No source edited.

## Data
- GSC (24h): 101 impr, pos 5.8, CTR 5.9% (6 clicks). Home: 23.6% CTR at pos 5.2.
- Page appears for brand queries ("dossier resume" 137 impr, pos 6.3, 5.8% CTR; "dossier cv"; "career dossier").
- GA4: 9 users, 13s avg engagement, 33% bounce. Sample is far too small for conclusions; treat it as a direction, not a result.

## Current (src/app/(marketing)/how-it-works/page.tsx, lines 10-15)
- Title (41): `How Dossier turns a resume into a website`
- Description (154): `Upload a PDF, check what Dossier read, pick a look from the design engine and publish a link. What the AI does, what the rules do, and what stays private.`
- OG/Twitter: none set, so `buildPageMetadata` (src/config/seo.ts lines 36-44) reuses title + description and the site card `/opengraph-image`.
- No title template in root layout (src/app/layout.tsx line 46), so the title renders exactly as written.

Problems with the snippet: it does not contain the searched phrase "Dossier Resume" or the word "free", and it only describes the portfolio product. Someone searching "dossier resume" probably wants the resume builder, sees a page about websites, and clicks the home result instead.

## Title + description options (lengths checked)

**A. Brand-first (recommended)**
- Title (49): `Dossier Resume: How It Works, From PDF to Website`
- Desc (145): `See how Dossier works: upload your resume PDF, check each field, pick a look and publish a link. Or build a new resume and download the PDF free.`

**B. Both products named**
- Title (55): `How Dossier Works: Free Resume Builder + Portfolio Site`
- Desc (155): `Build a resume PDF free from tested templates, or upload the resume you have and get a portfolio site. See every step, and what the AI does and doesn't do.`

**C. Steps-led**
- Title (56): `How Dossier Resume Works: PDF Builder and Portfolio Site`
- Desc (143): `Four steps from resume to portfolio link: upload a PDF, check what Dossier read, pick a look, publish. Need a resume first? Build the PDF free.`

**Pick A.** It starts with the exact phrase from the biggest query ("dossier resume"), which Google bolds, and "How It Works" tells the searcher this is a different result from the home page, so the two listings don't look like duplicates. The description covers both intents (portfolio and resume builder) and ends on a free action. B is the safer fallback if A's CTR doesn't move in 4 weeks. It shares "Free Resume Builder" with the home title, which risks the two pages looking alike in the SERP.

All claims are backed: free PDF download (FAQ "Can I make just a resume", needs a free account), "tested templates" (home meta), 4 steps (HOW_STEPS), check/correct every field (HowItWorks step 2).

## OG / Twitter (add `openGraph` to the same call)
- og:title (54): `From resume PDF to a link you can send, in four steps.`
- og:description (103): `Upload a PDF, check every field, pick a look, publish. Or build a new resume and download the PDF free.`
- Image: keep the site card. A route-specific `opengraph-image` showing the 4 steps is optional and low priority.

## On-page CRO findings

| # | Issue | Impact | Fix | Priority |
|---|---|---|---|---|
| 1 | **No CTA above the fold.** `PageHead` (lines 38-42) gets no `children`. The first CTA is `FinalCta` at the very end, after the split grid and four steps that are each `lg:min-h-[62vh]` (about 3 screens of scroll on desktop). With 13s engagement, almost nobody gets there. | Visitors who already want to try it have nothing to click. | Pass CTA buttons as `PageHead` children. Primary: `Upload your resume` → `ROUTES.build` (or embed `<UploadSlot id="head-upload" />`, the same component FinalCta uses, which pushes to /build). Secondary text link: `Build a resume, free` → `ROUTES.resumeNew`. Microcopy: "Sign up only when you want to publish." (already used in FinalCta, so it's true). | High |
| 2 | **The page ignores the resume builder.** Brand traffic for "dossier resume" lands on a page that is only about PDF → website. The builder is mentioned once, in small text, in the FinalCta at the bottom. | Visitors who want the builder leave or go back to Google. | Add one short block after the hero: "Need a resume first? Pick a template, fill it in, download the PDF free. Turning it into a site later is one button." (from FAQ copy) with a link to `ROUTES.resumeNew`. Matches option A's description. | High |
| 3 | **The H1 and lead are clever but unclear.** "What happens between your PDF and your link." assumes the visitor has a PDF and knows a link is the output. "Two machines and one person" needs decoding. | Slower 5-second comprehension for cold brand visitors. | H1: `From your resume to a portfolio link, in four steps.` Lead: `Upload a PDF, check what Dossier read, pick a look and publish. Here is what the AI does, what the design rules do, and what you decide.` | Medium |
| 4 | **The promised steps come second.** The running head says "4 steps", but the "Who does what" grid (lines 44-65) comes before `<HowItWorks>` (line 67). | The answer to the page's own question sits below the fold. | Swap the order: `<HowItWorks>` first, then the SPLIT grid as the trust section ("What the AI never does"). | Medium |
| 5 | **No CTA between the steps and the end.** After step 4 ("Publish a link"), motivation peaks and there is nothing to click until FinalCta. | Lost clicks at the natural decision point. | Add an inline `Upload your resume` link right after the steps (or below the SPLIT grid if #4 is applied). | Medium |
| 6 | **The price objection is never answered.** The page doesn't say whether publishing costs anything. | "Is this free?" sends people to /pricing or away. | Near the hero CTA: "Free to publish, with a small Made with Dossier link in the footer." (backed by FAQ "What is the Dossier badge?"). | Medium |
| 7 | **Home numbering leaks in.** The embedded `HowItWorks` renders `RunningHead no="003"` (HowItWorks.tsx line 66), the home page's section number, on a standalone page. | Minor confusion and visual noise. | Add an optional `no` prop (or `hideRunningHead`), and pass none from this page. | Low |
| 8 | **The privacy proof is buried.** The "Never:" lines are good trust copy, but there's no link to the data FAQ. | Hesitant visitors can't confirm where their resume goes. | Under the SPLIT grid, add a link: `What happens to my resume` → /faq. | Low |
| 9 | **No per-CTA attribution.** You can't tell which CTA converts. | You can't evaluate #1, #2 or #5. | Fire the existing analytics CTA event with `location: "how-it-works-hero" / "-mid" / "-final"`. | Low |

Test idea once traffic allows: hero with `UploadSlot` embedded vs. two plain buttons. Primary metric: clicks to /build plus /resume/new.

## Exact files / lines that would change
- `src/app/(marketing)/how-it-works/page.tsx`
  - lines 10-15: new title, description, `openGraph` {title, description}
  - lines 38-42: new `title`/`lead`, add CTA children (#1, #3, #6)
  - after line 42: resume-builder block (#2)
  - lines 44-67: move `<HowItWorks>` above the SPLIT section and add a mid CTA (#4, #5), plus the FAQ link (#8)
  - line 68: optionally `FinalCta title="Try it with your own resume."` stays as it is
- `src/components/marketing/HowItWorks.tsx` line 66: make the `RunningHead` number optional (#7). Shared with home, so default to the current behaviour.
- `src/components/marketing/PageHead.tsx`: no change needed; `children` already renders under the title row (line 30).
- `src/config/seo.ts`: no change; `openGraph` override is already supported (lines 9-12, 36-44).
- `src/config/messages.ts`: no change (the page doesn't read SEO strings from it).

## Measure
Compare GSC CTR for /how-it-works and the query "dossier resume" over the 28 days before and after deploy (baseline 5.9% / 5.8%). In GA4, track CTA clicks from /how-it-works to /build and /resume/new.
