# 3. Content plan: country CV posts + high-intent ideas (2026-11-03)

Plan only. Nothing published, no source files edited. Research done 2026-11-03 with WebSearch/WebFetch.
Constraint kept: posts map to existing Dossier templates (`src/content/resume/templates.ts`). No Overleaf template was opened, studied or copied for this plan.

**Why these posts:** GSC 2026-11-03 shows country CV posts win clicks on few impressions (german-cv-format 28.6% CTR, UK 40% CTR). Ireland 17 impr / 1 click and Australia 18 impr / 0 clicks have demand and no page that matches it.
**What these posts add over the top results (information-gain line):** every format rule cites a government or university source on the page, and the builder's country preset already applies the rule, so the reader gets the rule and a document that follows it.

## (a) SEO gaps in the blog template

What `src/app/(marketing)/blog/[slug]/page.tsx` + `src/config/seo.ts` already emit: `<title>` (`seoTitle ?? title` + " | Dossier"), meta description, canonical (`alternates.canonical`), robots index, OG (`type: article`, published/modified time, author) and Twitter card, generated OG image `/og/blog/[slug]` (or `hero`), JSON-LD `Article` + `BreadcrumbList` + `FAQPage` (when `faq` is set), sitemap entry with `updated ?? published` as lastmod.

Gaps, by priority:
1. **No sources field.** `Post` has no `sources` and `Block` has no citation type, so the "verified" claim cannot be shown or marked up. Add `sources?: { label: string; url: string; accessed: string }[]`, render a "Sources" list under the body, and emit `citation` on `Article`. The live UK and German posts cite nothing today; backfill them.
2. **Title length.** The " | Dossier" suffix adds 10 chars. `uk-cv-format` renders 62 chars and gets cut in SERPs. Rule: `seoTitle` ≤ 50 chars. Proposed UK fix: "UK CV format: length, sections, what to omit" (54 total).
3. **OG copy = meta copy.** `buildPageMetadata` accepts `openGraph.{title,description}` but the post page never passes them, and `Post` has no `ogTitle`/`ogDescription`. Add both optional fields so social copy can differ from SERP copy.
4. **No builder deep link with a format.** `/resume/new` (`StartScreen`) has no `?format=` param; the preset is guessed from `navigator.language`. A reader in India reading the Australian post lands on the India preset. Add `?format=au|uk|us…` (and `?template=`), read it in `StartScreen`, and keep the select editable. Also: the sidebar CTA links to `/resume` (landing), not `/resume/new`.
5. **Related posts are weak.** `related` = same `category` ("Resume" holds ~25 posts) sliced to 3, so country posts do not reliably link to each other. Add `related?: string[]` slugs, or a `region` field to group country guides.
6. **Article schema thin spots.** No `inLanguage` (set `en-IE`/`en-AU`/`en-CA` per country post), no publisher `logo`, no `about` (e.g. `{ "@type": "Thing", name: "Curriculum vitae" }`), and `author.url` points to an external Netlify site rather than an on-site author page.
7. **Category enum** (`ATS | Resume | Portfolio | LinkedIn`) has no "Country formats"; the blog index cannot group the 6+ country guides into one hub. Optional: a `/blog` filter or a hub post "CV format by country" linking all of them.
8. **FAQ rich results:** Google shows FAQ rich results mainly for authoritative government/health sites since Aug 2023, so FAQPage will rarely show stars. Keep it: the Q&A text is still what AI answers quote.

## (b) Country posts

Shared rules for all three: one H1 (the `title`), keyword in first sentence, a "Sources" list, in-body link to `/resume/new` (with `?format=` once gap 4 ships), link to the matching template page and one example, cross-link to `uk-cv-format`, `german-cv-format`, `resume-vs-cv`, `how-long-should-a-resume-be`. Volumes: pull from Semrush before writing (none were pulled here; no numbers invented).

