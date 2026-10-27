// Dossier template kit. One renderer, many layouts: each template from R-013 on is a short file that picks
// options here. The options only change presentation; every option keeps one text flow in reading order:
// name, headline, contact, summary, then each section's heading and entries (role, dates, organisation,
// bullets). Checked by scripts/resume/verify.ts for every template, sample, density and paper size.
#import "lib.typ": *

#let defaults = (
  font: "Inter",            // body face
  head-font: none,          // heading face (none = body face)
  name-font: none,          // name face (none = heading face)
  name-scale: 2.3,          // name size in multiples of the body size
  name-weight: 700,
  name-upper: false,
  name-tracking: -0.02em,
  header: "stack",          // stack | center | split | banner | rule
  contact-sep: [#h(0.45em)·#h(0.45em)],
  heading: "caps-rule",     // caps-rule | bold-rule | bar | accent-underline | square | line-after | double-rule | plain | side
  head-scale: 1,
  head-tracking: 0.07em,
  entry: "two-line",        // two-line | one-line | org-first | date-gutter
  layout: "single",         // single | side-right | side-left
  side-width: 31%,
  skills: "lines",          // lines | grid | inline
  summary-label: "Summary", // none = summary set as a lead paragraph without a heading
  rule: rule-color,
  rule-weight: 0.6pt,
  accent-name: false,       // set the name in the accent colour
  marker: [•],
  gutter: 25%,              // label column for heading: "side"
  date-col: 30mm,           // date column for entry: "date-gutter"
  band: rgb("#f1f0ec"),
)

