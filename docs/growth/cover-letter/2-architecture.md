# Cover letter maker and checker: architecture plan

Produced 2026-11-03 by a read-only planning pass over the codebase. Not implemented yet.

## 1. What already exists and can be reused
- **Typesetting**: `src/features/resume/engine/*` (one Typst wasm worker; `core.ts` shared with Node). The worker compiles `/${templateId}.typ` with `sys.inputs.data` JSON. Templates live in `src/resume/typst/`; `sync-typst-assets.mjs` copies every `.typ` there into `public/typst/a/templates` and the manifest, so a new `.typ` file is picked up automatically. r013–r042 are thin calls to `kit.typ`'s `render(m, opts)`; r001–r012 are hand-written but import `lib.typ` (`page-setup`, `contact-line`).
- **Editor**: `lib/store.ts` (zustand with undo) and `lib/useAutosave.ts` are tied to `ResumeDocument` and `/api/resumes`. `PreviewStage.tsx` and `fields.tsx` (TextField, AreaField) are store-free and reusable. `DesignPanel.tsx` exports `TemplateGrid` (reusable); `DesignPanel` itself reads `useResumeEditor`.
- **Drafts**: `lib/drafts.ts`, prefix `dossier:resume:v1:`, `remoteId`/`ownerId`, `clearResumeDrafts`/`clearAccountDrafts` on sign-out.
- **Download gate**: `ResumeEditor.onDownload`: signed in downloads; signed out opens `DownloadDialog{kind:"signin", next:"...&download=1"}` and downloads automatically on return. Events: `download_click`, `signin_prompt_shown`, `pdf_downloaded`.
- **Free tools**: `catalog.ts` (FreeToolSlug union), `[slug]/page.tsx` (HOW map, ToolBody switch, `generateStaticParams`), `atsScan.ts` (rule-based; `tokens`, `stemmed`, `isSkill`, `extractJobTerms`, `hasTerm` are module-private), `useSaved`, `ResumeHandoff`/`startResume.ts`, `PolishButton`.
- **LLM chain**: `/api/tools-polish` calls `runLLMTask("polish")` via `src/lib/llm/router.ts` (groq/openrouter with fallback), with guards against new numbers, new words and changed verbs, and a per-IP/per-plan quota `consumeQuota(...,"polish")` in `src/lib/billing/plans.ts`.
- **DB**: `supabase/migrations/20261020120000_resumes.sql`: owner-only RLS, plan-limit trigger (free: 2), `touch_resume` trigger.
- **Next 16.4.3**: no middleware; `src/proxy.ts` with PUBLIC_PREFIXES (`/tools` already public). Check `node_modules/next/dist/docs/01-app` for async `params` and Suspense rules for `useSearchParams`; existing pages already follow them.

## 2. Data model: `src/lib/cover-letter/schema.ts`
zod, reusing `text(max)`, `id` and `urlSchema` exported from `src/lib/resume/schema.ts`.

```ts
coverLetterDocumentSchema = z.object({
  version: z.literal(1),
  sender: { name: text(100), headline: text(140), email: text(160), phone: text(40), location: text(120), links: z.array(linkSchema).max(3) },
  recipient: { name: text(120).default(""), title: text(120).default(""), company: text(160).default(""), address: text(300).default("") },
  job: { role: text(120).default(""), reference: text(80).default(""), source: text(120).default("") },
  date: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/).default(""),   // "" = today when typeset
  subject: text(200).default(""),                                    // optional "Re:" line (DE/EU)
  greeting: text(120).default(""),                                   // "" = auto
  paragraphs: z.array(z.object({ id, kind: z.enum(["opening","proof","fit","closing","custom"]), text: text(1500) })).max(8),
  signOff: text(60).default("Sincerely,"),
  signature: text(100).default(""),                                  // "" = sender.name
  jobPost: text(12000).default(""),                                  // drives generator + checker; never typeset
  source: z.object({ resumeDraftId: z.string().max(40).nullable(), resumeRemoteId: z.string().uuid().nullable() }),
})
coverLetterDesignSchema = resumeDesignSchema   // same object, so the letter matches the resume
LETTER_LIMITS = { dataBytes: 64*1024, titleChars: 120 }
```

**Prefill from a resume draft** (`src/lib/cover-letter/fromResume.ts`, pure and testable):
- `sender` comes from `basics`: name, headline, email, phone, location, and the first 2 links.
- `design` is copied from the resume as is (template, accent, preset, paper).
- `job.role` defaults to `basics.headline`.
- Facts for the generator:
  - the latest experience item;
  - the 2 bullets that contain a number;
  - skills, flattened;
  - the latest education item.
