# Cover letter maker + checker: SEO, AI search and content plan

Date: 2026-11-03. Scope: organic search, AI answers and non-paid launch for a free cover letter maker and checker on dossier-cv.com.
Inputs: Semrush US 2026-10-26 ("cover letter generator" 12.1K/mo, KD 70, held by Grammarly, Canva and Zety), standard web searches run 2026-11-03, and the repo.
Rule used here: no volume is invented. Anything not in Semrush is marked **vol?** (volume unknown, check Semrush US + IN + UK + DE).

## 0. Where we can win

- Skip the head term at launch. The tool page targets it, but the traffic plan rests on long-tail, country and role pages.
- SERPs checked: role examples ("software engineer cover letter") are all big builders: Zety, ResumeLab, Jobscan, Enhancv, Resume Genius, Career.io. Hard. A role page only wins with content they lack (see quality bar).
- Weak SERPs where a careful page can rank: **India fresher** (Naukri, plus thin blogs: taggd, cvowl, superprof, stylingcv), **German Anschreiben in English** (expat blogs: Expatrio, SimpleGermany, iamexpat, settle-in-berlin; nobody cites DIN 5008 or the Bundesagentur clearly), **cover letter checker** (Resume Worded, Teal, a university tool, plus many spam pages on pages.dev), **cover letter vs resume** (page 1 includes several spam/parked domains).
- Medium: UK format (LiveCareer UK, Zety UK, resume.io, CV Genius, cvmaker.uk), short cover letter (Resume Genius, Novoresume, LiveCareer), career change (The Muse, Zety, SEEK), how to address (Resume Genius, Kickresume, SEEK, Zety). Most are builder blogs without primary sources, so a cited page has an edge for AI answers.
- Australia/Canada results are thin and mixed (careerfaqs.com.au, Employment Hero, university PDFs). Australia's "selection criteria" angle is underserved.
- Audience fit: India/UK/Germany/Gulf traffic matches the four weakest-to-medium country SERPs. Existing CV format posts (uk-cv-format, german-cv-format, cv-format-for-gulf-jobs, australian-resume-format, canadian-resume-format, resume-format-for-freshers) give each new page a strong internal-link partner.

## 1. Page architecture

### URL decision: `/tools/cover-letter-generator` and `/tools/cover-letter-checker` (recommended)
- Reuses `src/app/(marketing)/tools/[slug]/page.tsx`: WebApplication JSON-LD, FAQPage from `faq`, worked `examples`, and the tools hub. Adding two `FreeToolSlug` entries to `src/features/tools/catalog.ts` also lists them in `/llms.txt` automatically (it maps `FREE_TOOLS`).
- Matches how the site already ranks its tools ("free X generator, no sign-up"). Consistent URL patterns help both crawl and users.
- `/cover-letter` is worth it only once the maker saves letters to the dashboard like `/resume` does. If that happens, 301 the tool URL to it then. Do not run both at launch (cannibalisation).
- Short alias: `/cover-letter` → 308 to `/tools/cover-letter-generator` for typed URLs and social posts.

### Site map (new)
| URL | Type | Primary query | Notes |
|---|---|---|---|
| /tools/cover-letter-generator | Tool | cover letter generator (12.1K, KD 70); free cover letter maker vol? | Maker. Hub for everything below |
| /tools/cover-letter-checker | Tool | cover letter checker vol? | Paste letter + job ad, get a scored list of fixes |
| /cover-letter-examples | Hub | cover letter examples vol? | Lists role pages + country guides |
| /cover-letter-examples/[role] | Programmatic, 14 pages | [role] cover letter vol? each | Reuses `ROLES` slugs from `src/content/roles.ts` |
| /blog/[slug] x 12 | Guides | see section 3 | Country format posts sit beside the existing CV format posts |

