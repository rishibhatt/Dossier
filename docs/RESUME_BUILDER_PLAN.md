# Dossier Resume: build plan

Status: Phase 0 and most of Phase 1 built on 2026-10-20 (engine, 4 templates, verification harness, editor, start screen, `resumes` table and API). Not yet built: landing page, directory, SEO pages, AI tailoring, click-to-edit, code mode. Written 2026-10-20.

Build notes (what shipped differs from the plan in these places):
- Templates shipped: all 12 (R-001 to R-012). Verified with `npm run resume:verify` (12 templates x 28 fictional samples x 3 densities x 2 paper sizes = 2,016 runs, all passing). Pattern study: `docs/resume/OVERLEAF_PATTERNS.md`.
- 2026-10-23: 30 more templates (R-013 to R-042) on a shared renderer, `src/resume/typst/kit.typ`, aimed at the segments in `docs/resume/MARKET_RESEARCH.md`; 18 more samples (`sampleLibrary2.ts`, 46 in total); six more OFL faces (IBM Plex Serif, Lato, PT Serif, PT Sans, Fira Sans, Crimson Text). Verify runs a fresh compiler per template.
- Sample library (first round): 28 fictional people across tech, finance, healthcare, marketing and sales, design and writing, operations, education and research, engineering, law and HR, hospitality (`src/lib/resume/sampleLibrary.ts`). Each template lists its showcase samples in `templates.ts`.
- Marketing: `/resume` landing, `/resume-templates` directory and 12 detail pages, home hero "One resume. A PDF and a website."
- Verification uses the same Typst wasm and fonts as the browser, in Node, with pdf.js as the extractor. Poppler and veraPDF are still to be added in CI.
- Import runs entirely in the browser (pdf.js in the typesetter worker plus the existing regex reader), so no sign-in and no upload is needed. AI-assisted import for signed-in users is a later improvement.
- Drafts are stored in localStorage rather than IndexedDB.
- "Turn it into a website" hands the generated PDF to the existing `/build` flow through `pendingUpload`.
- The free-plan limit of 2 resumes is enforced by a database trigger (`enforce_resume_limit`), because signed-in users can reach the table through the Supabase REST API.
Inputs: owner interview (5 rounds), research on Overleaf and 10 competitors, a Typst engine benchmark run on this machine, a map of this codebase, design references (inspo, impeccable, hallmark), and the marketing frameworks (copywriting, cro, competitors, pricing, programmatic-seo, image, ai-seo, launch, no-ai-slop).

---

## 1. What we are building

A resume builder inside Dossier, at `dossier-cv.com/resume`. A person picks a tested template, types or imports their details, watches a real PDF update as they type, and downloads it for free after signing in. They can tailor a copy to a job post, check its ATS score, and turn it into a Dossier portfolio site with one click.

It has three parts:

1. **The engine.** Typst, compiled in the browser through WebAssembly. Templates are Typst files that read the resume as JSON. Preview and PDF come from the same compiler, so the download matches the preview exactly.
2. **The template library.** 12 original base layouts, each set up for country formats, career stages and styles. Every template is tested automatically by parsing its PDF back, and by hand in real ATS systems. Test results are published per template, with dates.
3. **The editor.** Form plus live preview, click-to-edit on the preview, a Typst code mode for power users, an AI panel for job-post tailoring, and an ATS score that reads the real PDF output.

### Owner decisions (from the interview)

| Topic | Decision |
|---|---|
| PDF engine | Typst via WASM in the browser |
| Editing | Form + live preview, inline edit on preview, code mode, AI chat panel |
| Template source | Original templates built from proven patterns. No scraping. |
| Directory axes | Role/industry, country format, career stage, style |
| AI in v1 | Job-post tailoring, ATS score with fixes |
| Verification | Automated parse-back tests + manual uploads to real ATS systems |
| Data model | Resume is its own document. One-click "turn into portfolio" copies data across. |
| Sign-in | Build without an account. Sign in to download. |
| Exports | PDF only in v1 |
| Languages | English only in v1 |
| AI cost | Free-tier models (Groq, OpenRouter) with per-user quotas |
| Brand | "Dossier Resume" on the same site and theme |
| Launch size | 12 base templates + role/stage/country variants for SEO |
| Timeline | No deadline. Ship by phases. |
| Photos | Only in templates for regions that expect one |
| Resumes per user | Free 1-2, paid unlimited |
| Download pricing | Left to this plan. See section 9. |

---

## 2. Should we scrape Overleaf or the internet for templates?

No. Reasons:

- Overleaf hosts about 430 CV templates. Their licenses are mixed: LPPL 1.3c, CC BY 4.0, MIT, and many "as stated in the work" uploads with no clear terms. Bulk copying breaks their site terms and some authors' licenses.
- Many gallery entries are real people's CVs, which means real personal data.
- Most popular LaTeX CVs fail ATS checks in predictable ways: icon fonts for contact details, sidebars that extract out of order, skill bars, contact details in headers.
- Copied templates would not share one data contract, so each one would need its own form mapping and its own bugs.