- `source` holds the ids that link back to the resume.

The resume is read only when the letter is created or when the user presses "Rebuild from resume". The two documents are not kept in sync.

## 3. Routes
- `src/app/(marketing)/cover-letter/page.tsx`: the SEO landing page. The main call to action goes to `/cover-letter/new`, with a secondary link to the checker. Add `ROUTES.coverLetter`, `coverLetterNew` and `coverLetterEdit`, and add both pages to `sitemap.ts`.
- `src/app/(resume)/cover-letter/new/page.tsx` renders `LetterStartScreen`.
  - Three ways to start: use my resume, start blank, or paste the job post first.
  - It accepts `?resume=<draftId>`.
  - The `(resume)` layout already sets noindex and loads resume.css.
- `src/app/(resume)/cover-letter/edit/page.tsx` renders `<Suspense><CoverLetterEditor/></Suspense>`, reading `?id` and `?download=1`.
- `/tools/cover-letter-checker` is a new FreeToolSlug served by the existing `[slug]` page. Optionally, a `cover-letter-generator` slug can hand off to the maker.
- In the proxy, `/cover-letter` is treated exactly like `/resume`.

## 4. Typesetting: same engine, a letter look matched to each template
- **One file.** Add `src/resume/typst/letter.typ`. Split kit's header into `masthead(m, o)` so `render` and a new `render-letter` share it. Run `resume:verify` before and after to prove the resumes are unchanged.
- **Look as data.** `src/lib/cover-letter/looks.ts` maps each `templateId` to kit options.
  - r013–r042 copy the options from their `render(...)` call.
  - r001–r012 get a hand-picked closest look.
  - Optionally, add a `letter?` field on `ResumeTemplate`.
- **Render model.** `src/lib/cover-letter/renderModel.ts` provides `toLetterRenderModel(doc, design)`.
  - It reuses `safeUrl`, `ACCENT_HEX`, DENSITY and `PRESETS`.
  - Preset letter conventions: US puts the date above the recipient and signs off "Sincerely,". UK signs off "Yours sincerely" when the recipient is named, "Yours faithfully" when not. DE/EU add a subject line before the greeting.
  - All text is passed as JSON strings, so nothing can be injected into Typst.
- **Engine.** Generalise `typeset()`/`usePreview()` to take `{templateId, fonts, data}`, with `templateId: "letter"`. The worker protocol doesn't change.
- **Verify.** Add `letter:verify`, which renders every template × preset × paper and checks four things:
  - text extraction order;
  - no missing glyphs;
  - fits on one page;
  - correct paper size.

## 5. Generation: rule-based first, optional AI polish
`src/features/cover-letter/letterGen.ts` is a pure function in the style of `summaryGen.ts`.
- **Opening:** the role, where the user found it, and who they are.
- **Proof:** 1–2 resume bullets that contain numbers, rewritten in first person past tense. They are ranked by overlap with `extractJobTerms(jobPost)`.
- **Fit:** the top 3–4 job post skills that also appear on the resume, plus a `[Why {company}: add one specific thing]` placeholder. The checker flags it if it is left in.
- **Closing:** availability, a call to action, and the sign-off for the preset.
- **Variants:** 2–3 (result-first, skills-first, career-change). They use only the user's own facts and never invent a number.
- **AI polish:** add `kind: "letter"` to `/api/tools-polish`. It works one paragraph at a time with the same guards and quota. `PolishButton` gets an `onAccept(text)` prop.

## 6. Checker: `src/features/tools/letterScan.ts` + `CoverLetterChecker.tsx`
**First, move shared helpers.** Move atsScan's helpers into `src/features/tools/textKit.ts` without changing behaviour, and add a snapshot test to prove it. `runLetterScan(letter, jd?, resume?)` returns the same `Issue`/`Severity`/`parts` shape as atsScan.

**Scoring weights:**
- **Keywords (30)** run only when there is a job post of at least 120 characters. They score coverage of the job post's top 10 terms, with a lower bar than for a resume.
- **Personalization (20):**
  - the company is named outside the greeting;
  - the role is named;
  - the greeting addresses a person;
  - no `[...]` placeholders are left;
  - no other company's name appears.
- **Structure (15):**
  - 3–5 paragraphs;
  - the role is named in the first 2 sentences;
  - the closing asks for something;
  - a sign-off, the name and contact details are present.
- **Length (10):** 250–400 words is ideal. Under 150 or over 500 is flagged, and so is any paragraph over about 120 words.
- **Evidence (15):** at least one number or result, at most 30% of sentences starting with "I", and action verbs.
- **Clichés and tone (10):** clichés, hedges, apologies, exclamation marks and all caps. Each issue quotes the evidence and gives the fix.
- **Optional:** flags a letter that copies the resume word for word.

