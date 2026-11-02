# Cover letter maker and checker: spec

Merged from four research passes on 2026-11-03:

| File | Skills | Topic |
|---|---|---|
| [1-competitors.md](1-competitors.md) | competitor-profiling, competitors, reverse-engineer-anything | 11 competitors, flows, paywalls, gaps |
| [2-architecture.md](2-architecture.md) | codebase plan | Reuse of the resume engine, data model, checker, storage, step order |
| [3-seo-content.md](3-seo-content.md) | programmatic-seo, ai-seo, copywriting, cro | Pages, meta, 12 posts, role examples, AI search, launch |
| [4-design.md](4-design.md) | impeccable, hallmark, no-ai-slop, inspo | Screens at 375/768/1280, copy, states |

## Positioning
Competitors let people build a whole letter and then charge for the PDF (Zety, Resume Genius, Resume.io: $2.95 trial that renews at about $24–30 every 4 weeks), or ask for signup before any output (Rezi, Jobscan). No one offers a free letter built from your own resume, styled to match it, in your country's format, with an honest checker. That is the Dossier angle:

> One job ad, a matching resume and cover letter. Free PDF, no watermark.

## Flow (5 steps)
1. Start: use my Dossier resume (default when one exists), paste the job ad, or start blank.
2. Job: paste the ad, or role and company.
3. Format: country preset and template (defaults from the resume).
4. Draft and edit: rule-based draft from the resume and the ad, live preview, Check tab.
5. Download: PDF typeset with the same engine and a letterhead matched to the resume template; "download the resume too" or "build the matching resume".

## Build pieces
- **Engine**: `letter.typ` sharing `kit.typ`'s masthead, so the letter matches each resume template. `resume:verify` must show the resumes unchanged.
- **Generator**: rule-based (`letterGen.ts`) from the user's own facts; placeholders where facts are missing; optional AI polish per paragraph through the existing `/api/tools-polish` chain and quota.
- **Checker**: `letterScan.ts` sharing atsScan helpers through a new `textKit.ts`; scores keywords, personalization, structure, length, evidence, clichés/tone; country conventions; resume consistency. Standalone tool page and a Check tab in the editor.
- **Storage**: device drafts like resumes; account sync through a new `cover_letters` table (migration the owner runs).
- **Pages**: tool pages, the checker, 12 blog posts (India fresher, Anschreiben, Gulf, UK, career change, internship, short letter, how to address, length, Australia, Canada, vs resume), role example pages later with a quality bar (noindex until each has unique content).
- **AI search**: llms.txt section, brand facts line, app schema features.
- **Launch**: cover letter card in the resume download dialog, one email to existing users, brand-page posts, Reddit replies, campus career offices, directories.

## Decisions for the owner
See the questions asked on 2026-11-03: download gate, writing approach, v1 scope, and whether to commit the earlier work first.
