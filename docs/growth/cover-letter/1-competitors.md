# Cover letter maker + checker: competitor research

Snapshot: 2026-11-03. Sources: competitors' public landing pages, help centres and pricing pages (WebFetch), plus third-party reviews where noted.
No logins, signups or paid flows. One public builder entry screen was opened (Zety). It stopped at a "you agree to our Terms" click, which needs owner approval.
Labels: **O** means observed on the vendor's own page. **R** means reported by third-party reviews, which often disagree, so treat R as a lead to verify. "Not observed" does not mean the feature is absent.

## 1. Profile table (8 picked)

| Tool | Entry point | Inputs asked | AI use | Gate (signup / paywall) | Free download | Templates | Checker | Pricing |
|---|---|---|---|---|---|---|---|---|
| **Zety** | `/cover-letter-builder` → `builder.zety.com/letter`, a 3-step intro screen (O) | Template, then a questionnaire: years of experience, student?, degree, field; letter "type" by industry/situation/theme (R) | Prewritten suggestions + AI writer (O) | Clicking the CTA accepts the ToS (O). Download needs the trial (R, consistent across sources) | TXT only on free (R) | ~20+ | none observed | UK trial £2.95 for 14 days → ~£/$24–26 every 4 weeks, auto-renew (O UK page; R US) |
| **Resume.io** | `/cover-letter-builder` → `/app/create-cover-letter` (O) | Template → personal info → sections → layout → download (O) | Pre-generated content; AI is pitched for resumes, not letters (O) | Account + paid plan for PDF/DOCX | **TXT only** (O help centre) | 30 (O) | spell-check only (O) | $2.95 for 7 days → ~$24.95–29.95 every 4 weeks (R) |
| **Resume Genius / LiveCareer** (same playbook) | Builder link from examples pages | Questionnaire-style builder | AI phrases | Download needs the trial (O FAQ) | **TXT only**. PDF/Word need the trial (O FAQ) | ~20 | none observed | $2.95 for 14 days → $23.95 every 4 weeks; annual $95.40 (O pricing) |
| **Novoresume** | `/cover-letter-builder` returned a 404 today. Letters live in the app | Builder fields matching the resume | Limited | Free tier says "No Cover Letter" (O pricing) | **None on free** | matches the resume templates | none observed | ~€21.99/mo, €189.99/yr (O DE/GB pricing) |
| **Kickresume** | `/ai-cover-letter-writer` (O) | **Job title (required)**, company, job ad (optional), **pick one of your Kickresume resumes** (O) | Full generation + regenerate (O) | Account; first AI letter free, more need Premium (O) | Disputed: free PDF may carry branding (R) | 40+ (O) | none for letters | from ~$8/mo; free for students (O) |
| **Teal** | `/tool/cover-letter-generator` (403 to bots). Lives inside the job tracker (O help) | **Resume in Teal + saved job description** (O help) | Full generation (O) | Account; **2 free credits**, then Teal+ (O help) | copy/export | n/a (plain) | job-match score is for resumes | Teal+ ~$13/wk, $29/mo (R) |
| **Rezi** | `/tools/cover-letter-generator`; CTA → signup ("no card required") (O) | Not shown before signup | Full generation (O) | **Signup before any output** (O) | 3 PDF downloads total on free (O) | standard set | resume score only | Pro $29/mo; Lifetime $149 (O) |
| **Enhancv** | `/cover-letter-builder/` → app (O) | "Questions about experience, skills, accomplishments" (O) | Draft "in under a minute" + spell-check (O) | Signup point not stated (O) | Claims free (O); limits on pricing page | 6 (O) | resume checker only; no letter scan (user review, R) | paid tiers on pricing page |
| *Also seen:* Grammarly | AI tools page (O) | **Resume upload (DOC/DOCX/TXT) + job title + job details** (O) | Generation + tone/length/formality controls (O) | "Additional features require signing up" (O) | copy text | none | grammar only | free signup |
| *Also seen:* Canva | `/create/cover-letters/` (O) | Design template + Magic Write prompt (O) | Magic Write (O) | Canva account | PDF + view-only link (O) | thousands (design-led, often not ATS-safe) | none | free; Pro for some AI |
| *Also seen:* Jobscan | `/cover-letter-checker` page is actually a **generator** (O) | **Resume (PDF/DOCX or saved) + pasted JD** (O) | Generate + "Rewrite" by length/tone/focus (O) | **Account required**; 7-day trial, then Premium (O) | PDF, saved to job tracker (O) | none | Letter scan adds ≤10 pts to the resume↔JD match rate; Premium only (R) | Premium (~$50/mo, R) |