### B1. Ireland: `irish-cv-format`
- **Keyword:** irish cv format. **Variants:** cv format ireland, cv template ireland, how to write a cv for ireland, irish cv example.
- **Intent:** informational with a ready-to-act tail (they want the layout, then a file).
- **Title (H1):** Irish CV format: what employers in Ireland expect
- **seoTitle (47, 57 with suffix):** Irish CV format: length, sections, what to omit
- **Meta (138):** An Irish CV runs two pages for most people, opens with a short profile, and leaves out your photo and date of birth. Each rule is sourced.
- **OG title:** How to write a CV for jobs in Ireland. **OG description:** Two pages, no photo, no date of birth, referees ready. The Irish CV layout with sources for every rule.
- **H2 outline:** The layout, top to bottom / How long an Irish CV should be / Personal details to leave out (and why: Employment Equality Acts) / Referees / Irish CV vs UK CV (same format) / Graduate CVs / Example profile / Build yours
- **Verified rules:**
  - Graduate CV: "one page of A4 – two as an absolute maximum"; order: personal details, profile (optional), education, experience, additional info, referees; list one academic and one employer referee; check with referees first. Source: gradireland, https://gradireland.com/careers-advice/cvs-applications-and-tests/graduates-guide-cvs-what-your-cv-should-include
  - Irish and UK CVs follow the same format. Source: gradireland (same URL).
  - Leave out photo, age, date of birth, marital status, nationality unless the job needs it. Source: Trinity College Dublin Careers Service sample CV, https://www.tcd.ie/Careers/assets/pdf/student-pdf/skills-based-cv.pdf (seen via search index; PDF returned 404 to the fetcher, so open it in a browser and confirm wording before publishing).
  - Why: the Employment Equality Acts protect job applicants on nine grounds (gender, civil status, family status, sexual orientation, religion, age, disability, race, Traveller community) in "selection for a job". Source: IHREC, https://www.ihrec.ie/factsheets/discrimination-against-workers-recruitment-and-promotion
  - Save the file under your own name, not "CV.pdf". Source: gradireland (same URL).
- **Template:** [Ledger](/resume-templates/ledger) with format "UK / Ireland" (A4, "CV", no personal fields). Alt: [Modern](/resume-templates/modern). The Europa page already tells Irish readers to use Ledger/Modern, so the post agrees with it. Example: [solicitor](/resume-examples/solicitor) (UK preset).
- **Internal links:** /resume/new, /resume-templates/ledger, /blog/uk-cv-format, /blog/resume-vs-cv, /blog/how-long-should-a-resume-be, /tools/ats-checker.
- **FAQ:** How long should a CV be in Ireland? / Do I put a photo on an Irish CV? / Should I include my date of birth on a CV in Ireland? / Is an Irish CV the same as a UK CV? / How many referees do I need on an Irish CV?

### B2. Australia: `australian-resume-format`
- **Keyword:** australian resume format. **Variants:** resume format australia, australian resume template, how to write a resume in australia, australian cv format.
- **Intent:** informational, high share of newcomers and international students (GSC: India is the top click country).
- **Title (H1):** Australian resume format: what employers expect
- **seoTitle (47, 57):** Australian resume format: pages, referees, visa
- **Meta (150):** Australian resumes run longer than US ones, list referees, and state your visa and work rights. Leave out photo and date of birth. Every rule sourced.
- **OG title:** Writing a resume for Australian jobs. **OG description:** Length, referees, visa status and what to leave out, with a government source for each rule.
- **H2 outline:** The layout / How many pages (and why the job ad wins) / Visa status and work rights / What to leave out / Referees / Government (APS) jobs: resume plus pitch / Resume or CV in Australia? / Build yours
- **Verified rules:**
  - Order: personal statement (2–3 sentences or 3–4 bullets), work experience most recent first, education, visa status and work availability (visa type, expiry, restrictions), technical skills, interests. Source: Study Australia (Australian Government), https://studyaustralia.gov.au/en/tools-and-resources/tips-and-advice-for-students/the-international-student-s-guide-to-writing-a-great-resume--
  - Length: "no more than four pages"; do not include personal details not relevant to the role, such as date of birth and marital status. Source: ASIC careers resume tips (Australian Government agency), https://careers.asic.gov.au/pdf/Resume_tips.pdf
  - APS roles: CVs commonly run two to six pages and a separate pitch is often capped (one to two pages or a word limit stated in the ad). Source: APSC "Cracking the code", https://www.apsc.gov.au/working-aps/joining-aps/cracking-code/3-applying-aps-job-cracking-code (fetch timed out; wording taken from search index, confirm before publishing).
  - Referees: at least two for most applications. Source: Veterans' Employment (Australian Government), https://www.veteransemployment.gov.au/partners-finding-and-getting-job/writing-resume (search snippet; confirm). Victoria's Live in Melbourne allows two to three referees or "available on request": https://liveinmelbourne.vic.gov.au/work/find-a-job-in-melbourne/how-to-apply-for-a-job-in-melbourne (403 to fetcher; confirm).
  - Photo: no government source found. Write it as convention ("not expected") or drop it. `[NEED: official source for no-photo rule]`