#let render(m, opts) = {
  let o = defaults + opts
  let st = m.style
  let accent = rgb(st.accent)
  let head-font = if o.head-font == none { o.font } else { o.head-font }
  let name-font = if o.name-font == none { head-font } else { o.name-font }

  set document(title: m.meta.title, author: m.meta.author, keywords: m.meta.keywords, date: none)
  set page(paper: st.paper, margin: st.margin * 1mm)
  set text(font: o.font, size: st.size * 1pt, ligatures: false, lang: "en", fill: ink, hyphenate: false)
  set par(leading: st.leading * 1em, spacing: st.leading * 1.6em)
  set list(marker: o.marker, indent: 0.1em, body-indent: 0.6em, spacing: st.leading * 1em)

  // ---------------------------------------------------------------- Header
  let name = text(
    font: name-font,
    size: st.size * o.name-scale * 1pt,
    weight: o.name-weight,
    tracking: o.name-tracking,
    fill: if o.accent-name { accent } else { ink },
    if o.name-upper { upper(m.doc.name) } else { m.doc.name },
  )
  let headline = if m.doc.headline != "" { text(size: st.size * 1.12pt, fill: ink2, m.doc.headline) }
  let contact = if m.doc.contact.len() > 0 { text(size: st.size * 0.95pt, contact-line(m.doc.contact, sep: o.contact-sep)) }
  let personal = if m.doc.personal.len() > 0 { text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal)) }
  let stacked(..parts) = parts.pos().filter(p => p != none).enumerate().map(((i, p)) => if i == 0 { p } else { block(above: st.leading * 1.1em, p) }).join()

  if o.header == "center" {
    align(center, stacked(name, headline, contact, personal))
  } else if o.header == "split" {
    // Name and headline left, contact items stacked right; cells are emitted left then right.
    grid(
      columns: (1fr, auto),
      column-gutter: 1.2em,
      align: (left + bottom, right + bottom),
      stacked(name, headline),
      text(size: st.size * 0.92pt, m.doc.contact.map(c => box(maybe-link(c.url, c.text))).join(linebreak())),
    )
    if personal != none { block(above: st.leading * 1em, personal) }
  } else if o.header == "banner" {
    block(width: 100%, fill: o.band, inset: (x: 5mm, y: 4.5mm), stacked(name, headline, contact, personal))
  } else if o.header == "rule" {
    stacked(name, headline)
    block(above: st.leading * 1.2em, below: st.leading * 1em, line(length: 100%, stroke: 1.2pt + accent))
    stacked(contact, personal)
  } else {
    stacked(name, headline, contact, personal)
  }

  // ---------------------------------------------------------------- Headings
  let head-text(title, weight: 700, upper-case: true) = text(
    font: head-font,
    size: st.size * (if upper-case { 0.92 } else { 1.12 }) * o.head-scale * 1pt,
    weight: weight,
    tracking: if upper-case { o.head-tracking } else { 0em },
    fill: accent,
    if upper-case { upper(title) } else { title },
  )
  let heading(title) = {
    let above = st.gap * 13pt
    let below = st.gap * 6pt
    if o.heading == "caps-rule" {
      block(above: above, below: below, width: 100%, sticky: true)[#head-text(title) #v(-0.5em) #line(length: 100%, stroke: o.rule-weight + o.rule)]
    } else if o.heading == "bold-rule" {
      block(above: above, below: below, width: 100%, sticky: true)[#head-text(title, upper-case: false) #v(-0.55em) #line(length: 100%, stroke: o.rule-weight + ink)]
    } else if o.heading == "bar" {
      block(above: above, below: below, width: 100%, sticky: true, fill: o.band, inset: (x: 2.5mm, y: 1.6mm), head-text(title))
    } else if o.heading == "accent-underline" {
      block(above: above, below: below, sticky: true)[#head-text(title, upper-case: false) #v(-0.45em) #rect(width: 9mm, height: 0.9mm, fill: accent, stroke: none)]
    } else if o.heading == "square" {
      block(above: above, below: below, sticky: true, grid(columns: (auto, auto), column-gutter: 0.5em, align: horizon, rect(width: 2mm, height: 2mm, fill: accent, stroke: none), head-text(title)))
    } else if o.heading == "line-after" {
      block(above: above, below: below, width: 100%, sticky: true, grid(columns: (auto, 1fr), column-gutter: 0.6em, align: horizon, head-text(title), line(length: 100%, stroke: o.rule-weight + o.rule)))
    } else if o.heading == "double-rule" {
      block(above: above, below: below, width: 100%, sticky: true)[#line(length: 100%, stroke: 0.4pt + ink) #v(-0.6em) #line(length: 100%, stroke: 0.4pt + ink) #v(-0.3em) #head-text(title)]
    } else {
      block(above: above, below: below, sticky: true, head-text(title, upper-case: false))
    }
  }

  // ---------------------------------------------------------------- Entries
  let entry(e) = {
    if o.entry == "one-line" {
      grid(columns: (1fr, auto), column-gutter: 1em,
        [#text(weight: 700, maybe-link(e.link, e.title))#if e.subtitle != "" [, #e.subtitle]#if e.meta != "" [#text(fill: ink2)[, #maybe-link(e.link, e.meta)]]],
        align(right, text(fill: ink2, e.date)))
    } else if o.entry == "org-first" {
      let lead = if e.subtitle != "" { e.subtitle } else { e.title }
      let second = if e.subtitle != "" { e.title } else { "" }
      grid(columns: (1fr, auto), column-gutter: 1em, row-gutter: st.leading * 0.9em,
        text(weight: 700, maybe-link(e.link, lead)), align(right, if second != "" { maybe-link(e.link, e.meta) } else { e.date }),
        ..if second != "" { (emph(second), align(right, emph(e.date))) } else { () })
    } else if o.entry == "date-gutter" {
      // moderncv-style date column on the left. Typst writes text in on-page order, so the date is drawn into
      // the gutter with place() after the role: the text reads role, organisation, then dates.
      block(width: 100%, inset: (left: o.date-col))[
        #text(weight: 700, maybe-link(e.link, e.title))#if e.subtitle != "" or e.meta != "" { linebreak(); text(fill: ink2)[#e.subtitle#if e.meta != "" [, #maybe-link(e.link, e.meta)]] }
        #place(top + left, dx: -o.date-col, block(width: o.date-col - 3mm, text(fill: ink2, size: st.size * 0.9pt, e.date)))
      ]
    } else {
      entry-head(e, st)
    }
    let pad-left = if o.entry == "date-gutter" { o.date-col } else { 0pt }
    if e.detail != "" { block(above: st.leading * 0.9em, pad(left: pad-left, e.detail)) }
    if e.bullets.len() > 0 { block(above: st.leading * 1em, pad(left: pad-left, bullets(e))) }
  }

  let skills-block(s) = {
    if o.skills == "grid" {
      grid(columns: (1fr, 1fr), column-gutter: 1.2em, row-gutter: st.leading * 1.2em,
        ..s.groups.map(g => [#if g.label != "" [#text(weight: 600, g.label) \ ]#keep-slashes(g.items)]))
    } else if o.skills == "inline" {
      s.groups.map(g => [#if g.label != "" [#text(weight: 600, g.label): ]#keep-slashes(g.items)]).join([#h(0.5em)·#h(0.5em)])
    } else { skill-lines(s, st) }
  }

  let body(s) = {
    if s.kind == "skills" { skills-block(s) }
    else if s.kind == "pairs" { pair-lines(s, st) }
    else {
      for (i, e) in s.entries.enumerate() {
        block(above: if i == 0 { 0pt } else { st.gap * 9pt }, breakable: true, entry(e))
      }
    }
  }

  let section(s) = {
    if o.heading == "side" {
      block(above: st.gap * 12pt, breakable: true, grid(columns: (o.gutter, 1fr), column-gutter: 4mm,
        text(font: head-font, size: st.size * 0.92pt, weight: 700, fill: accent, s.title), body(s)))
    } else {
      heading(s.title)
      body(s)
    }
  }

  let indent = 0pt
  // A plain-text pseudo section for the summary.
  let section-or-text(s) = if s.kind == "text" {
    if o.heading == "side" {
      block(above: st.gap * 12pt, grid(columns: (o.gutter, 1fr), column-gutter: 4mm, text(font: head-font, size: st.size * 0.92pt, weight: 700, fill: accent, s.title), s.text))
    } else { heading(s.title); s.text }
  } else { section(s) }

  let main-flow(sections) = pad(left: indent, {
    if m.doc.summary != "" {
      if o.summary-label == none { block(above: st.gap * 11pt, text(size: st.size * 1.05pt, m.doc.summary)) }
      else { section-or-text((kind: "text", title: o.summary-label, text: m.doc.summary)) }
    }
    for s in sections { section(s) }
  })

  if o.layout == "single" {
    main-flow(m.doc.sections)
  } else {
    // Two columns: the main column is always first in the text, wherever it sits on the page.
    let side-kinds = ("skills", "languages", "certifications", "awards")
    let main = m.doc.sections.filter(s => s.type not in side-kinds)
    let side = m.doc.sections.filter(s => s.type in side-kinds)
    let side-col = { for s in side { section(s) } }
    if o.layout == "side-right" {
      grid(columns: (1fr, o.side-width), column-gutter: 7mm, main-flow(main), side-col)
    } else {
      grid(columns: (o.side-width, 1fr), column-gutter: 7mm,
        grid.cell(x: 1, y: 0, main-flow(main)),
        grid.cell(x: 0, y: 0, side-col))
    }
  }
}