**SEO landing structure (common pattern):** a tool page (`/cover-letter-builder` or `-generator`) plus three hubs linking to each other:
- **Examples by role/industry**, which is the biggest page set. Resume.io groups by Nursing/Admin/Internship/Graduate/Teacher. Kickresume shows AI samples by job.
- **Templates gallery.**
- **Guides**: how to write one, format, length, "how to address", career change, no experience.

Zety also runs country subfolders (`/uk/`). Its mega-menu puts Builder, Templates, Examples and Guides side by side. Jobscan's "checker" URL ranks for checker intent but serves a generator.

## 2. Steps from "land" to "download a letter" (best case, counting each screen or click)

| Tool | Steps to a finished letter | Steps to a usable **PDF** | Where it breaks |
|---|---|---|---|
| Kickresume | 1 land → 2 signup → 3 job title (+ resume) → 4 Generate → 5 template → 6 download = **6** | 6 (first letter only) | 2nd letter is paid |
| Grammarly | 1 land → 2 upload resume → 3 job title + details → 4 Continue = **4** to text | n/a (copy/paste) | No formatted letter. Signup for more |
| Jobscan | land → signup → upload → paste JD → generate → download = **6** | 6 (trial only) | Account + 7-day clock |
| Teal | land → signup → build/import resume → save a job → generate → export = **6+** | 6+ | 2 credits |
| Rezi | land → **signup** → … = **6–7** | counts against 3 PDFs | Signup wall first |
| Zety / Resume Genius / Resume.io | intro → template → 5–10 questions → preview → download = **~9–13** (one review counts 11 for Zety) | **∞ without paying** (TXT only) | Paywall at the download click, after all the effort |
| Novoresume | app → signup → builder → … | ∞ on free | Letter is Premium-only |

**Fastest observed:** Grammarly reaches draft text in about 4 steps by reusing the **existing resume + job description**. Kickresume reaches a designed PDF in about 6 steps by reusing an **existing resume in its own app**.
Both prove the winning pattern: **reuse the resume and don't ask again for facts you already have.** Neither gives unlimited, clean, formatted PDFs without an account.

## 3. Paywall traps to avoid (our promise: free download, no watermark)

1. **Download-click ambush** (Zety, Resume Genius, LiveCareer, Resume.io): full build, then a pay wall at "Download". TXT is offered as the "free" fig leaf. Reviews consistently name this the top complaint.
2. **Cheap trial that auto-renews** ($2.95 / 7–14 days → ~$24–30 every 4 weeks). Billing every 4 weeks yields 13 charges a year, and cancellation friction is widely reported (R).
3. **Credit meters** (Teal 2, Kickresume 1, Rezi 3 PDFs): the free tier runs out mid-job-search, just as the user starts tailoring per application.
4. **Signup before any value** (Rezi, Jobscan, Teal): no preview before the account wall.
5. **Clicking the CTA accepts the ToS** (Zety): consent bundled into "Create".
6. **Branding or watermark on free PDFs** (reported for Kickresume).
7. **Format lock**: PDF free, DOCX paid (Resume.io, Novoresume). Several employer portals ask for .docx.
8. **"Checker" that's really an upsell**: Jobscan's checker URL serves a generator behind an account and trial.

Dossier rule: preview, edit, PDF and DOCX are all free, unlimited and unbranded. Signup is only to **save or sync**, never to see or download.

## 4. Gaps no one fills (observed across all 11)

- **Letter generated from the user's existing Dossier resume, with no re-typing.** Only Kickresume and Teal do this, and only inside a paywalled or credited app. Nobody does it with free, unlimited PDFs.
- **Matching visual pair**: same typeface, header and colour as the chosen resume template. Resume.io/Zety sell "matching" letters but gate the download.
- **Country formats**: US letter vs UK/IE ("Dear Sir/Madam … Yours faithfully"), DE Anschreiben (DIN 5008, sender block, date line, subject "Betreff", signature), FR lettre de motivation, India/Gulf (photo-less, notice period), AU/NZ (selection-criteria mentions), A4 vs Letter paper. **Not observed** on any competitor beyond A4/Letter switching.
- **Honest checker**: Enhancv itself says there is no universal "ATS score", yet competitors either sell one or have none for letters. A free letter checker with explained, non-gamified feedback is open space.
- **Truthfulness guard**: no competitor flags AI claims that aren't backed by the resume (invented metrics or tools).
- **Letter ↔ portfolio site link**: unique to Dossier. The letter can cite the user's live portfolio URL.
- **Clean-slate privacy**: no tool says letters aren't used to train AI and can be deleted.