What we take instead is the **patterns**, which are not copyrightable: single-column dense layouts with right-aligned dates (Jake's Resume, moderncv banking), two-column with a sidebar (AltaCV, Awesome-CV), centered name with a contact row, rule-under-heading sections, academic section sets (publications, talks, referees). We rebuild those as original Typst templates on one shared data contract.

Typst Universe has permissive resume packages (basic-resume: Unlicense, modern-cv: MIT, brilliant-cv: Apache-2.0, imprecv: Apache-2.0, rendercv: MIT). We may read them for technique. If any code is adapted, keep the license notice in that template's folder.

---

## 3. Research summary

### 3.1 Overleaf, reverse engineered

- Taxonomy: 11 top-level tags; `cv` is one. Cross tags for language, TeX engine, two-column, cover letter, university.
- URLs: `/latex/templates/{slug}/{12-char-id}`, tag pages at `/latex/templates/tagged/cv`, pagination `/page/{n}`, localized subdomains (fr., de., ja.) that duplicate the catalog.
- Template page: title, "Top pick" badge, **Open as Template / View Source / View PDF**, thumbnail, author, last updated, license, abstract, tags, then the **full source inline** (strong for SEO).
- "Open as Template" needs sign-up, then copies the project into the editor. That is their acquisition funnel.
- Compile model: real LaTeX on a server, 2-10 s per compile, so the preview lags behind typing.

What Dossier does better: compile in about 26 ms in the browser so the preview tracks keystrokes, a form for people who don't write markup, one data contract across every template, and published ATS results.

### 3.2 Competitors

| Product | Download | Notes |
|---|---|---|
| Resume.io | PDF paywalled, cheap trial that auto-renews at about $24.95/mo | `/resume-examples/{role}`, 500+ pages. Top complaint: surprise renewals. |
| Zety | PDF paywalled, 14-day trial then about $24 per 4 weeks | Big blog of role examples. "Subscription trap" complaints, including in German consumer press. |
| Novoresume | Free basic, premium about $16-29/mo or about $99 lifetime | Claims ATS-tested, no published method. |
| Rezi | Free: 1 resume, 3 PDF downloads. $29/mo or $149 lifetime | ATS-first marketing, AI writer. |
| Teal | Free unlimited downloads | Moat is the job tracker and Chrome extension. |
| Kickresume | 4 free templates, unlimited downloads | Has resume-to-website, which overlaps Dossier. |
| Reactive Resume | Free, MIT, self-hostable | Open-source benchmark. |
| FlowCV | Free unlimited PDFs, no watermark. Pro $5/mo | Best free offer today. |
| Canva | Free | Widely flagged as ATS-unsafe (every element is a text box). |

Takeaways: the biggest complaint in the category is "built it free, then had to pay or got a surprise renewal." Several builders already give free downloads (FlowCV, Teal, Reactive Resume), so a free download is the minimum. Dossier wins with free download **plus** published test results, a real-time typeset preview, and the portfolio step. Prices above come from third-party sources; check each pricing page and date it before quoting any of them publicly.

### 3.3 Regional resume norms (drive the country presets)

| Region | Name | Length | Photo | Personal data | Paper |
|---|---|---|---|---|---|
| US / Canada | Resume | 1 page early career, 2 max | No | City/state only, no DOB | Letter |
| UK | CV | 2 pages | No | No DOB or photo | A4 |
| EU / Europass | CV | 2-3 | Optional | Nationality/DOB optional, CEFR language grid | A4 |
| Germany | Lebenslauf | 1-2 | Optional, still common | DOB optional, often signed and dated | A4 |
| France | CV | 1 page | Optional | Languages, driving licence common | A4 |
| Gulf / UAE | CV | 2-3 | Expected | Nationality, visa status, DOB, marital status | A4 |
| India | Resume / CV | 1-2 | Optional | DOB, languages, optional declaration | A4 |
| Australia | Resume | 2-3 | No | Referees section | A4 |
| Singapore | Resume | 1-2 | Optional, declining | Nationality / PR status | A4 |
| Japan | Rirekisho + shokumu keirekisho | Fixed form | Required 3x4 cm | Many fixed fields | A4 |

Japan needs a fixed form grid and CJK fonts, so it waits until after English-only v1. Validate every preset against an official career-service source before launch, and link that source on the country page.

### 3.4 ATS facts that shape the templates

- Most ATSs store the original PDF for humans. Parsing matters for form auto-fill and keyword search.
- Things that break parsing: text emitted out of reading order (sidebars), tables used for alignment, text boxes, contact details in headers or footers, fonts without a ToUnicode map, icon fonts, unmapped ligatures, images or scans, invented section headings, skill bars.
- Parser vendors are rarely disclosed. Reported pairings (unverified): iCIMS uses DaXtra, Greenhouse and Oracle use Textkernel or Sovren, Workday uses its own.
- Do not cite the "93% vs 86% parse accuracy" numbers that circulate on blogs. No source study exists.

### 3.5 Typst engine, measured on this machine

| Measure | Result |
|---|---|
| Package | `@myriaddreamin/typst.ts` 0.7.0 (Typst 0.14.2), Apache-2.0 |
| Compiler WASM size | 28.3 MB raw, **7.2 MB brotli** |
| Renderer WASM size | 0.97 MB raw, 0.27 MB brotli |
| WASM compile + instantiate | about 43 ms |
| 2-page PDF, first / warm | 116 ms / **about 26 ms** |
| Incremental vector compile per edit | **1-2.5 ms**, about 1 KB delta |
| Text layer | Clean, correct reading order, ToUnicode present, fonts subset |
| Tagged PDF | Default since Typst 0.14 (StructTreeRoot, Lang). PDF/UA-1 opt-in. |
| Links | Real URI annotations |
| Sandbox | No shell, no network, file reads locked to project root, loop and recursion limits |
| Remaining risk | Large loops still run (30M iterations took 4.2 s) |

Keystroke-speed preview is easy. The real cost is the 7.2 MB first download, so it must be cached and loaded only on builder routes.

---

## 4. Architecture

### 4.1 Overview

```
Browser (builder routes only)
  Editor UI (React, zustand store)
    | resume JSON (zod-validated)
    v
  Typst Worker (dedicated Web Worker)
    - TypstCompiler from /typst/<hash>.wasm (cached, immutable)
    - templates (vendored .typ), shared lib, self-hosted fonts (lazy)
    - incr_compile(data) -> vector delta  ----> Renderer WASM -> <canvas> preview
    - query(<dossier-block>) -> block positions -> click-to-edit overlay
    - pdf() on download
    - watchdog: terminate + respawn if a compile runs over 3 s
  Local draft store (IndexedDB, autosave)

Server (Next 16 route handlers, Netlify)
  /api/resumes            CRUD, plan limits, zod, RLS
  /api/resumes/import     PDF -> ResumeDocument (reuses parse pipeline)
  /api/resumes/tailor     LLM task "tailor", quota kind "tailor"
  /api/resumes/assist     LLM task "assist" (scoped AI chat commands)
  /api/resumes/to-portfolio  ResumeDocument -> PortfolioDocument
  Build/CI scripts: thumbnails, OG images, verification harness (typst.ts node compiler)
```

### 4.2 Why compile in the browser, and what that means for the sign-in gate

The PDF is produced on the user's device. There is no server cost per download, no cold start, and the PDF matches the preview byte for byte.

The sign-in step at download is an account-capture step, not a paywall. A technical user could bypass it by reading the canvas, and that is acceptable because the download is free anyway. Anything that must be enforced (resume count, AI quotas, cloud save) is enforced on the server.

A server compile path (typst.ts node compiler, 52 MB binary, inside Netlify's function limit) exists only for build-time thumbnails, OG images and the verification harness. It can later produce an "official" PDF if browser font differences ever matter.

### 4.3 Data model

New table, `resumes`, owner-only RLS, same pattern as existing tables:

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | references users |
| title | text | "Product Manager, Acme" |
| template_id | text | `r001-ledger` |
| template_version | int | so a template update never silently changes an old resume |
| preset | text | `us`, `uk`, `eu`, `de`, `fr`, `gulf`, `in`, `au`, `sg` |
| data | jsonb | `ResumeDocument`, zod-validated, max 256 KB |
| design | jsonb | density, accent preset, paper size, section order, hidden sections |
| custom_source | text null | set only after the user edits code. Max 64 KB. |
| parent_id | uuid null | set on tailored copies |
| job_post | jsonb null | title, company, extracted keywords, source text capped at 8,000 chars |
| created_at, updated_at | timestamptz | |

Server rules:
- Count per plan is checked in `/api/resumes` before insert (Free 2, paid unlimited). Tailored copies count toward the limit on Free.
- Users cannot write `user_id` or bypass the count, the same as the existing `users.plan` protection.
- Photos go to a private Supabase Storage bucket, max 2 MB, re-encoded server-side to JPEG, EXIF stripped.

Anonymous drafts live in IndexedDB (`dossier-resume:v1`). After sign-in, the draft uploads once and the local copy is cleared. This reuses the pattern of `pendingUpload.ts`.

### 4.4 `ResumeDocument` v1 (one contract for every template)

A superset of the existing `StructuredResume`, close to JSON Resume so import/export stays easy:

- `basics`: name, headline, email, phone, location (city, region, country), links (label + url), summary
- `personal` (shown only when the preset allows): photo, dateOfBirth, nationality, visaStatus, maritalStatus, drivingLicence
- `sections`: an ordered list. Each has an id, a type and items. Types: `experience`, `education`, `projects`, `skills` (grouped), `certifications`, `awards`, `publications`, `languages` (with CEFR level), `volunteering`, `references`, `custom`.
- Every item and bullet has a stable id. Tailoring, click-to-edit and AI diffs all address these ids.
- Dates stored as `{year, month?}` plus `present: true`. Each preset formats them.
- Every string has a length cap in zod. URLs allow only `https:`, `mailto:` and `tel:`, because Typst's `link()` writes them into the PDF.

`StructuredResume -> ResumeDocument` and `ResumeDocument -> PortfolioDocument` mappers live in `src/lib/resume/mappers.ts`. The second one powers "turn into portfolio".

### 4.5 Template contract

Each template is a folder:

```
src/resume/templates/r001-ledger/
  template.typ       reads json(bytes(sys.inputs.data)); imports ../lib/dossier.typ
  meta.ts            id, name, specimen no., columns, presets, stages, styles,
                     densities, fonts, photo support, best-for line, version
  samples/*.json     fictional sample people per role/stage (labelled "Sample")
  LICENSE-NOTES.md   only if any code was adapted from a permissive package
```

Rules every template follows, checked in CI:
- Data comes only from `sys.inputs`. Never build Typst source by joining strings with user data.
- No `eval`. No `@preview` imports at runtime. Any package is vendored and allowlisted.
- `set document(title, author, date: none)` for reproducible output. `set text(ligatures: false)` for weak parsers.
- Main column comes first in source order. Use `grid`/`columns`, never absolutely placed text.
- Contact details in the body, never in a page header or footer. Plain-text labels next to any icon.
- Standard headings only (Experience, Education, Skills), with preset-specific wording ("CV" vs "Resume").
- Three densities (Comfortable, Standard, Compact). "Fit to 1 page" steps down density before it touches margins.
- Each rendered block is wrapped in a labelled `metadata` element carrying its item id, so `query()` returns its page and position for click-to-edit.

Shared library `src/resume/templates/lib/dossier.typ`: section heading, entry row with right-aligned dates, bullet list, date formatting per preset, labels per preset, accent presets, density tokens, photo slot.

### 4.6 The 12 base templates

Specimen numbers follow the brand's type-specimen metaphor.

| No. | Name | Layout | Best for |
|---|---|---|---|
| R-001 | Ledger | One column, classic sans, maximum ATS safety | Anyone. Default. |
| R-002 | Plain | Dense one page, right-aligned dates, small caps name | Engineers, students (Jake's Resume pattern) |
| R-003 | Column | Two columns, main first in source, sidebar for skills | People with long skill lists |
| R-004 | Scholar | Serif, multi-page, publications, talks, grants, referees | Academic CV, research, medicine |
| R-005 | Compact | Tight one page, many roles | Senior people with long histories |
| R-006 | Modern | Sans, one accent rule, generous headings | Product, marketing, business |
| R-007 | Executive | Two pages, summary and achievements first | Directors, VPs |
| R-008 | Fresher | Education and projects first | Students, freshers, interns |
| R-009 | Switcher | Hybrid, skills summary before history | Career changers, returners after a gap |
| R-010 | Europa | A4, optional photo, CEFR language grid | EU, Germany, France |
| R-011 | Gulf | A4, photo and personal details block | UAE, Saudi, Qatar |
| R-012 | Specimen | Bricolage name line, still single text flow | Designers, creative roles |

Fonts (static TTF, self-hosted, OFL): Inter, Source Serif 4, IBM Plex Sans and Serif, Lora, plus Bricolage Grotesque for the name line on R-012 only. About 1.5 MB total, loaded lazily per template. Check each font's licence for PDF embedding before shipping.

### 4.7 Code mode

- CodeMirror 6 with Typst highlighting, desktop and tablet only. Phones get a read-only view and a note that code editing needs a wider screen.
- The first code edit "ejects" the resume: it copies the template source into `custom_source` and marks the resume "Custom code". Form edits still update the JSON the code reads. "Revert to template" restores the managed template. Content is never lost.
- Compile errors show inline with the line number. The last good render stays on screen.
- Safety: compile runs in the worker with a 3 s watchdog, source capped at 64 KB, images capped, no package imports outside the allowlist. Custom code is never compiled on the server in v1.
- Custom-code resumes do not show the "ATS tested" badge, because their layout is no longer the tested one. The live ATS score still works because it reads the real PDF.

### 4.8 Click-to-edit on the preview

1. After each compile, the worker runs `query(<dossier-block>)` and returns `{id, page, x, y, w, h}` for each block.
2. The preview draws invisible hit boxes over the canvas at those positions.
3. Desktop: hover outlines a block, click opens a popover editor for that item, double-click edits text in place. Phone: tap jumps to and focuses the matching form field.
4. Keyboard: Tab moves through blocks, Enter opens the matching field.

The form and the preview share one data model, so the form is always the source of truth.

### 4.9 ATS score that reads the real output

1. Compile the PDF in the worker.
2. Extract its text with pdf.js in the browser (the same library `pdf-parse` uses).
3. Run the existing deterministic `runAtsScan(text, jobPost?)` from `src/features/tools/atsScan.ts`. It needs no AI, so it is free and unlimited.
4. Add PDF-level checks: every field from the JSON found in the extracted text in order, no private-use or replacement glyphs, contact details found in the first lines, page count, links present.

Each failing check has a "Fix" action that scrolls to the field. Scoring the PDF the user will actually send, rather than the form data, is the claim competitors can't easily match.

### 4.10 AI features

Both use the existing `runLLMTask` router (`src/lib/llm/router.ts`), with new tasks `tailor` and `assist`, and new quota kinds in `usage_events`.

**Job-post tailoring**
1. User pastes a job post (text only in v1, capped at 8,000 chars). URL fetching is left out of v1 to avoid server-side request forgery and scraping problems.
2. Deterministic keyword extraction from `atsScan.ts` shows matched and missing keywords before any AI call.
3. The LLM receives the resume and the job post, and must return a zod-validated list of `{bulletId, suggestion, reason, keywordsUsed}`, plus summary and section-order suggestions. Max output tokens set per task.
4. Post-checks on every suggestion:
   - Any number, employer, title or date that does not exist in the original resume is replaced with `[add your figure]` or the suggestion is dropped.
   - Suggestions may only target existing ids.
5. The user sees one diff per bullet with Accept or Reject. There is no "rewrite everything" button.
6. Accepting creates a tailored copy (`parent_id` set). The original never changes.

**AI assistant panel**
Scoped command chips ("Shorten to 1 page", "Stronger verbs in Experience", "Fix tense", "UK spelling"), plus free text. Every change arrives as the same reviewable diff with undo. The panel states that it edits your words and never invents employers, dates or metrics.

**Prompt injection.** Job posts are untrusted text. The model has no tools, its output must match a strict schema that only edits existing ids, and the user approves every change. A malicious job post can at most produce a bad suggestion that the user rejects.

**Free-tier models.** Quality and rate limits vary. Keep the deterministic keyword step first so the panel is useful even when every model is busy, and show "AI is busy, try again in a minute" without losing input.

### 4.11 Import from an existing resume

Reuse the current pipeline (`parsePdfFromBuffer`, `resumeBrief`, regex fallback `readResume`) and map to `ResumeDocument`. Today anonymous parse is set to 0 in `ANONYMOUS_LIMITS`, while `PRODUCT.md` says anonymous visitors get a per-IP cap. Decide one (section 12). Recommended: 2 imports a day per salted IP hash for anonymous visitors, using the regex reader first and the LLM only when it fails.

### 4.12 Verification system ("ATS tested")

**Automated, on every change to a template or the shared lib (CI):**
1. Fixtures: 20+ fictional people covering each stage, long and short histories, Unicode names, very long titles, empty optional sections, many links.
2. Render each template x fixture x density x paper size with the typst.ts node compiler.
3. Extract text with two independent tools: pdf.js and `pdftotext` (poppler).
4. Field-level diff against the fixture JSON: every field present, in reading order, no merged words, no private-use glyphs, headings detected, links present, page count as expected, no overflow off the page.
5. veraPDF validates PDF/UA-1 conformance on the export setting.
6. Visual regression: PNG render plus `pixelmatch` against approved snapshots, so a change never breaks layout unnoticed.
7. Output: `content/resume-templates/verification/<template>.json` with template version, date, checks and results. The website reads this file, so the badge cannot claim more than the test showed.

**Manual, per template release (logged by hand into the same file):**
- Textkernel free tier (best proxy for Greenhouse and Oracle) and Affinda trial: upload each template's sample, record field accuracy.
- Workday: there is no public sandbox. Use the auto-fill step of public application forms with the owner's own consenting test, stop before submitting, and never send fake applications to employers.
- Greenhouse and Lever partner sandboxes later, if partner terms allow.
- OpenResume's parser (AGPL-3.0) may be used as a local dev tool only. Never ship it.

**Badge copy:** "Tested Oct 2026: parsed 12/12 fields (pdf.js, poppler, Textkernel)". Never "100% ATS pass" or "beats every ATS". A public `/resume-templates/testing` page explains the method and lists all results.

---

## 5. Security

| Area | Control |
|---|---|
| Typst injection | Data only through `sys.inputs` JSON. No string concatenation, no `eval` in templates (CI grep fails the build). |
| Compile DoS (browser) | Dedicated worker, debounce, 3 s watchdog terminates and respawns the worker, source cap 64 KB. |
| Compile DoS (server) | Server only compiles vendored templates with fixture or validated data, per-request timeout, `worker_threads` memory limits. No user code on the server in v1. |
| Network from Typst | Default font CDN disabled (`disableDefaultFontAssets`), packages vendored, memory access model on the server. |
| Preview XSS | Canvas renderer, never `innerHTML` of SVG. If SVG is ever used, load it as an `<img>` from a blob URL. |
| Links in PDF | zod allows only `https:`, `mailto:`, `tel:`. Normalize with the existing `src/lib/portfolio/links.ts`. |
| CSP | Add `'wasm-unsafe-eval'`, `worker-src 'self' blob:`. Keep wasm and fonts same-origin so `connect-src` doesn't widen. Plan the move from Report-Only to enforced CSP on builder routes. |
| Data access | `resumes` RLS owner-only. Server checks plan limits. Users can't write `user_id` or plan fields. |
| Uploads | Existing MIME and size limits. Photos re-encoded, EXIF (including GPS) stripped, private bucket, signed URLs. |
| AI | Job post treated as data, strict output schema, id-only edits, user approves every change, fact checker on numbers and names, quotas per user and IP hash. |
| Job post URLs | Not fetched in v1 (avoids server-side request forgery). |
| Personal data | Region fields (DOB, nationality, photo, visa) are off by default and only appear for presets that need them, with a short note on why. Account deletion removes resumes and photos. JSON export of all resume data. |
| Abuse | Rate limit `/api/resumes` writes, payload caps (256 KB data, 64 KB code), the existing `usage_events` ledger, fail closed in production. |
| Supply chain | Pin typst.ts 0.7.0 and the wasm hash. Upgrade to 0.8 (Typst 0.15) only after the verification suite passes. |

Run the `security-review` skill on each phase's diff before merge.

---

## 6. Design

Brand stays: paper `#f7f5f0`, ink `#101114`, violet `#6d5cf6` under 5% of any screen, Bricolage Grotesque for display, Inter for body, Geist Mono for data, ruled 12-column grid, 4px control corners and 2px plate corners. Use the real `--site-*` tokens in `src/styles/site.css` (DESIGN.md mentions `--mk-*`, which don't exist; fix DESIGN.md).

### 6.1 Pages

| Route | Purpose | Mode |
|---|---|---|
| `/resume` | Builder landing | Persuade |
| `/resume-templates` | Directory with filters | Persuade / browse |
| `/resume-templates/[template]` | Template detail | Persuade / read |
| `/resume-templates/testing` | Test method and results | Read |
| `/resume-examples/[role]`, `/[role]/[stage]` | Role sample pages (SEO) | Read |
| `/cv-templates/[country]` | Country format pages (SEO) | Read |
| `/resume/new?template=` | Starts an anonymous draft | Operate |
| `/resume/edit/[id]` (signed in) and `/resume/draft` (anonymous) | Editor | Operate |
| `/dashboard` | Resumes listed beside portfolios | Operate |

### 6.2 Landing `/resume`

- Desktop: running head "No. 002 · Resume" over the ink rule. Left 7 columns show a live specimen plate: one labelled sample resume that re-sets through 3 templates (paused under reduced motion). Right 5 columns hold the H1, lead, upload slot and "Pick a template".
- Sections: a ruled 4-up template strip, the real editor at reduced scale as a proof plate (no fake browser frame), a mono table of what a parser extracted from the sample resume, the resume-to-website bridge, pricing strip with the download promise, FAQ, closing upload slot.
- Phone: plate first, then the upload slot, then a floating CTA after the hero.

### 6.3 Directory `/resume-templates`

- Desktop: sticky left filter rail (3 columns) with four groups (Role, Country format, Stage, Style), each chip with a mono count. Results in a 9-column ruled grid, 3-up, 4-up from 1440 px.
- Tablet: chip row under the running head plus a "Filters (n)" sheet.
- Phone: sticky 56 px bar with "Filters (n)" and sort. Filters in a bottom sheet capped at 85vh with sticky "Show 32 templates" and "Clear" in the thumb zone. Grid 2-up at 375 px.
- Filter state lives in the URL query so views can be shared. Filtered query views are `noindex`; the indexable pages are the path routes in section 8.
- Card: white plate with a real Typst render at true page ratio, name, mono data line (`R-004 · A4 · 1 col · Inter 10/13`), test stamp in `ok` green with a popover explaining the test.
- Empty result: one plain line ("No templates match Gulf + Academic"), a "Remove Academic" chip, then the closest matches.

### 6.4 Template detail

Desktop 7/5. Left: large paged preview of the real render, A4/Letter toggle, sample content switch per role (labelled "Sample"), density switch. Right, sticky: name, who it suits, "Use this template", "Import my resume into this", mono spec table, test results table with date. Phone: preview with page dots, then a sticky bottom bar with "Use this template", specs in disclosures.

### 6.5 Editor

- **Desktop, 1280 px and up:** 56 px top bar (inline-editable name, save state, paper size, Download PDF, Share). Left pane about 40% with tabs Content · Design · Code. Right: preview canvas on paper-deep, page as a white sheet, zoom fit/100%/125%. A collapsible 360 px rail for ATS · Tailor · AI, one panel open at a time.
- **Tablet, 768-1279 px:** editor and preview 50/50 with a draggable, keyboard-operable divider. Panels open as a drawer over the preview.
- **Phone, under 768 px:** bottom tab bar Edit · Preview · Check · AI, 56 px, inside the safe area. Edit is a stack of collapsible section cards. A 72 px preview thumbnail floats above the tab bar and opens Preview. AI opens as a bottom sheet with the input pinned. Tabs instead of a split, because a 375 px split makes both halves unreadable.
- **Section reordering:** drag with `@dnd-kit` (already installed), plus up/down buttons for keyboard and touch.

### 6.6 States

| State | Behaviour |
|---|---|
| First load | Sheet-sized skeleton. "Loading the typesetter (7 MB, once)" on the first visit only, with progress. |
| Compile slow (over 400 ms) | Keep the last render, show a 2 px violet progress rule. Never blank the page. |
| Compile error | "Typst error on line 42: unclosed bracket. Your last good version is still showing." |
| Autosave | Mono text: "Saved", "Saving…", "Offline · saved on this device", "Couldn't save · Retry". Debounce 800 ms. |
| Overflow | "1 page · 94% full", "Spills to page 2", one-tap "Fit to 1 page". |
| Import failure | "We couldn't read text from this PDF. It may be a scan. Start from a template or paste the text." |
| AI busy | "AI is busy. Your job post is kept; try again in a minute." |
| Empty | Labelled sample content in ink-3 with "Replace with my details" and "Import resume". |

### 6.7 Performance budgets

| Metric | Target |
|---|---|
| Keystroke to text visible in preview | under 150 ms |
| Recompile p95 (worker) | under 400 ms (measured warm: about 26 ms PDF, 1-2.5 ms incremental) |
| PDF download | under 2 s |
| First editor load, cold, 4G | under 4 s to usable form; typesetter streams in behind it |
| Repeat visit | WASM from cache, no re-download |
| Marketing and SEO pages | LCP under 2.5 s, no WASM, thumbnails as WebP under 120 KB |

### 6.8 Motion and accessibility

- One authored moment per surface: the specimen re-set on the landing, Paper Lift on directory hover (180 ms), preview crossfade (120 ms), panels slide 240 ms with `cubic-bezier(0.22,1,0.36,1)`. GSAP inside `matchMedia`, transform/opacity/clip-path only. Under reduced motion everything shows its final state.
- WCAG AA, 44 px minimum targets, ARIA tablist for tabs, focus-trapped sheets that return focus, autosave announced in a polite live region, pass/fail always with an icon and a word, never colour alone. The preview is `aria-hidden`; the form is the accessible editing path. Exported PDFs are tagged, with PDF/UA-1 on.

### 6.9 Resume print design system (inside the plate)

- Page: A4 and US Letter, set by preset, switchable. Margins: Comfortable 20 mm, Standard 16 mm, Compact 12 mm.
- Type in pt: name 20-24, section heading 11-12 (600), role/company 10.5-11 (600), body 10-10.5 with leading 1.3-1.4, dates 9-9.5, never below 8.5.
- Colour: ink text on white. One optional accent on rules and the name, 6 presets including the site violet, all 4.5:1 or better on white. No filled sidebars, skill bars, icon-only labels.

### 6.10 Anti-slop rules for this feature

No invented stats, hire rates, "recruiter-approved" claims, logos or testimonials. No "AI-powered" hero, sparkle icons, purple gradients or glowing chat bubbles. No fake device frames, stock photos, 3-icon feature rows or template carousels. Every sample person is labelled "Sample". Copy says what happens.

### 6.11 References that informed the design

- Heptabase: real app at reduced scale as proof on the landing (without its rounded frame and gradient).
- Captions: working upload slot as the hero centrepiece.
- Gwern: dense, ruled, text-first tables for specs and the ATS checklist.
- Marni: no-results page that turns straight into nearest matches.
- The editor layout comes from first principles and the phone-first product principle; inspo had no strong split-editor reference.

---

## 7. Positioning and copy

**Category:** resume builder. **Wedge:** the finished PDF downloads free, the templates come with published test results, and the resume can become a portfolio site.

Recommended hero (A) with trust line (B):

- H1: **Build your resume and download the PDF free**
- Sub: Pick a template we've tested against real ATS parsers. The preview updates as you type, and the PDF matches it exactly.
- CTA: **Pick a template** · secondary **Import my old resume**
- Microcopy: Start without an account. Sign in when you download.

Name specific ATS systems in the hero only after they have been tested and logged.

Honest limits to state on comparison pages: English only, one developer, no human reviewers, fewer templates than Canva or Zety.

Full landing, directory and detail copy drafts are in the marketing report and should go through `copywriting` and `copy-editing` again once the pages exist.

---

## 8. SEO architecture

The repo already has `/resume-keywords/[role]` (16 roles). New role pages must link to it and target a different search intent: examples are about layout and bullets, keywords pages are about terms.

| Pattern | Phase 1 count | Content |
|---|---|---|
| `/resume-templates` | 1 | Hub |
| `/resume-templates/[template]` | 12 | Detail page |
| `/resume-templates/[style]` (modern, simple, two-column, one-page, ats, academic) | 6 | Style hub |
| `/resume-templates/[stage]` (student, entry-level, senior, career-change, executive) | 5 | Stage hub |
| `/resume-examples/[role]` | 25 | Sample resume + role guidance |
| `/cv-templates/[country]` (uk, ireland, germany, india, australia, canada, uae) | 7 | Country norms with official sources |
| `/resume-templates/testing` | 1 | Method and results |
| Total | about 57 | |

Phase 2 adds role x stage pages (about 150 total) only after Phase 1 is over 70% indexed in Search Console. Ceiling about 400 until there is ranking evidence.

Every page must carry, or be `noindex`ed: a sample resume written for that page (labelled fictional), 150-300 words of guidance specific to it, the template's real test results, links to the role's keyword page and one guide, and 3-5 FAQs that only make sense there. If two pages would carry the same advice, merge them.

Implementation follows the existing pattern: typed data arrays in `src/content/`, `dynamicParams = false`, `generateStaticParams`, `buildPageMetadata()`, JSON-LD. Schema: `BreadcrumbList` everywhere, `CreativeWork` with `isAccessibleForFree` on templates, `FAQPage`, `SoftwareApplication` with `Offer` on `/resume`. No `AggregateRating` until real reviews exist. Add entries to `src/app/sitemap.ts` and `ROUTES`, and run the existing IndexNow script on deploy. Put each page's answer in its first paragraph for AI search, and add the builder to `llms.txt`.

**Comparison pages** (each competitor's facts in one dated file, `content/competitors/*.yml`, re-checked quarterly): `/alternatives/zety`, `/alternatives/resume-io`, `/vs/novoresume`, `/vs/kickresume`, `/alternatives/overleaf-resume`, `/vs/rezi`, `/vs/teal`, `/vs/reactive-resume`, `/vs/flowcv`, `/vs/canva-resume`, `/alternatives/free-resume-builders`. Quote competitor terms only "as listed on their pricing page, checked [date]". Each page says who the competitor is better for. Never "scam" or guessed motives.

---

## 9. Pricing recommendation

The free PDF download is the wedge, so it stays free. Charge for what scales with a job hunt: tailored versions and more resumes.

| | Free | Starter (one-time) | Pro (yearly) |
|---|---|---|---|
| Resumes | 2 | Unlimited | Unlimited |
| PDF download | Free, no watermark, every template | Same | Same |
| ATS score | Unlimited (deterministic, costs nothing) | Unlimited | Unlimited |
| AI tailoring | 3 tailored versions | 25 | Unlimited, fair-use cap stated in numbers |
| AI assistant commands | 10 a day | 50 a day | 150 a day |
| Code mode | Yes | Yes | Yes |
| Portfolio | Current Free terms | Current Starter terms | Current Pro terms |

- Starter and Pro each cover both resume and portfolio, so "turn into portfolio" never asks for a second payment.
- The upgrade prompt appears only when a request goes past the plan (4th tailoring, 3rd resume), through the existing `UpgradeSheet` with new triggers `resume_limit` and `tailor_limit`. Never before the first download.
- Starter is $9 today; `docs/MONETIZATION_AND_LAUNCH.md` proposes $19. This plan does not change prices. Decide once checkout exists (section 12).

**Download promise** (on `/pricing` and every template page):
1. The free download is the full PDF, with no watermark and no blurred preview.
2. Nothing renews unless you chose a yearly plan, and the renewal date is shown at checkout.
3. No trials that turn into subscriptions.
4. Cancel in two clicks from the dashboard.
5. 7-day refund.
6. Export your resume data and delete your account any time.
7. Prices are shown before you start.

---

## 10. Funnel, analytics and experiments

Events (snake_case, existing analytics module):
- Landing: `resume_landing_view`, `template_cta_click`
- Pick: `template_view`, `template_selected`
- Edit: `editor_start` (blank, import, example), `section_completed`, `ats_score_viewed`, `tailor_started`, `tailor_applied`, `code_mode_opened`
- Download: `download_click`, `signin_prompt_shown`, `signin_completed`, `pdf_downloaded`
- Upsell: `portfolio_cta_shown`, `portfolio_created`, `upgrade_prompt_shown`, `checkout_started`, `paid`
- Performance: `typst_ready_ms`, `compile_ms_p95`, `compile_timeout`

Activation metric: editor start to PDF downloaded. Watch sign-in completion at download closely. Set targets after two weeks of baseline data.

Friction rules: drafts autosave locally so sign-in never loses work; Google and email magic link; the PDF downloads automatically after sign-in with no second click.

Experiments in order: hero A vs B; "Pick a template" vs "Import my resume" as primary CTA; PDF preview beside the sign-in prompt vs sign-in alone; portfolio CTA right after download vs next day; tailoring quota copy shown from the start vs only at the limit.

---

## 11. Images

- **Template thumbnails** come from real Typst renders only, never AI-generated. A build script renders page 1 of each template with its sample data to 600x848 and 1200x1697 WebP (quality 80, under 120 KB), cached by template file hash. Alt text: "[Name] resume template, sample for a fictional [role]".
- **OG images** 1200x630 via `next/og` (check the Next 16 docs in `node_modules/next/dist/docs/` first): paper background, tilted thumbnail, H1, a green "Tested" chip. One per template, role, country and comparison page.
- **Hero motion:** a real screen capture of typing into the editor with the preview updating, then the portfolio step. WebM/MP4 under 1.5 MB, poster frame, still image under reduced motion, 9:16 phone cut.
- **Launch assets:** Product Hunt gallery 1270x760 and social 1200x675, real screenshots with light annotation.

---

## 12. Open decisions

1. Starter price: keep $9 or move to $19 with a founder price. Decide when checkout ships.
2. Anonymous import: allow 2 a day per IP hash (recommended) or require sign-in. `ANONYMOUS_LIMITS.parse` is 0 today, which contradicts `PRODUCT.md`.
3. Which external parsers back the badge long-term (Textkernel and Affinda trials expire; paid Textkernel is about $99/mo).
4. Font licences for PDF embedding: confirm OFL for each.
5. Whether a resume should keep syncing with a portfolio created from it (v1: one-time copy).
6. Typst 0.15 upgrade timing (variable fonts, combined PDF standards).

---

## 13. Phases

Each phase ends with the verification suite green, `security-review` on the diff, a phone test on a real device, and a no-ai-slop pass on new copy.

**Phase 0: Foundations**
- `ResumeDocument` zod schema and mappers from `StructuredResume` and to `PortfolioDocument`.
- Typst worker spike: self-hosted wasm, fonts, watchdog, incremental canvas preview, PDF export. Confirm the latency numbers in Safari, Chrome and Firefox on a mid-range phone.
- Shared `dossier.typ` library and the first two templates (R-001 Ledger, R-002 Plain).
- Verification harness in CI (pdf.js, poppler, field diff, pixelmatch, veraPDF).
- CSP additions. `resumes` migration with RLS.

**Phase 1: Usable builder**
- Editor: form + live preview, section reorder, density and paper switch, autosave to IndexedDB, all three breakpoints.
- Sign in at download, draft upload after sign-in, dashboard list, Free 2-resume limit.
- ATS score panel on the real PDF output.
- Import from existing resume.
- Templates R-003, R-005, R-006, R-008 (6 total).
- "Turn into portfolio".

**Phase 2: Library and SEO**
- Remaining 6 templates (12 total) and country presets.
- Directory, detail pages, testing page, style, stage, role and country pages (about 57).
- Thumbnails and OG pipeline. Sitemap, schema, IndexNow.
- Landing page `/resume`.
- First manual ATS round (Textkernel, Affinda, Workday auto-fill) logged into the verification files.

**Phase 3: AI**
- Tailoring with diffs, tailored copies, fact checker, quotas.
- Assistant panel with scoped commands.
- Upgrade triggers `resume_limit` and `tailor_limit`.

**Phase 4: Power features**
- Click-to-edit on the preview.
- Code mode with eject and revert.
- Photo upload for presets that use one.

**Phase 5: Launch**
- Comparison pages with dated competitor facts.
- Download promise on pricing and template pages.
- Launch gate: all 12 templates pass the suite, at least 3 manual ATS results logged, download and sign-in work on a phone, refund and privacy pages live.
- Launch order: 20 people you know, then waitlist and LinkedIn alpha, then founder pricing, then Product Hunt (Tue-Thu) and Show HN (engineering story). Reddit only within each sub's rules, never seeded posts. Directories: BetaList, AlternativeTo, SaaSHub, Indie Hackers, Uneed, university career pages.

**Later**
DOCX export, plain-text and JSON Resume export, cover letters in matching styles, more languages (Latin-script EU first), RTL for the Gulf, CJK and the Japanese rirekisho form, community template submissions with review and verification, role x stage page expansion.

---

## 14. Where it lives in the codebase

| New | Path |
|---|---|
| Schema, mappers | `src/lib/resume/schema.ts`, `src/lib/resume/mappers.ts` |
| Typst worker and client | `src/features/resume/engine/typst.worker.ts`, `engine/client.ts` |
| Templates | `src/resume/templates/<id>/`, `src/resume/templates/lib/dossier.typ` |
| Editor UI | `src/features/resume/editor/` |
| Store | `src/store/useResumeStore.ts` |
| API | `src/app/api/resumes/**` |
| Pages | `src/app/(marketing)/resume`, `resume-templates`, `resume-examples`, `cv-templates`, `src/app/resume/` (editor) |
| Content | `src/content/resume/roles.ts`, `countries.ts`, `styles.ts`; `content/resume-templates/verification/*.json`; `content/competitors/*.yml` |
| Scripts | `scripts/resume/verify.mjs`, `scripts/resume/thumbnails.mjs` |
| Static | `public/typst/<hash>.wasm`, `public/fonts/resume/*` |
| Migration | `supabase/migrations/<date>_resumes.sql` |

| Reused | Path |
|---|---|
| ATS scoring | `src/features/tools/atsScan.ts` |
| PDF parse pipeline | `src/lib/pdf/*`, `src/lib/ai/resumeBrief.ts`, `src/services/api/pdf-portfolio.pipeline.ts` |
| LLM router | `src/lib/llm/router.ts`, `registry.ts` |
| Quotas and plans | `src/lib/api/guard.ts`, `src/lib/billing/plans.ts` |
| Upgrade sheet | `src/features/billing/useUpgrade.ts`, `UpgradeSheet.tsx` |
| SEO helpers | `src/config/seo.ts`, `src/app/sitemap.ts`, `scripts/indexnow.mjs` |
| UI | `src/components/ui/*`, `src/components/marketing/PageHead`, `UploadSlot` |
| Tokens | `src/styles/site.css` (`--site-*`), `src/styles/theme.css` |

Before writing code, read the relevant guides in `node_modules/next/dist/docs/` (this Next 16 has breaking changes: middleware is `src/proxy.ts`, `params` is a Promise, Turbopack asset loading for `.wasm`, Web Worker support).
