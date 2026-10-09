# Dossier brand and design system: the Specimen Sheet

Owner-facing brief for the marketing site redesign (October 2026). The code is the source of truth:
tokens and components live in `src/styles/site.css` and `src/components/marketing/`.

## 1. Direction

**Thesis.** Dossier sets your resume the way a type foundry sets a specimen. Every look the design engine
makes is a numbered specimen with real data: display face, body face, layout, hero, palette. The site proves
the product by showing one sample resume set again and again, instead of describing it.

**What we refuse.** The SaaS default: split hero with a laptop mockup over a glow, a logo bar, a row of three
icon cards, a testimonial carousel, a gradient CTA band.

**Kept from the brand.** The layered-tile logo glyph, the signature script wordmark (Mr Dafoe, dotless i with a
violet dot), the paper / ink / violet palette, Bricolage Grotesque as display, Inter for body, Geist Mono for data.

### Moodboard: what we borrowed and why

The inspiration pass was run from the catalogue the impeccable concept roll dealt (no `/inspo` skill or
inspiration MCP is installed in this workspace) plus well-known references. Borrowed disciplines, never costumes:

| Source | Borrowed | Avoided |
| --- | --- | --- |
| Foundry type specimens (Klim, Commercial Type, Swiss specimen books) | Huge showings, size waterfalls, data margins, numbered specimens | Type-nerd jargon in copy |
| Japanese high-density web | Density courage: ruled cells packed with real engine data | Tiny type for non-technical phone users |
| Broadcast teletext | Three-digit numbering that means something (look No. 009) | Its palette and bitmap face |
| Early one-bit desktops | Pressed and chosen states invert to solid ink | Window chrome and dithering |
| Stripe / Linear button craft | Label roll on hover, pointer-origin fills, fast press | Glows, gradients, glass |

