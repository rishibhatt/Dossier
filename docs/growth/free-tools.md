# Free tools

All tools are ungated, run in the browser, and cost nothing per use (no AI calls). Code: `src/features/tools/`,
pages: `src/app/(marketing)/tools/`. Each page has its own title, description, share card and
`WebApplication` JSON-LD, and ends with a working upload slot into the builder.

| No. | Tool | Search angle | User value | Lead capture | CTA into Dossier |
| --- | --- | --- | --- | --- | --- |
| 001 | Resume checker | "free resume checker", "resume score" | Ten weighted checks on pasted text, fix list in priority order | None at the gate; the upload slot under the report | "Now see it the way a recruiter would" |
| 002 | Headline writer | "linkedin headline generator", "portfolio headline" | Six headline shapes with 220-character counts | Upload slot | "Your headline goes under your name" |
| 003 | LinkedIn About builder | "linkedin about section generator" | Short, standard and story versions from five answers | Upload slot | "The same words can open your portfolio" |
| 004 | Link-in-bio page | "link in bio for resume" | Live preview and a text version to copy | Upload slot | "Publish it with your portfolio" |
| 005 | Resume to website | "resume to website", "turn resume into website" | The product itself, free | Signup at publish | "Upload my resume" |

## Scorecard (1 to 5)

| Factor | Checker | Headline | About | Link page | Resume to site |
| --- | --- | --- | --- | --- | --- |
| Search demand | 5 | 4 | 4 | 3 | 4 |
| Audience match | 5 | 4 | 4 | 3 | 5 |
| Uniqueness | 3 | 3 | 3 | 2 | 4 |
| Path to product | 4 | 4 | 4 | 4 | 5 |
| Build feasibility | 5 | 5 | 5 | 5 | 5 |
| Maintenance (inverse) | 5 | 5 | 5 | 5 | 4 |
| Link potential | 4 | 3 | 3 | 2 | 3 |
| Shareability | 4 | 3 | 3 | 3 | 4 |
| **Total** | **35** | **31** | **31** | **27** | **34** |

## Next tools worth building

- **Portfolio URL checker**: paste any portfolio link, get a readability and mobile report. Needs a server
  fetch, so rate-limit it with `consumeQuota`.
- **Resume PDF to text**: paste-free version of the checker using the existing `/api/parse-pdf` route, behind
  the anonymous parse cap.
- **Role pages** (programmatic SEO): "Portfolio website for accountants", "for teachers" and so on, one per
  template `bestFor` group, each showing the matching looks from the engine.

## Measuring

Per tool: page views, tool runs (submit or first output), copy clicks, upload-slot file chosen, and downstream
first publish. A tool that gets runs but no uploads needs a better bridge line, not more features.