### Programmatic role pages: quality bar (each page must clear all of these or ship `noindex`)
Data: a new `src/content/cover-letters.ts` keyed by `Role.slug` (keep `roles.ts` as the shared source of title, skills, tools, bullets, related). Per role, hand-written, never variable-swapped:
1. **One full sample letter, 250–350 words**, written for that role, using one of that role's existing `bullets` as the proof paragraph. Fictional candidate, labelled as fictional (same policy as resume examples).
2. **A second short version (≤150 words)** for email-body applications (common in India and the Gulf).
3. **Entry-level variant of the middle paragraph**: what a fresher in this role uses instead of work results (project, internship, coursework).
4. **"What to lift from the job ad"**: 4–6 phrases from the role's `skills`/`tools`, each with one line on where it belongs in the letter. Link to /resume-keywords/[role].
5. **Two role-specific mistakes** (different from the resume `mistakes`; e.g. data analyst: naming tools with no question answered).
6. **Opening line options**: three openers for this role, each tied to a different situation (referral, career change in, direct application).
7. Links: /resume-examples/[role], /resume-keywords/[role], 2–3 `related` roles, the maker pre-filled with the role (`?role=slug`).
Gate: ≥600 words of role-only text outside the shared shell; a reviewer reads two random pages side by side and finds no shared paragraph. Start with the 14 roles. Add roles only when `roles.ts` grows and each one gets the same treatment. No city or country × role combinations.
Schema: `Article` (author = Organization `{ "@id": SCHEMA_IDS.org }`), `BreadcrumbList`, `dateModified`. No FAQPage on role pages unless the questions are role-specific.

### Country format pages
Ship as blog posts in `src/content/blog/resume-builder-posts.ts` using the existing `sources` field and FAQ schema, slugs paired with the CV posts: `uk-cover-letter-format`, `german-cover-letter-anschreiben`, `cover-letter-for-gulf-jobs`, `australian-cover-letter-format`, `canadian-cover-letter-format`, plus the India fresher post. Each links both ways with its CV format twin and ends in the maker with the country preset (`?country=uk`), if the maker supports presets [confirm with build spec].

## 2. The two tool pages

Copy assumes the maker drafts without an account and, like the resume PDF, needs a free account for PDF download. **[confirm against the build spec before shipping; change "no sign-up" wording if the flow differs]**

### 2a. Cover letter generator — /tools/cover-letter-generator
- **Title (49):** Free cover letter generator, no sign-up | Dossier
- **Meta (139):** Paste the job ad and your resume. Get a one-page cover letter that names the role and uses your real results. Edit it, then copy or download.
- **OG title:** Write a cover letter for this job, not every job. **OG description:** Free generator that drafts from the job ad and your resume. Edit every line before you send it.
- **H1:** Free cover letter generator
- **Above the fold (under H1, one line):** Paste the job ad and your resume. You get a 250–350 word draft that names the role, quotes what the ad asks for, and backs it with a result from your resume.
- **Primary CTA:** Write my cover letter. **Secondary (text link):** Already wrote one? Check it →
- **Microcopy under the button:** Free. Your draft appears here; no account needed until you download the PDF. [NEED: storage policy before adding "we don't store your letter"]
- Options visible, not hidden: country style (US, UK, Germany, India, Gulf, Australia, Canada) and length (standard / short email version). These are the differentiators against Canva/Grammarly; they map to our country pages.
- **Worked example** (`examples` field): a generic opener ("I am writing to apply for the position…") vs the generated opener for a data analyst role.
- **FAQ (FAQPage JSON-LD, answers 40–60 words, each stands alone):**
  1. Is the cover letter generator free? (State exactly what is free and what needs an account.)
  2. How long should a cover letter be? (250–400 words for a standard letter; 100–200 for an email body; link to the post.)
  3. Will an AI-written cover letter get rejected? (Recruiters reject generic letters. Edit names, numbers and one personal reason; the draft is a start.)
  4. Do I still need a cover letter in 2026? (When the posting asks, when changing careers, when applying as a fresher; optional elsewhere.)
  5. How do I address a cover letter with no name? ("Dear Hiring Manager" or "Dear [Team] Team"; UK sign-off rule.)
  6. Can I write a cover letter for Germany or the UK? (Yes: country style changes layout, date format, sign-off; link guides.)
- **Schema:** existing `WebApplication` node from the tools template, plus: `name`, `url`, `applicationCategory: "BusinessApplication"`, `operatingSystem: "Any"` (browser), `offers` price 0, `featureList` (job-ad matching, country styles, short version, PDF), `isPartOf: { "@id": SCHEMA_IDS.website }`, `publisher: { "@id": SCHEMA_IDS.org }`. No `aggregateRating` until real reviews exist.
- **Internal links in:** home tools strip, /tools hub, resume builder download dialog (`DownloadDialog.tsx`: "Need a cover letter for this job?"), every resume example page, every role page, the 12 posts. **Out:** checker, examples hub, country guides, resume builder.

