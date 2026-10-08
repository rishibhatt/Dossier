---
name: Dossier
description: Your resume, set as a website. The site is a foundry type specimen sheet for the looks the engine makes.
colors:
  paper: "#f7f5f0"
  paper-deep: "#ece8dd"
  sheet: "#fffefb"
  card-white: "#ffffff"
  ink: "#101114"
  ink-hover: "#24262e"
  ink-2: "#4f5562"
  ink-3: "#6b7080"
  rule: "rgba(16, 17, 20, 0.12)"
  rule-strong: "rgba(16, 17, 20, 0.24)"
  proof-violet: "#6d5cf6"
  proof-violet-ink: "#5847e8"
  violet-wash: "#eeeafe"
  danger: "#b42318"
  ok: "#1f7a4d"
typography:
  showing:
    fontFamily: "the current look's display face, then Bricolage Grotesque"
    fontSize: "clamp(3rem, 13.5vw, 10.5rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Bricolage Grotesque, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6.4vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, Inter, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage Grotesque, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.625rem)"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1.5vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
  button:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.01em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "\"tnum\" 1, \"zero\" 1"
  wordmark:
    fontFamily: "Mr Dafoe, Segoe Script, cursive"
    fontSize: "1.95rem"
    fontWeight: 400
    lineHeight: 0.8
rounded:
  plate: "2px"
  control: "4px"
spacing:
  gutter: "clamp(1rem, 4vw, 2rem)"
  container: "78rem"
  section: "5rem"
  section-lg: "7rem"
  cell: "1rem"
  sheet-pad: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-primary-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-paper-hover:
    backgroundColor: "{colors.proof-violet}"
    textColor: "{colors.card-white}"
  button-sm:
    height: "2.75rem"
    padding: "0 1rem"
  button-lg:
    height: "3.5rem"
    padding: "0 1.75rem"
  field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.75rem 0.875rem"
    height: "3rem"
  chip:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 0.875rem"
    height: "2.75rem"
  chip-chosen:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  masthead:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    height: "3.75rem"
  upload-slot:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    padding: "0.5rem"
  upload-slot-over:
    backgroundColor: "{colors.violet-wash}"
  plate:
    backgroundColor: "{colors.card-white}"
    rounded: "{rounded.plate}"
---

# Design System: Dossier

## Overview

**Creative North Star: "The Specimen Sheet"**

Dossier sets a resume the way a type foundry sets a specimen. The site is printed on uncoated paper with ink and one violet, and every look the design engine makes is shown as a numbered specimen carrying its real data: display face, body face, layout, hero, palette. The page proves the product by setting one labelled sample resume again and again rather than describing it. The grid is not hidden: hairline column rules, ruled cells, ink rules that open sections, crop marks on a closing sheet, and three-digit specimen numbers in mono.

Density is a deliberate courage in the data cells (specimen index, plate tables, tool results), while headings and leads stay generous and legible for non-technical phone users. Showings are set huge; the data beside them is small, mono and exact. Chosen and pressed states invert to solid ink, the way a selected proof is marked. Motion is one authored moment per page (the hero re-set, the proof story, the signature close), and everything else is quiet.

The system rejects the SaaS default: a split hero with a laptop mockup over a glow, a logo bar, three icon cards, testimonial carousels, gradient CTA bands, fake browser chrome, gradient text, glass, and italic headings.

**Key Characteristics:**
- Paper, ink and one violet; violet always means "marked".
- A visible 12-column hairline grid, ruled cells and ink section rules.
- Three-digit specimen numbers (No. 014) in Geist Mono as folios, never as eyebrows.
- Bricolage Grotesque set big for showings and headings; Inter for reading; Geist Mono for data.
- Square-ish corners (4px controls, 2px plates); flat except for the paper lift on sheets and plates.
- Pressed and chosen states invert to ink.

## Colors

A restrained print palette: two paper stocks and ink carry every page, and a single violet is reserved for marks.

### Primary
- **Proof Violet** (`proof-violet`): the highlighter sweep, the violet proof mark under links, the masthead hover bar, the wordmark's i-dot, the primary button's arrow chip on hover, the paper button's flood, selection, caret, and focus rings. Never a fill for large areas.
- **Proof Violet Ink** (`proof-violet-ink`): the text-safe violet. Use it whenever violet must be read as text or as a 2px focus outline (current nav number, checkmarks on paper).
- **Violet Wash** (`violet-wash`): info notices and the upload slot's drag-over state.

