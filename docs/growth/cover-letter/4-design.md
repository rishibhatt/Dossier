# Cover letter maker + checker: design direction

Status: study pass, no code. Mode: Operate (tool UI). DESIGN.md ("The Specimen Sheet") and the resume editor win over every reference below.
Sources read: DESIGN.md, PRODUCT.md, src/styles/resume.css (rz-*), StartScreen, ResumeEditor, ContentPanel, CheckPanel, PreviewStage, DownloadDialog, tools/AtsChecker, ToolHandoff, PolishButton. Local app seen at 375 and 1280 (/resume/new, /tools/ats-checker).

## Principle

The cover letter is a second sheet in the same dossier. Same chrome, same rz-* classes, same tabs, same dialog. The one new idea: the letter's letterhead copies the resume's template (display face, name block, accent rule), so the two PDFs read as a set. That is the "matches your resume" promise and the only place the product gets clever.

No new tokens. No new components unless listed under "New" below. Violet stays under 5% (focus, chosen, keyword hits).

## Routes

- `/cover-letter/new` start screen; `/cover-letter/edit?id=` editor; `/tools/cover-letter-checker` free checker.
- Drafts stored like resume drafts (localStorage first, account sync on sign-in), `kind: "letter"`, with optional `resumeId` link.

## (a) Start screen `/cover-letter/new`

Clone of `StartScreen`: `site-wrap rz-start`, `rz-head` running head, `rz-start-title`, `rz-ways`, `rz-section-head`, `rz-recent`.

| Width | Layout |
|---|---|
| 375 | One column. Running head, h1, lead, then the three ways stacked as ruled cells (rz-ways collapses as today). Preset select under the ways, not above (fewer fields before the first choice). |
| 768 | rz-ways at 3 columns is cramped at 768; use 1 column for "From my resume" spanning full width, the other two side by side (grid-template-areas). |
| 1280 | rz-ways 3 equal columns as on /resume/new. "On this device" letters list below. |

Ways (cell h2 + one sentence + foot action):
1. **Use my resume** (first, default when the device has resume drafts). Foot: up to 3 `rz-recent` rows of saved resumes ("Priya Shah, Engineer · Modern · 2 h ago"), then the `rz-drop` slot "Choose a PDF / or drop it here". No resumes on device: only the drop slot.
2. **Paste the job ad**. Foot: one `rz-textarea` (6 rows) + secondary button "Use this ad". We pull company, role and contact name out of the ad and show them as editable fields in the editor; nothing is asked here.
3. **Start blank**. Foot: secondary button "Start blank".

After choosing 1, an inline second step appears in the same cell (no new page): "Add the job ad (recommended)" textarea + primary "Start my letter" and quiet "Skip for now". This is the only two-field moment on the screen.

Below the ways: "Where you're applying" `rz-select` (reuses PRESETS; sets date format, salutation default, A4 vs Letter). Hint copy from PRESETS note.

Copy:
- Running head: `Dossier Cover Letter` / `New letter`
- h1: "Start your cover letter"
- Lead: "Start from your resume and the job ad, or begin blank. The letter uses your resume's design, so the two match when you send them."
- Empty "On this device": section hidden (same as resume).
- Errors (rz-error, role=alert): reuse the resume PDF messages verbatim; ad too short: "That ad is under 40 words. Paste the whole post, including the requirements, or skip it."; ad unreadable: "We couldn't find a role or company in that text. You can still start, and fill them in yourself."
- Loading: drop button label "Reading your PDF…"; "Use this ad" label "Reading the ad…", `data-loading`.

## (b) Editor `/cover-letter/edit?id=`

Identical shell to `ResumeEditor`: `rz-bar` (back, title input + SaveStatus, undo/redo hidden on phone, primary "Download PDF" / phone "Download"), `rz-shell` with `rz-pane` + `PreviewStage`, `rz-tabbar`, `rz-peek`.