### 2b. Cover letter checker — /tools/cover-letter-checker
- **Title (52):** Free cover letter checker: score and fixes | Dossier
- **Meta (148):** Paste your cover letter and the job ad. See what is missing: the role name, a result with a number, the ad's key words, length and a clear ask. Free.
- **OG title:** Check your cover letter against the job ad. **OG description:** A free check that lists what to fix, line by line, before you hit send.
- **H1:** Free cover letter checker
- **Above the fold:** Paste your letter and the job ad. The checker lists what a recruiter will notice in the first read: missing role name, no numbers, phrases the ad repeats that your letter skips, and an opening that could go to any company.
- **Primary CTA:** Check my cover letter. **After results:** Fix it in the generator → (carries the letter + job ad across, no re-paste).
- Checks must be deterministic and explainable (rule-based, like the ATS checker), each with a one-line reason and a fix. Show a score only if every point is traceable to a check.
- **FAQ:** 1. What does the checker look for? 2. Does it check grammar? (Say honestly if not; suggest a grammar tool.) 3. Is my letter saved? [NEED policy] 4. What is a good cover letter length? 5. Should my letter repeat my resume? (No: pick 2–3 results that match the ad.) 6. Do ATS systems read cover letters? (Some store and search them; keywords from the ad help a human reader either way. Don't overclaim.)
- **Schema:** same WebApplication pattern, `featureList` = the checks.
- **Internal links:** ATS checker (sister tool: "Check the resume too"), generator, how-long and how-to-address posts.

### CRO notes (both pages)
- Tool first, explanation after. Inputs visible without scrolling on a 375 px phone; most traffic is mobile-heavy markets.
- One primary action per page. No nav mega-menu promos above the tool.
- Cross-sell after value, not before: after a draft or a check, show one card: "Your resume for this job" → resume builder with the same job ad.
- Keep the account gate at download (same as resume). Copy-to-clipboard stays free; it is how Gulf/India users paste into email.
- Track: `cl_tool_view`, `cl_generate`, `cl_check`, `cl_check_to_generate`, `cl_copy`, `cl_download_gate`, `cl_signup` in `src/lib/analytics.ts`, with source page (role/country/blog) for attribution.
- Test ideas: (1) H1 "Free cover letter generator" vs "Write a cover letter for this job"; (2) job-ad field first vs resume upload first; (3) showing a sample result before input vs empty state.

## 3. Blog posts (12), ranked by intent and SERP weakness
Format for each: answer in the first 50 words, one table or checklist, FAQ schema, `sources` filled, "Last updated" date, CTA block into the maker with a preset. Titles below are ≤50 chars before " | Dossier".

1. **Cover letter for a fresher: format and 3 samples** — meta: Fresher cover letter format for Indian job portals and email applications, with three samples for IT, commerce and core engineering roles. Outline: when freshers need one; email-body vs attachment (Naukri/LinkedIn file types); 250–350 words; what replaces work experience; 3 samples; mistakes. Sources: Naukri career advice, a university placement cell guide, National Career Service (India) portal. CTA: maker, India style, short version. vol?
2. **German cover letter (Anschreiben): format guide** — meta: How to write an Anschreiben in English or German: DIN 5008 layout, subject line, length, sign-off, and when English is acceptable. Outline: English vs German decision; DIN 5008 layout table; Betreff line; salary expectation and start date lines; sample in English. Sources: DIN 5008 summary, Bundesagentur für Arbeit application guide, Make it in Germany (government portal). Pairs with german-cv-format. vol?
3. **Cover letter for Gulf jobs: UAE and Saudi format** — meta: How to write a cover letter for UAE, Saudi and Qatar jobs: length, visa and notice-period lines, and email-body samples. Outline: email-first applications; visa status/notice period/availability; tone; 2 samples. Sources: no official format standard found; cite recruiter and employer guidance and label as convention. Pairs with cv-format-for-gulf-jobs. vol?
4. **UK cover letter format: layout, length, sign-off** — meta: UK cover letter layout with British date format, Yours sincerely vs Yours faithfully, 250–400 words, and a full example. Sources: National Careers Service (gov.uk), Prospects.ac.uk, a university careers service. vol?
5. **Career change cover letter: examples that work** — outline: the one-sentence reason; transferable proof table; 3 examples (retail→marketing, teacher→L&D, engineer→PM). Sources: SEEK career advice, university careers pages. CTA: maker with "career change" mode if built. vol?
6. **Internship cover letter: examples and a template** — students; coursework/project proof; 3 samples. Sources: university careers services. vol?
7. **Short cover letter examples (150 words or less)** — when short wins (email body, portals with text boxes); 6 samples. vol?
8. **How to address a cover letter without a name** — answer block first ("Dear Hiring Manager"), finding the name, UK/DE/IN salutation table, what to avoid. Strong snippet/AI-answer candidate. vol?
9. **How long should a cover letter be? Word counts** — table by country and by channel (portal, email, attachment). Links checker. vol?
10. **Australian cover letter format (with samples)** — includes the underserved selection-criteria/STAR section for government roles. Sources: APS/Australian government jobs guidance, SEEK. Pairs with australian-resume-format. vol?
11. **Canadian cover letter format, with an example** — work eligibility line, province address, Job Bank guidance. Sources: Job Bank (Government of Canada). Pairs with canadian-resume-format. vol?
12. **Cover letter vs resume: what each one must do** — comparison table; page 1 has spam domains, so an honest page can rank, but intent converts weakly. Links both builders. vol?

Meta descriptions for 5–12: write at build time from the outline; ≤155 chars, lead with the answer, no "In this guide".
Cadence: tools + hub + 14 role pages in week 1 (role pages `noindex` until each passes the bar); posts 1–4 in weeks 1–2; 5–12 at two a week.

## 4. AI search
- **llms.txt (`src/app/llms.txt/route.ts`):** the two tools appear automatically via `FREE_TOOLS`. Add a section:
  `## Cover letters` → generator, checker, `/cover-letter-examples` ("fictional sample cover letters for N roles, each with a short email version"), and the six country guides by name. Keep N computed from data, like resume examples.
- **Brand facts (`BRAND` in `src/config/seo.ts`):** add one line to `whatItDoes` (or a new `alsoFree` field used in home schema and llms.txt, word for word): "Dossier also has a free cover letter generator and checker that work from the job ad and your resume, with country styles for the UK, Germany, India, the Gulf, Australia and Canada." Only ship the country list that the tool actually supports.
- Home `#app` WebApplication node: add cover letter items to `featureList`.
- Answer blocks: every post and tool FAQ opens each section with a 40–60 word standalone answer. Cite primary sources (gov.uk, Bundesagentur, Job Bank) by name in the text; that is the gap in current builder-blog SERPs.
- ChatGPT is 14% of traffic: test 10 prompts monthly, 3 runs each, log mention rate ("free cover letter generator no sign up", "cover letter format germany english", "fresher cover letter india email", "how to address a cover letter uk", "cover letter checker free", etc.).

## 5. Launch marketing (non-paid, tied to the tool)
- **In-product first (highest intent, zero cost):** resume download dialog card; post-publish share screen; email to existing users: "Your resume is done. Here is the letter for the same job." One send, plain text.
- **Social (page accounts only, founder stays anonymous):** LinkedIn/X/IG series "One job ad, two letters": a generic opener vs the generated one, per role and per country. Carousel: "Anschreiben in 6 slides". Every post links the tool with UTM.
- **Communities (answer first, link only where rules allow):** r/resumes, r/developersIndia, r/Indian_Academia, r/germany and r/cscareerquestionsEU (Anschreiben questions), r/dubai job threads. Reply with a worked fix; link the checker when someone posts a letter.
- **Colleges:** offer placement cells in India and UK/DE university career services a free link they can share; give them the checker as a pre-submission step. Manchester already uses a commercial checker, which shows the demand.
- **Tool directories and launch sites:** Product Hunt (checker + generator as one launch), free-tool and AI directories. Use the existing directory-submissions list.
- **Linkable asset:** "Cover letter rules by country" table (salutation, date format, length, photo, language) on the hub; pitch to expat sites (Expatrio, iamexpat) and Indian career blogs as a citable reference.
- Measure at 30/60/90 days against the GSC baseline (memory: gsc-baseline): impressions for "cover letter" queries, tool sessions, `cl_generate` → signup rate.

Sources (searches 2026-11-03): resumeworded.com/cover-letter-checker, tealhq.com/tools/cover-letter-checker, careers.manchester.ac.uk (Careerset), zety.com, resumelab.com, jobscan.co, enhancv.com, livecareer.co.uk, resume.io/uk, cvgenius.com, expatrio.com, simplegermany.com, iamexpat, settle-in-berlin.com, naukri.com, taggd.in, cvowl.com, stylingcv.com, resumegenius.com, kickresume.com, seek.co.nz, themuse.com, careerfaqs.com.au, employmenthero.com/en-ca, monster.com, topresume.com.