- **Template:** [Ledger](/resume-templates/ledger) with format "Australia / NZ" (A4, "Resume", no DOB). Students: [Fresher](/resume-templates/fresher) (supports `au`). Examples on the AU preset: [business analyst](/resume-examples/business-analyst), [barista](/resume-examples/barista), [electrician](/resume-examples/electrician) (confirm each page renders the AU preset).
- **Product check:** AU preset note says "Two to three pages is normal". Sources say up to four (ASIC) and two to six (APSC). Soften to "Two to four pages is common; follow the job ad" or keep as-is and cite.
- **Internal links:** /resume/new, /resume-templates/ledger, /resume-templates/fresher, /blog/how-long-should-a-resume-be, /blog/resume-vs-cv, /blog/how-to-tailor-resume-to-job-description.
- **FAQ:** How many pages should an Australian resume be? / Do I put referees on my resume in Australia? / Should I include my visa status? / Do Australian resumes have a photo? / Is it a resume or a CV in Australia?

### B3. Canada: `canadian-resume-format`
- **Keyword:** canadian resume format. **Variants:** resume format canada, canadian resume template, canada resume for newcomers, cv vs resume canada.
- **Intent:** informational, newcomer-heavy; strong builder fit.
- **Title (H1):** Canadian resume format: what employers expect
- **seoTitle (49, 59):** Canadian resume format: 2 pages, no photo, no SIN
- **Meta (146):** A Canadian resume is two pages at most, has no photo, age, marital status or SIN, and leaves references for later. The rules, sourced to Job Bank.
- **OG title:** How to write a resume for Canadian jobs. **OG description:** Two pages, no photo, no SIN, references on request. Every rule from Job Bank and WorkBC.
- **H2 outline:** The layout / Two pages, recent jobs first / What to leave out / References / Writing style (no "I", numbers, action verbs) / Resume vs CV in Canada / Tailoring and keywords / Build yours
- **Verified rules:**
  - "Limit your resume to two pages"; cut or shorten jobs older than 15 years; name, address, email, phone at the top; 5–7 bullets per section; no photo; never your SIN; leave out age, height, weight, marital status, religion, political views; no reasons for leaving; references on a separate sheet, given only when asked; write without "I/my/me"; quantify results. Source: Job Bank (Government of Canada), https://www.jobbank.gc.ca/findajob/resources/write-good-resume
  - "usually are between one and two pages"; omit "birthdate or marital status"; tailor to the posting's keywords; a strength-based (non-chronological) resume is fine; references only if asked, with permission. Source: WorkBC (Province of British Columbia), https://www.workbc.ca/get-support/job-application-tips/resume-and-cover-letter
  - Do not claim a paper size or "CV = academic" rule without a source. `[NEED: official source]` or phrase as Dossier's preset default (US Letter).
- **Template:** [Ledger](/resume-templates/ledger) or [Plain](/resume-templates/plain) with format "US / Canada" (Letter, "Resume"). Newcomers changing field: [Switcher](/resume-templates/switcher). No Canada-specific example exists; a US-preset example such as [customer service associate](/resume-examples/customer-service-associate) works, or add a Canadian sample later.
- **Internal links:** /resume/new, /resume-templates/ledger, /resume-templates/switcher, /blog/resume-vs-cv, /blog/resume-action-verbs, /tools/ats-checker.
- **FAQ:** How long should a resume be in Canada? / Should I put a photo on a Canadian resume? / Do I include references on my resume? / Should I include my SIN or date of birth? / Is a CV the same as a resume in Canada?