### Neutral
- **Specimen Paper** (`paper`): the page ground and the label color on ink buttons.
- **Second Stock** (`paper-deep`): alternating sections (specimen index), auth art, the marked column in comparison tables. Section rhythm comes from switching stock, not from new hues.
- **Sheet** (`sheet`): the brighter stock for sheets, fields, chips, upload slots and secondary buttons.
- **Plate White** (`card-white`): proof plate interiors and app cards.
- **Ink** (`ink`): text, the 1px rules that structure a page, primary buttons, chosen chips, the inverted pricing column and the one full ink band per page.
- **Ink Hover** (`ink-hover`): the primary button and upload button on hover only.
- **Ink 2** (`ink-2`): secondary text, leads, data, nav links at rest (AA on both stocks).
- **Ink 3** (`ink-3`): placeholders and tertiary numbers only; not for running text.
- **Hairline / Strong Hairline** (`rule`, `rule-strong`): ink at 12% for cell gaps, column rules and row dividers; ink at 24% for field, chip, ghost and plate borders and the masthead bottom rule.
- **Danger / OK** (`danger`, `ok`): invalid field borders, error alerts, and pass/fail marks in tools. Status only.

### Named Rules
**The One Violet Rule.** Violet covers under 5% of any screen and always means marked: highlighted, chosen, focused, or in progress. If violet is decorating, remove it.

**The Two Stocks Rule.** Sections alternate between Specimen Paper and Second Stock, with at most one full ink band per page. Do not introduce a tinted section color to create rhythm.

**The Look Owns Its Plate Rule.** Inside a specimen plate or index cell, the look's own palette and display face take over (background, text, accent). Outside the plate, only site tokens apply.

## Typography

**Display Font:** Bricolage Grotesque (via `--font-site-display`, with Inter and system-ui fallback)
**Body Font:** Inter (with system-ui fallback)
**Label/Mono Font:** Geist Mono (with ui-monospace fallback), tabular figures and slashed zero
**Wordmark Font:** Mr Dafoe, for the wordmark only

**Character:** A wide, warm grotesque set tight and heavy for showings against a neutral reading face and an exact mono for data, the three voices of a specimen sheet: the showing, the text, the caption.

### Hierarchy
- **Showing** (700, `clamp(3rem, 13.5vw, 10.5rem)`, 0.9): the sample name in the current look's own display face, followed by a size waterfall of resume lines labelled with their point sizes in mono. Hero and specimen surfaces only.
- **Display** (700, `clamp(2.5rem, 6.4vw, 5.25rem)`, 0.96, -0.04em, balanced): page h1. Inner pages and the hero clamp it to a 4.5rem ceiling on desktop.
- **Headline** (700, `clamp(2rem, 4.4vw, 3.5rem)`, 1, -0.035em): section h2.
- **Title** (650, `clamp(1.25rem, 2vw, 1.625rem)`, 1.15): plan names, table captions, card heads.
- **Lead** (400, `clamp(1.0625rem, 1.5vw, 1.25rem)`, 1.55, ink-2, 38rem measure): the sentence beside a heading, usually aligned to the heading's baseline in the neighbouring columns.
- **Body** (400, 1rem, 1.65, ink-2, 65ch measure).
- **Label** (600, 0.875rem, ink): field labels.
- **Data** (400, 0.75rem Geist Mono, 1.45, tabular): running heads, specimen numbers, faces, sizes, hex values, file limits, counts.
- **Price** (Bricolage 700, 3.5rem, 1, -0.04em): plan prices.

### Named Rules
**The Roman Heading Rule.** Headings are always roman and sentence case. Emphasis comes from weight, the violet highlighter, or a violet underline, never italics or gradient text.

**The Data Is Not An Eyebrow Rule.** Mono data sets numbers, faces, sizes and URLs. It never sits as a label directly above a heading; running heads live on their own ruled row across the sheet.

## Layout

A 12-column grid inside a centred container (78rem max, inline padding `clamp(1rem, 4vw, 2rem)`, 16px at 375px). On desktop (1024px and up) the grid is drawn: 1px column rules at ink 12% behind hero blocks. Phones get one column and no drawn columns.

Every page opens with a **running head**: a mono row (section name left, count or specimen number right) over a 1px ink rule spanning the container. Below it the title takes about 7 to 8 columns and the lead the remaining 4 to 5, aligned to the bottom. Home sections repeat this with a `No. 0XX` running head. Sections breathe at 5rem vertical padding on phones and 7rem from 640px.