## 5. Recommended Dossier flow (≤5 steps)

Entry points: `/cover-letter-generator` (tool landing), the resume editor ("Write matching cover letter"), and post-download of a resume.

1. **Start**: pick a source. (a) a Dossier resume (signed-in or local draft), (b) upload a PDF/DOCX, or (c) "start blank". No signup.
2. **Job**: paste a job ad (URL or text) or enter title + company. One screen.
3. **Tone and format**: country/format (auto from locale), tone (formal / warm / direct), length (short ~180 words / standard ~300). Defaults pre-set, so the user can skip.
4. **Generate → edit inline**: highlighted claims link back to the resume line they came from. Regenerate a paragraph, not the whole letter. The checker panel runs live alongside.
5. **Download**: PDF + DOCX + copy-text, styled to match the resume template. Free, no watermark. *Then* an optional "save + get a portfolio link" prompt.

### Fields

| Field | Required? | Notes |
|---|---|---|
| Full name, email | **Required** (prefilled from the resume) | Phone, city, LinkedIn/portfolio optional |
| Experience source (resume or blank) | **Required** (one of) | Blank mode adds 3 short prompts: role you're targeting, top 2 achievements, why this company |
| Job title | **Required** | |
| Company name | **Required** (or "unknown" toggle) | Drives the greeting and closing lines |
| Job description text | Optional, **strongly nudged** | Enables keyword match + checker relevance score |
| Hiring manager name | Optional | Falls back to the country-appropriate greeting |
| Country / letter format | Optional (auto) | US, UK/IE, DE, FR, IN, AU/NZ, CA, EU-generic; sets paper size and conventions |
| Tone, length | Optional (defaults) | |
| "Why this company" line | Optional | The one fact AI can't invent; improves specificity |
| Notice period / availability, referral name | Optional | Region-relevant |

## 6. Checker: dimensions worth copying conceptually (own wording, own weights)

Free, no signup, paste or upload a letter (+ optional job description). Show the reason and fix for each check, not just a number. Avoid "ATS score" claims.

| Dimension | What it checks | Inspired by |
|---|---|---|
| Job match | JD keywords/skills covered vs missing (no stuffing reward) | Jobscan match-rate concept |
| Specificity | Company name used, role named, concrete "why you" sentence present | none (gap) |
| Evidence | Quantified achievements; claims traceable to the resume | none (gap) |
| Structure | Greeting → hook → 1–2 proof paragraphs → close with CTA | Jobscan formatting rules |
| Length | ~250–400 words, ≤1 page, paragraph count | Jobscan guideline |
| Clichés / AI tells | "I am writing to express…", "passionate", generic filler | Grammarly tone controls |
| Readability and tone | Sentence length, passive voice, formality vs chosen country | Grammarly |
| Correctness | Spelling, grammar, name/company consistency (wrong company is a common copy-paste error) | Resume.io/Enhancv spell-check |
| Format conventions | Country-correct greeting/sign-off pairing, date format, contact block | none (gap) |
| Resume consistency | Dates, titles, employers match the attached resume | none (gap) |

Score: show 4 bands (Needs work / OK / Strong / Ready) per dimension instead of one false-precision %. Every fix links to "Fix in editor".

## Sources (key)
zety.com/uk/pricing · resume.io/cover-letter-builder · help.resume.io (free TXT) · resumegenius.com/faq/how-much-does-resume-genius-cost · resumegenius.com/pricing · novoresume.com/gb/page/pricing · kickresume.com/en/ai-cover-letter-writer · help.tealhq.com (2 credits) · rezi.ai/tools/cover-letter-generator · enhancv.com/cover-letter-builder · grammarly.com/ai/ai-writing-tools/cover-letter-generator · canva.com/create/cover-letters · jobscan.co/cover-letter-checker · enhancv.com/blog/best-resume-checkers (no universal ATS score)