## (c) More high-intent ideas, ranked

Scored with the content-strategy weights (customer impact 40, content-market fit 30, search potential 20, resources 10). Search potential is a placeholder until Semrush numbers are pulled. Titles are `seoTitle` (≤50 chars before " | Dossier").

| # | Slug / keyword | Intent | seoTitle | Meta description | Template / fit |
|---|---|---|---|---|---|
| 1 | `new-zealand-cv-format` / nz cv format | Info, ready to build | NZ CV format: length, referees, what to omit | A New Zealand CV: page count, referees and the personal details to leave out, each rule linked to a government source. | Ledger, AU/NZ preset already exists |
| 2 | `resume-format-for-jobs-abroad` / international resume format | Info, India-heavy (top GSC country) | Resume format for jobs abroad, by country | Applying from India to the UK, Gulf, Germany, Canada or Australia? One table of page counts, photo rules and personal details per country. | Hub linking all country posts; every preset |
| 3 | `us-resume-format` / us resume format | Info (US avg pos 19.9 today) | US resume format: one page, no photo, no DOB | The US resume: one page early on, two at most, no photo or date of birth. Layout, sections and an example, with sources. | Ledger/Plain, US preset |
| 4 | `europass-cv-alternative` / europass cv alternative | Commercial | Europass CV alternative: when to skip Europass | Europass is optional for most private-sector jobs. When an EU employer wants it, and a cleaner CV format for when they do not. | Europa template, EU preset |
| 5 | `dutch-cv-format` / dutch cv format | Info | Dutch CV format: what employers in NL expect | Length, photo, personal details and language levels for a CV in the Netherlands, each rule sourced. | Europa, EU preset |
| 6 | `australian-selection-criteria` / selection criteria examples | Info, high effort | Selection criteria: how to answer with STAR | Government jobs in Australia ask for a pitch or criteria answers. How to structure one with STAR, with the word limits agencies set. | Ledger + AU; pairs with B2 |
| 7 | `canadian-resume-no-canadian-experience` / resume with no canadian experience | Info, newcomer pain | Resume with no Canadian experience: what to do | How to present overseas jobs, volunteering and credentials on a Canadian resume when you have not worked in Canada yet. | Switcher, US/Canada preset |
| 8 | `references-on-resume` / references on resume | Info | References on a resume: include them or not? | Whether to list references or "available on request", by country: US, Canada, UK, Ireland, Australia. Each rule sourced. | Cross-links all country posts |
| 9 | `resume-for-job-switch` / resume for job change | Info, job-switch | Resume for a job switch: what to change first | Switching jobs in the same field? Retitle your summary, reorder bullets for the new role and update keywords. A 30-minute checklist. | Ledger; links career-change post |
| 10 | `resume-while-employed` / update resume while employed | Info, job-switch | Updating your resume while still employed | How to write your current role, dates and notice period on a resume when you are still in the job, and how to keep the search private. | Any; builder CTA |
| 11 | `cv-format-by-country` hub / cv format by country | Navigational hub | CV format by country: page, photo, DOB rules | One table for 9 countries: CV or resume, pages, photo, date of birth, referees. Links to the full guide for each. | Hub for gap 7; every preset |
| 12 | Refresh `uk-cv-format` + `german-cv-format` | Existing pages | (UK fix in gap 2) | Add sources (gov.uk / ACAS for UK; AGG text for Germany) and the `?format=` deep link. | Low effort, protects 28.6–40% CTR pages |

**Suggested order:** B1 Ireland and B2 Australia (impressions already exist), item 12 refresh, B3 Canada, then items 2, 1, 3, 11. Ship gap 1 (sources field) and gap 4 (`?format=` link) before or with B1.

## Open items for the owner
- Confirm the four sources marked "confirm" (TCD PDF, APSC, Veterans' Employment, Live in Melbourne) in a browser; gov.au pages timed out for the fetcher.
- No official Australian source found for "no photo"; decide to drop the claim or phrase it as convention.
- Approve schema/model changes (gaps 1, 3, 4, 5); they are engineering work, not in this plan's scope.
- Pull Semrush volume/KD for the 3 country keywords and the 12 ideas before final ranking.