**UI and handoff:**
- The UI copies the AtsChecker layout and shares `useSaved("ats_jd")`.
- The handoff to the maker goes through a sessionStorage key, never the URL.
- The editor gets a Check tab.

## 7. Storage
- Drafts follow the resume pattern with the prefix `dossier:letter:v1:`. Sign-out also clears letter drafts.
- Either refactor the store and autosave into factories (keeping `useResumeEditor`'s API unchanged) or copy both files. Copying is the lower-risk fallback.
- The API is `src/app/api/cover-letters/route.ts` plus `[id]/route.ts`, and a new `src/lib/cover-letter/server.ts`.
- Migration sketch:

```sql
create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  resume_id uuid references public.resumes (id) on delete set null,
  title text not null default '' check (char_length(title) <= 120),
  template_id text not null check (template_id ~ '^r[0-9]{3}-[a-z]+$'),
  company text not null default '' check (char_length(company) <= 160),
  data jsonb not null, design jsonb not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint cover_letters_data_size check (pg_column_size(data) <= 65536),
  constraint cover_letters_design_size check (pg_column_size(design) <= 4096));
create index cover_letters_user_updated_idx on public.cover_letters (user_id, updated_at desc);
alter table public.cover_letters enable row level security;
-- owner-only select/insert/update/delete policies (copy resumes_*_own); insert checks resume_id ownership
-- enforce_cover_letter_limit(): free 3 / paid 200, advisory lock 'cover_letters:'
-- reuse public.touch_resume(); revoke execute on the limit fn from public, anon, authenticated
```

Regenerate `src/types/database.ts` afterwards. Keep `jobPost` on the device only, to shrink rows and reduce personal data.

## 8. Download gate
- It works like the resume's download.
- Events carry `doc:"cover_letter"`. Signed out, the next path is `/cover-letter/edit?id=…&download=1`.
- File name: `{Name}-Cover-Letter.pdf`.
- `DownloadDialog` gets an `afterDownload` slot.
- **Cross-links:** a letter offers "Download the matching resume", and the resume offers "Write a matching cover letter" (`/cover-letter/new?resume=<draftId>`).

## 9. Analytics
- `letter_start {how, template}`
- `letter_generated {variant, has_job_post, from_resume}`
- `letter_variant_pick`
- `tool_polish {tool:"letter"}`
- `letter_polish_accept`
- `download_click {doc:"cover_letter", signedIn}`
- `signin_prompt_shown {from:"letter_download"}`
- `pdf_downloaded {doc:"cover_letter", template, preset}`
- `letter_check_run {has_job_description, words, source}`
- `tool_to_letter {tool}`
- `resume_to_letter_click {from}`

Also add `doc:"resume"` to the existing resume events.

## 10. Step order
1. `textKit.ts` move, with a snapshot test.
2. `src/lib/cover-letter/{schema,fromResume,renderModel,looks}.ts`, with tests.
3. `kit.typ` masthead split, `render-letter` and `letter.typ`; then `resume:verify` and `letter:verify`.
4. Generalise the engine (`usePreview.ts`).
5. Checker: `letterScan.ts`, `CoverLetterChecker.tsx`, the catalog entry, the `[slug]` cases and the sitemap. This can ship first.
6. `letterGen.ts`, with tests.
7. Store and autosave factory (or copies), plus letter drafts and the letter store.
8. Editor components: `CoverLetterEditor`, `LetterContentPanel`, `LetterStartScreen`, `LetterCheckPanel`.
9. Routes and `routes.ts`.
10. Migration, API, `server.ts`, DB types and the dashboard list.
11. `kind:"letter"` polish and the `PolishButton` `onAccept` prop.
12. Cross-links, analytics and sign-out cleanup.

## 11. Risks
- The `kit.typ` refactor could change the 30 kit resumes. Mitigation: extract only, then diff `resume:verify` output.
- The 12 hand-written templates only roughly match their letters, so label them "Matches R-00x" rather than promising an identical design.
- The store refactor touches the live resume editor. Keep the API the same, or copy the files.
- Generated text can sound like a template. Leave placeholders where facts are missing, and keep the AI behind the anti-invention guards.
- Privacy: keep letter text out of URLs, and clear letter drafts on sign-out.
- Free users get 2 resumes plus 3 letters. A 403 keeps the draft on the device.
- To limit keyword stuffing, cap the keyword part and warn when a paragraph has more than 8 skill terms.
- The 64KB jsonb limit versus `jobPost`: keep `jobPost` on the device only.