Ruled cells build dense grids whose gaps are 1px hairlines (specimen index at 1/2/4 columns, tool results). Hairlines divide rows; ink rules open sections and bound pricing.

The hero splits 7/5: the specimen plate on the left (under a crop-marked frame), copy and upload slot on the right. On phones the plate comes first. A floating full-width CTA slides up on phones after the hero and is hidden from 640px.

**The Visible Grid Rule.** The grid is shown, not implied: hairline columns, ruled cells and ink rules are the structure. Do not replace them with cards floating on whitespace.

**The One Crop Rule.** Crop marks appear on at most one sheet per surface (the hero plate or the closing sheet).

## Elevation & Depth

Flat by default. Depth comes from stock changes (paper, second stock, sheet, white plate), hairlines and ink inversion. The only shadow is the paper lift, given to physical objects: paper sheets and proof plates. Fields use a violet focus halo; the masthead "condenses" with an inset ink rule, not a shadow.

### Shadow Vocabulary
- **Paper Lift** (`box-shadow: 0 1px 1px rgba(16, 17, 20, 0.04), 0 12px 28px -16px rgba(16, 17, 20, 0.32)`): sheets and proof plates only.
- **Field Focus Halo** (`box-shadow: 0 0 0 3px rgba(109, 92, 246, 0.25)`): focused fields, with the border switching to Proof Violet Ink.
- **Masthead Condensed** (`box-shadow: inset 0 -1px 0 #101114`): thickens the masthead's bottom rule once the page scrolls.

### Named Rules
**The Paper Lift Rule.** Only objects that are physically paper (sheets, proof plates) lift. Buttons, chips, cards and sections stay flat.

## Shapes

Square-ish and printed. Controls (buttons, fields, chips, the upload button) use 4px; plates, sheets, arrow chips, swatches and the upload icon cell use 2px. Borders are 1px: ink for structural edges and chosen states, 24% ink for controls at rest, 12% ink for hairlines. The upload slot is the one dashed border, drawn in ink, marking a place to drop. The logo tile (10px corners) and the wordmark's round i-dot are brand assets and do not set the radius language.

## Components

### Buttons
Tactile and exact: the label rolls, the fill floods from where the pointer entered, the press stamps.
- **Shape:** gently squared (4px), heights 44 / 48 / 56px (sm / md / lg); every target is at least 44px.
- **Primary:** ink fill, paper label, optional trailing arrow chip (2px corners, white at 14%).
- **Hover (fine pointers only):** the label slides up and its twin rolls in (420ms, `cubic-bezier(0.22, 1, 0.36, 1)`); the arrow exits right as a second arrives from the left; primary lightens to Ink Hover and its arrow chip turns Proof Violet. Secondary and ghost flood with ink from the pointer's entry point (circle clip-path, 480ms). Paper floods violet.
- **Press:** every variant inverts and drops 1px in 60ms: primary goes to paper with an ink rule, paper goes to ink, quiet goes to ink.
- **Variants:** secondary (sheet fill, ink rule), ghost (24% rule, transparent), paper (for use on ink), quiet (text only, 6% ink wash on hover).
- **Focus:** 2px Proof Violet Ink outline, 3px offset (paper outline on the paper variant). Disabled: 45% opacity, no hover. Loading: `data-loading` with a spinner in the label.

### Links
- **Underline link:** a 1px underline that thickens to 2px on hover.
- **Proof mark link:** a 2px violet mark slides under the 1px underline on hover (320ms).
- **Nav link:** ink-2 at rest, ink on hover or current.

### Chips
- **Style:** sheet fill, 24% rule, 4px, 44px tall, 0.875rem 500, with a mono count inside.
- **State:** chosen (`aria-pressed`, `aria-checked` or `aria-selected`) inverts to ink fill and paper text; hover at rest sharpens the border to ink.

### Inputs / Fields
- **Style:** sheet fill, 24% rule, 4px, 48px minimum, 1rem text, violet caret, Ink 3 placeholder.
- **Hover:** border to ink at 45%.
- **Focus:** border to Proof Violet Ink plus the violet halo.
- **Error:** Danger border on `aria-invalid`; alert text in Danger with an inline icon.