| Width | Layout |
|---|---|
| 375 | Single pane, fixed `rz-tabbar` with 4 tabs: Edit (FileText), Design (Palette), Preview (Eye), Check (Gauge). `rz-peek` thumbnail bottom-right on Edit. Undo/redo hidden. |
| 768-1023 | rz-shell 1fr / 1fr (existing rule). Desktop tabs Content / Design / Check in the pane. |
| 1280+ | Same split, pane fixed width as resume, preview sheet centred on Second Stock with Paper Lift. One page only; `rz-segment` page toggle hidden. Second page warning instead (see Check). |

Content tab, top to bottom (all `rz-block` + `fields.tsx`):
1. `rz-steps` "Steps to a finished letter": Who it's to · Opening line names the role · One example with a number · Closing asks for a next step. Meter as today. Done state: "Your letter is ready."
2. **The job** (collapsed `rz-block` when filled): Role, Company (TextField), "Job ad" AreaField. Keyword chips (`rz-kw`, data-hit true/false) under it: "6 of 9 words from the ad are in your letter". Hits use the existing chip style, misses dashed.
3. **To**: Contact name, Their title, Company address (optional, `rz-item-toggle` "Add address"). Date auto from preset, editable MonthField-style text.
4. **Letter**: Salutation select ("Dear Ms Ortiz," / "Dear hiring team,"), Opening, Body paragraphs (`rz-items` list, add/remove/reorder with existing `rz-icon-btn` arrows, max 4), Closing, Sign-off select. Live word count in `rz-mono` under the block: "312 words · most letters land between 250 and 400".
5. **From**: name, email, phone, links pulled from the linked resume, read-only by default with link "Edit in your resume" (opens resume editor in same tab, returns via back). Unlinked letters: editable fields.

Optional AI (reuse PolishButton pattern, rate limits and error strings): per paragraph quiet button "Suggest a rewrite"; on an empty letter with resume + ad, one secondary "Write a first draft from my resume". The draft lands in the fields and is undoable; we never overwrite text the user typed without undo.

Design tab: reuse `TemplateGrid` filtered to "Matches your resume" first (chosen badge "Same as your resume"), then the other templates; accent and density controls as in DesignPanel. Only letter-relevant controls.

Check tab: `CheckPanel` layout (`rz-score`, `rz-issue` list) with the checker rules from (d). Over one page: issue "Runs to a second page. Cut the longest paragraph."

Copy: empty body paragraph placeholder "What you did, with a number, that matters for this job." Opening placeholder "Name the role and why this company, in two sentences." Loading pane: "Opening your letter…". Missing draft: reuse "This letter isn't on this device" screen with "Start a new letter" / "Sign in".

## (c) Download + "matches your resume" handoff

Reuse `DownloadDialog` (native dialog, focus return, Escape). Signed-out step unchanged except h2 "Download is free" body "Sign in or create an account so we can save your letter. It downloads as soon as you're back."

Done state, three variants:
- Linked resume exists: h2 "Your letter is downloading", filename in mono, body "It uses the same design as your resume, so they look like a set." Actions: primary "Download the resume too", secondary "Write one for another job" (duplicates letter, clears The job + To), quiet "Back to editing".
- No resume on device: body "Make the resume to go with it. It opens in the same design." Primary "Build the matching resume" → `/resume/new?template=<id>&format=<preset>`; secondary "Back to editing".
- Error: toast "Couldn't make the PDF. Try again." (existing pattern).

On the resume side, add one line to the resume DownloadDialog done state: quiet link "Write a cover letter in the same design" → `/cover-letter/new?resume=<id>`. Keep "Turn it into a website" as the primary there.

Layout: the dialog is already full-width minus gutter at 375 and fixed-width from 640; actions stack on phone (`rz-dialog-actions` wraps). Buttons must not wrap to two lines: phone labels "Download resume" / "Another job".

## (d) Checker `/tools/cover-letter-checker`

Clone `AtsChecker`: running head "Free tools / Cover letter checker · No. 0XX", h1 + lead, then `lg:grid-cols-12` 5/7.

