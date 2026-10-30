# What the popular Overleaf resumes get right, and how our templates use it

Written 2026-10-20. The owner's rule: study the patterns, write original Typst. No Overleaf source is copied or ported.

## Templates studied

Gallery capture (2026-10-23, headless Chrome via REA, evidence ev_cef2ee9b…): the CV tag runs to 83 gallery pages. Overleaf shows no view counts; its only popularity signal is "Top pick", currently Simple Hipster CV, AltaCV and A Customised CurVe CV. Recent additions include Minimal Academic CV, Modified Friggeri CV, ReCeiVe (built on Awesome CV), twentyoneseconds (sidebar with skill bars) and resumes built on Medium Length CV.

The most-used resume and CV templates on Overleaf's gallery fall into a few families. We looked at how each one is built (document structure, font setup, how dates and headings are set) rather than at their files' text.

| Family | Pattern | Why it parses well, or doesn't |
|---|---|---|
| "Jake's Resume" style (single column, centred name, small-caps heads over a rule) | Organisation and location on one line, role and dates on the next, tight bullets | Reads top to bottom. Its `\pdfgentounicode=1` line gives every glyph a Unicode map, so text copies out cleanly. |
| sb2nov / "Software Engineer" | Same as above, denser | Same strengths. Uses `tabular*` for date alignment, which some parsers merge into one line. |
| moderncv (classic, banking) | Left label column with dates, content right | Readable, but the date column is set before the role, so some parsers attach dates to the wrong job. |
| Awesome CV | Coloured section titles, header with icons | Icon fonts (FontAwesome) come out as private-use characters or nothing. |
| AltaCV, Deedy | Two columns, sidebar first in source | The sidebar is often emitted first, so skills come before the name or the jobs. |
| Academic CV (res, curve) | Serif, long, numbered publications | Fine when one column. `\cventry`-style macros put dates first. |

## Rules we took

1. **One text flow.** Everything a parser needs is in reading order in the file. Two-column layouts (Column) set the main column first in source.
2. **A Unicode map for every glyph.** Typst embeds fonts with ToUnicode maps by default; we also turn ligatures off so "fi" and "ff" never become one unknown character.
3. **No icons, no skill bars, no text boxes, no header or footer contact.** Contact details sit in the body under the name.
4. **Standard headings.** Experience, Education, Skills, Projects, Certifications, Languages. A custom heading is allowed but never replaces a standard one.
5. **Dates after the role, aligned right.** Title, then dates, then organisation. Plain keeps the student pattern (organisation first) and Compact puts role and organisation on one line; both are checked in that order.
6. **Nothing splits inside a token.** Contact items never wrap mid-URL, and words joined by a slash ("A/B testing", "CI/CD") stay on one line, because a break there reads back as two words.
7. **Headings stay with their first entry** (Typst `sticky` blocks), so a section never starts at the foot of a page.
8. **Body 9.5 to 10.5 pt, never below 8.5 pt.** Margins 12 to 20 mm by density.

## What each template takes from which pattern

| No. | Template | Pattern it follows |
|---|---|---|
| R-001 | Ledger | Plain one-column with spaced capital heads |
| R-002 | Plain | The single-column student pattern (organisation first, centred name) |
| R-003 | Column | Two columns with the main column first in source, the fix for the AltaCV/Deedy problem |
| R-004 | Scholar | Academic CV: serif, numbered publications, multi-page |
| R-005 | Compact | Dense single column, one line per role |
| R-006 | Modern | Hanging section titles (the moderncv idea) with dates after the role |
| R-007 | Executive | Centred serif name, summary as a lead, achievements first |
| R-008 | Fresher | Education and projects first, contact stacked on the right |
| R-009 | Switcher | Hybrid: profile panel and skills before history |
| R-010 | Europa | Europass order with CEFR language levels, label column |
| R-011 | Gulf | Personal details block (nationality, visa, licence) |
| R-012 | Specimen | Display face for the name and heads, still one flow |

## How it is checked

`npm run resume:verify` sets every template with every fictional sample resume (46 as of 2026-10-23), at 3 densities and on A4 and US Letter, and reads each PDF back with pdf.js: every field present and in order, no broken glyphs, links clickable, title metadata set, contact near the top. Results go to `content/resume-templates/verification/<template>.json`, which the website reads. Manual tests in commercial ATS products (Textkernel, Affinda, Workday auto-fill) are still to do and are not claimed anywhere.

## The kit (R-013 to R-042)

`src/resume/typst/kit.typ` is one renderer with presentation options (header, heading style, entry style, sidebar, skills layout, faces). Each kit template is a short file of options. Two findings from building it, both caught by the verification script:

- **Typst writes text in on-page order.** A grid that puts the date cell or a sidebar on the left emits it first, whatever order the cells are declared in. Left date columns therefore draw the date with `place()` after the role and organisation; sidebars sit on the right.
- **The left sidebar of AltaCV and Simple Hipster CV cannot be made parse-safe this way**, so Harbor, Field and Range use a right sidebar. They keep the look of the Overleaf favourites while passing the reading-order check.

Faces added for the kit (OFL, static): IBM Plex Serif, Lato, PT Serif, PT Sans, Fira Sans, Crimson Text.
