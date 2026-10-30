// Dossier resume library. Every template imports this.
// Rules (checked by scripts/resume/verify.mjs):
// - Data comes only from sys.inputs.data (JSON built by src/lib/resume/renderModel.ts). Strings from JSON render
//   as literal text, so user input can never become Typst markup. No eval, no package imports.
// - Main content comes first in source order so text extracts in reading order. Contact sits in the body,
//   never in a page header or footer. Ligatures are off for weaker parsers.

#let ink = rgb("#101114")
#let ink2 = rgb("#4f5562")
#let rule-color = rgb("#c9c6bd")

#let load() = json(bytes(sys.inputs.at("data")))

// Page, text and metadata setup. Used as `#show: page-setup.with(m, font: "Inter")`.
#let page-setup(m, font: "Inter", body) = {
  let st = m.style
  set document(title: m.meta.title, author: m.meta.author, keywords: m.meta.keywords, date: none)
  set page(paper: st.paper, margin: st.margin * 1mm)
  set text(font: font, size: st.size * 1pt, ligatures: false, lang: "en", fill: ink, hyphenate: false)
  set par(leading: st.leading * 1em, spacing: st.leading * 1.6em)
  set list(marker: [•], indent: 0.1em, body-indent: 0.6em, spacing: st.leading * 1em)
  show link: it => it
  body
}

#let gap(st, k: 1) = v(st.gap * k * 7pt)

#let maybe-link(url, body) = if url != "" { link(url, body) } else { body }

// Each item is a box, so a line wraps between items and never inside an email or URL (a split URL reads
// back as two words).
#let contact-line(items, sep: [#h(0.45em)·#h(0.45em)]) = items.map(c => box(maybe-link(c.url, c.text))).join(sep)

#let personal-line(items, sep: [#h(0.45em)·#h(0.45em)]) = items.map(p => [#p.label: #p.value]).join(sep)

#let bullets(e) = if e.bullets.len() > 0 {
  list(..e.bullets.map(b => b.text))
}

// Words joined by a slash ("A/B testing", "CI/CD") stay on one line: a break after the slash reads back as
// two words.
#let keep-slashes(body) = {
  show regex("\S+/\S+"): it => box(it)
  body
}

// Skills as "Group: a, b, c" lines; a group without a label prints only its items.
#let skill-lines(s, st, label-weight: 600) = {
  for g in s.groups {
    block(below: st.leading * 1em)[
      #if g.label != "" [#text(weight: label-weight, g.label): ]#keep-slashes(g.items)
    ]
  }
}

#let pair-lines(s, st, sep: [ – ]) = {
  for p in s.pairs {
    block(below: st.leading * 1em)[#text(weight: 600, p.label)#if p.value != "" [#sep#p.value]]
  }
}

// Two-line entry header: title and date on the first line, subtitle and meta on the second.
#let entry-head(e, st, title-weight: 700, date-fill: ink2, sub-fill: ink2) = {
  grid(
    columns: (1fr, auto),
    column-gutter: 1em,
    row-gutter: st.leading * 0.9em,
    text(weight: title-weight, maybe-link(e.link, e.title)),
    align(right, text(fill: date-fill, e.date)),
    ..if e.subtitle != "" or e.meta != "" {
      (
        text(fill: sub-fill, maybe-link(e.link, e.subtitle)),
        align(right, text(fill: sub-fill, maybe-link(e.link, e.meta))),
      )
    } else { () },
  )
}

#let entry-body(e, st) = {
  if e.detail != "" { block(above: st.leading * 0.9em, e.detail) }
  if e.bullets.len() > 0 { block(above: st.leading * 1em, bullets(e)) }
}