### Navigation (Masthead)
A ruled strip across the sheet, not a floating pill: 60px tall, paper ground, 24% bottom rule. Links pair a small mono number (ink-3, Proof Violet Ink when current) with a 0.9375rem 500 label. A 2px violet bar slides under the hovered or current link; a 1px ink progress rule tracks reading; on scroll the bottom rule thickens to ink.

### Proof Plate
A printed site at reduced scale: white plate, 24% rule, 2px corners, Paper Lift, and a mono caption strip on Sheet. No fake browser bars, traffic-light dots or phone frames.

### Specimen Plate (signature)
The hero's live specimen: a crop-marked frame filled with the current look's palette, a mono header (`No. 0XX` and the look's name), the sample name as a showing, a waterfall of resume lines labelled 32 / 20 / 14, swatches with hex values, and a mono table of Display / Body / Layout / Hero. It re-sets every 3.4s (letters rise from the baseline, 0.6s, 20ms stagger), pausing on hover, focus, the pause button, or reduced motion. Always captioned as a sample.

### Specimen Index Cell (signature)
One look per ruled cell: a swatch panel in the look's own palette (mono number and mode, the look's name in its display face at 2rem, the sample name, a 4px accent bar) over a paper panel with a tagline and mono face/layout data. Filter chips above keep numbering stable.

### Upload Slot (signature)
The primary action printed into the sheet: a dashed ink cell on Sheet with an ink upload button inside (72px minimum, icon cell, title and drop/tap hint), and a mono fine-print row (file limit, "Free, no card"). Drag-over washes the cell violet; press inverts the button to paper.

### Running Head
A full-width mono row over a 1px rule: label left, `No. 0XX` or count right. It opens every page and home section and is the folio of the sheet.

### Pricing Columns
Three ruled columns between ink rules; the recommended plan is the marked proof, inverted to ink with a paper button. The comparison table marks that column with Second Stock.

### Wordmark and Logo
The layered-tile glyph (three stacked layers on a dark tile) beside the script wordmark: Mr Dafoe, a dotless i with a hand-placed Proof Violet dot. On hover the wordmark draws on like a pen stroke and the dot lands last. The footer sets the wordmark at full container width in a pale paper tone, with an ink copy revealed under the pointer.

### Highlighter
A violet marker sweep (violet at 32% to 20%, 0.6em tall, sitting at 85% of the line) behind key words, tweened from 0 to full width by GSAP and shown complete under reduced motion.

### FAQ
Native disclosure rows; the answer opens by animating its grid row (300ms), the plus rotates 45 degrees, and the question takes a 2px violet underline on hover.

### App bridge
`src/styles/theme.css` maps these values onto shadcn tokens (surface, brand primary ink, brand accent violet) for the dashboard, studio and auth, which also read the `--site-*` tokens directly. The `--site-*` set is the source of truth.

## Do's and Don'ts

### Do:
- **Do** keep each surface to paper, second stock, sheet, ink and one violet; text violet uses Proof Violet Ink.
- **Do** open every page and home section with a running head (mono label, `No. 0XX`) over a 1px ink rule spanning the container.
- **Do** build dense data as ruled cells with 1px hairline gaps, and set numbers, faces, sizes and hex values in Geist Mono with tabular figures.
- **Do** invert chosen and pressed states to solid ink (chips, the marked plan, pressed buttons).
- **Do** use 4px corners on controls and 2px on plates and sheets.
- **Do** keep every interactive target at least 44px and focus rings at 2px Proof Violet Ink with a 3px offset.
- **Do** author motion with GSAP `fromTo` and explicit end states inside `useGSAP` and `gsap.matchMedia()`, animate only transform, opacity, clip-path and color, and show the final state under reduced motion.
- **Do** use `cubic-bezier(0.22, 1, 0.36, 1)` for UI transitions.
- **Do** label every sample person, resume and portfolio as a sample, and read look names, faces and palettes from the engine.

### Don't:
- **Don't** use a split hero with a laptop mockup, logo bars, rows of three icon cards, testimonial carousels or gradient CTA bands.
- **Don't** draw fake browser chrome (traffic-light dots, URL bars) or phone frames around proof plates.
- **Don't** put a mono label or kicker directly above a heading; the running head sits on its own ruled row.
- **Don't** give shadows to buttons, chips, cards or sections; only sheets and plates lift.
- **Don't** use gradient text, glass, glows, italic headings or emoji.
- **Don't** use pill shapes or large radii on site controls.
- **Don't** use violet as a large fill or as decoration.
- **Don't** use the Mr Dafoe script anywhere but the wordmark.