## 2. Tokens (`.site` in `src/styles/site.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--site-paper` | `#f7f5f0` | Page ground |
| `--site-paper-deep` | `#ece8dd` | Second stock: alternating sections, auth art |
| `--site-sheet` | `#fffefb` | Sheets, plates, fields |
| `--site-ink` | `#101114` | Text, rules that structure the page, primary buttons |
| `--site-ink-2` | `#4f5562` | Secondary text (AA on paper and deep stock) |
| `--site-ink-3` | `#6b7080` | Placeholders and tertiary numbers only |
| `--site-rule` / `--site-rule-strong` | ink at 12% / 24% | Hairlines and cell gaps |
| `--site-accent` / `--site-accent-ink` | `#6d5cf6` / `#5847e8` | Highlighter, proof marks, focus, chosen state. Text uses accent-ink |
| `--site-accent-wash` | `#eeeafe` | Info notices, drag-over |
| `--site-radius` | 4px | Buttons, fields, chips. Sheets and plates use 2px |
| `--site-lift` | soft offset shadow | Only paper sheets and proof plates |
| `--site-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | All UI motion |

Color strategy: restrained. Ink and paper carry the page; violet is under 5% of any screen and always means
"marked": highlighter, the chosen look, focus, progress. Section rhythm comes from the second stock and one
full ink band (the phone section), not from new hues.

## 3. Type scale

| Class | Size | Notes |
| --- | --- | --- |
| Specimen showing | `clamp(3.25rem, 12.5vw, 8.75rem)` | Sample name in the current look's own display face |
| `.site-h1` | `clamp(2.5rem, 6.4vw, 5.25rem)` | Bricolage 700, -0.04em, balanced |
| `.site-h2` | `clamp(2rem, 4.4vw, 3.5rem)` | |
| `.site-h3` | `clamp(1.25rem, 2vw, 1.625rem)` | |
| `.site-lead` | `clamp(1.0625rem, 1.5vw, 1.25rem)` | ink-2, 38rem measure |
| `.site-body` | 1rem / 1.65 | 65ch measure |
| `.sp-data` | 0.75rem Geist Mono | Specimen data, running heads, counts. Never as an eyebrow above a heading |

Headings are always roman. Emphasis comes from weight, the highlighter, or a violet underline.

## 4. Layout grammar

- 12-column grid inside `.site-wrap` (78rem max, 16px gutter at 375px).
- Every page opens with a **running head**: a mono row (section name, count) over a 1px ink rule. It spans the
  sheet; the heading sits below on the grid, never directly under a label.
- Ink rules (1px `--site-ink`) open sections; hairlines (`--site-rule`) divide rows.
- `.sp-cells` builds ruled grids whose gaps are hairlines (specimen index, tool list).
- `.sp-crop` adds crop marks to a closing sheet. Used once per page at most.
- Proof plates show a printed site at small scale with a mono caption strip. No fake browser bars or phone frames.

## 5. Buttons, links, fields

| Variant | Rest | Hover (fine pointer) | Press |
| --- | --- | --- | --- |
| primary | ink fill, paper label | label rolls to its twin, arrow chip turns violet | inverts to paper with ink rule |
| secondary | sheet fill, ink rule | ink floods in from the pointer's entry point | ink |
| ghost | rule only | same flood | ink |
| paper (on ink) | paper fill | violet flood from entry point | inverts to ink |
| quiet | text only | 6% ink wash | ink |

Sizes: sm 44px, md 48px, lg 56px. Every target is at least 44px. Focus: 2px accent-ink outline, 3px offset,
shown instantly. Disabled: 45% opacity, no hover. Loading: `data-loading="true"` and a spinner in the label.

Links: `.site-link` (underline thickens), `.site-link-mark` (violet proof mark slides under). Chips `.sp-chip`
invert to ink when `aria-pressed`, `aria-checked` or `aria-selected` is true. Fields `.sp-field`: sheet fill,
24% rule, violet focus ring, red rule on `aria-invalid`.

## 6. Motion language (GSAP, `src/components/marketing/motion/gsap.ts`)

One authored moment per page, everything else quiet.

1. **Re-set (hero).** The sample name re-sets into the next look every 3.4s: letters rise from the baseline
   (`SplitText` chars, 0.6s, power3.out, 20ms stagger), the waterfall follows, the plate's palette crossfades
   over 500ms. Pauses on hover, focus, the pause button, or reduced motion.
2. **Proof story (how it works).** Desktop: plate column sticks; each step swaps the plate as it crosses the
   middle of the screen; a violet progress rule scrubs down the step list. Phone: each step carries its plate.
3. **Signature close.** Footer wordmark draws on like a pen stroke, the violet dot lands last; an ink copy
   follows the pointer.
4. **Masthead.** Condenses on scroll; an ink hairline tracks reading progress; a violet bar slides under the
   hovered or current link.

Rules: all tweens use `fromTo` with explicit end states so a reverted context can never strand content hidden.
Reduced motion shows the final state with no movement. Only transform, opacity, clip-path and colour animate.
Every module runs inside `useGSAP` + `gsap.matchMedia()` so it cleans up on route change.

## 7. Anti-slop audit (hallmark pass)

Checked and fixed during the build:

- Fake browser chrome (traffic-light dots) removed from the hero, the auth panel and the old OG card.
- No eyebrows above headings; running heads sit on their own row. Step numbers are inline in the heading.
- No invented numbers: the "21 looks" count, look names, faces and palettes are read from
  `src/lib/design/templates/specs.ts` at build time. Every person shown is labelled as a sample.
- Removed claims we could not support: time-to-site promises, "keyboard never covers the field",
  "Most people finish in under ten minutes", vanity slugs (published links use a short code).
- No gradient text, glass cards, icon-tile grids, italic headings or emoji.
- Copy avoids "it's not X, it's Y", negation lists and em dashes in headlines.

## 8. Image and asset list

| Asset | Status | Spec |
| --- | --- | --- |
| Site share card | Built, `src/app/opengraph-image.tsx` | 1200x630, specimen sheet with crop marks, Bricolage + script wordmark |
| Tool share cards | Built, `tools/[slug]/opengraph-image.tsx` | Same card, tool h1 and number |
| Hero visual | Built in code | Live specimen plate, real engine data, no raster |
| Proof plates (read, sort, set, publish) | Built in code | `HowPlates.tsx`, sample resume data |
| Phone-width proof | Built in code | 390px Ledger look, labelled as a sample |
| App icons | Existing | `icon.tsx`, `apple-icon.tsx` draw the logo glyph |
| Builder photo | Existing | `public/brand/builder.webp` (owner's portrait, footer) |
| Real portfolio screenshots | To source | Once real users publish and consent: 3 to 5 published sites at 1440 and 390 wide, PNG, with written permission. Replace the sample proof plates on the home page with them |

No stock photos and no AI-generated images are used. That is deliberate: the product's own output is the
imagery.

## 9. Pages

`/` home, `/how-it-works`, `/features`, `/pricing`, `/faq`, `/tools`, `/tools/resume-checker`,
`/tools/headline-writer`, `/tools/linkedin-about`, `/tools/link-in-bio`, `/tools/resume-to-website`,
`/invite` (referral landing, noindex), `/login`, `/signup`. All in `sitemap.ts` except `/invite`.