| Width | Layout |
|---|---|
| 375 | Inputs stacked, full-width submit, results below with `ResultsJump` scrolling to them on submit. |
| 768 | Same as 375 with wider textareas; parts bars 2 columns (`sm:grid-cols-2`). |
| 1280 | Form 5 columns, results 7. Empty state is the ruled `sp-cells` list. Use an even count (8) so the grid has no grey filler cell (current ATS page shows one at 1280 with 9 items). |

Inputs: "1. Your cover letter" (min 80 words, counter + "Stays in this browser tab"), "2. The job post (recommended)". Submit label states: "Paste at least 80 words of your letter" / "Check my letter" / "Check again".

Results:
- Score block (same markup as the ATS page, label "Letter score"): big number in Bricolage, "/ 100", right note: "7 of 11 words from the job post appear in your letter." or "No job post pasted, so job match is not scored."
- Part bars (ink on rule track, value right): Length, Opening, Specific examples, Job match, Clichés, Structure.
- Keyword chips (same as ATS).
- "Fix these, in this order": numbered ruled list with severity in mono ("Fix first / Fix next / Polish"), "Found:" evidence quotes, plain fix.
- "Lines to rewrite": stock phrases found ("I am writing to apply for", "I believe I would be a great fit", "team player"), each with reason and a link "Open it in the cover letter maker".
- Footer note: "This check reads text only. It cannot tell if your story is true or right for the company. Use the score to decide what to fix first."
- Handoff (replaces ToolHandoff upload for this tool): ruled sheet "Fix it in the maker. Paste stays, design matches your resume." primary "Open in the cover letter maker" (sessionStorage handoff of letter + ad, like BULLET_HANDOFF_KEY).

States: empty (cells list), result, re-run (results persist, button "Check again"), job post under 120 chars treated as missing with hint. No network call, so no loading state; if AI rewrites are added later, reuse PolishButton states.

## Accessibility (all screens)

- Tabs: existing role=tablist/tab/tabpanel wiring; phone tabbar keeps aria-selected and 44px+ targets. Preview button labelled "Show preview".
- Preview sheet image: `alt="Preview of your cover letter, page 1"`; text is also in the form, so no duplicate live region.
- Score and keyword count in `aria-live="polite"`; errors `role="alert"` with icon aria-hidden.
- Keyword chips: found/missing conveyed by icon aria-label and text, not colour alone (dashed border plus "Missing" sr text).
- Focus: 2px Proof Violet Ink, 3px offset; dialog returns focus to Download.
- Reduced motion: no new motion. Steps meter width change is instant under reduce.
- 320px: no horizontal scroll; title input truncates; button labels short enough for one line; textareas `min-width: 0`.

## New pieces (only these)

1. Letter Typst templates that reuse each resume template's header block (engine work, not UI).
2. `rz-ways` 768 layout variant (2+1).
3. Letter keyword meter text in the Job block (uses `rz-kw`).

## Copy check (no-ai-slop detect pass on the strings above)

Checked for banned words, binary contrasts, colon reveals and em-dash clusters: none in the UI strings. Lead and dialog lines name the concrete effect (same design, set, one page). No invented numbers; "250 and 400" is a length guideline, keep it only if the checker rule uses the same range.

## References used (composition only)

| Reference | Taken | Left |
|---|---|---|
| inspo `formafantasma-com` (Letter macro) | Letter preview as a document: narrow centred measure, plain numbered structure; supports one-page letter sheet and the 4 numbered steps. | Blue serif palette, centred labels, no display face. |
| inspo `gwern-net` (Long Document) | Ruled section heads over dense readable lists; applies to checker "Fix these" and "Lines to rewrite". | Bordered nav pills, blackletter, density of meta before content. |
| inspo `nytimes-com` (poll graphic) | Labelled horizontal bars with the value at the bar end; applies to checker part bars. | Two-colour teal/salmon bars (we stay ink on rule), ad chrome. |
| inspo recommend → `goodeggs-com` (Bento pick) | Nothing. Photo-led bento suits Persuade, not an Operate tool. | Whole composition. |
| Local `/resume/new`, `/tools/ats-checker` at 375/1280 | Start-screen cells, running head, 5/7 checker split, sp-cells empty state. | Grey filler cell in the 9-item ATS empty grid. |
