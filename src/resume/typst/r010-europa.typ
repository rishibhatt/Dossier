// R-010 Europa. A4 European CV: labels in a right-aligned grey column with a hairline, content on the right,
// personal details as a line under the name, and languages as a small CEFR table. One row per section.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Inter")

#let label-w = 27%

#let row(title, body) = block(above: st.gap * 12pt, breakable: true, grid(
  columns: (label-w, 1fr),
  column-gutter: 0pt,
  inset: (x: 0pt, y: 0pt),
  align(right, pad(right: 4mm, text(size: st.size * 0.95pt, weight: 600, fill: accent, upper(title)))),
  pad(left: 4mm, body),
))

#grid(
  columns: (label-w, 1fr),
  [],
  pad(left: 4mm)[
    #text(size: st.size * 2.4pt, weight: 700, tracking: -0.02em, m.doc.name)
    #if m.doc.headline != "" { block(above: st.leading * 1em, text(size: st.size * 1.15pt, fill: ink2, m.doc.headline)) }
    #if m.doc.contact.len() > 0 { block(above: st.leading * 1.2em, text(size: st.size * 0.95pt, contact-line(m.doc.contact))) }
    #if m.doc.personal.len() > 0 { block(above: st.leading * 0.8em, text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal))) }
  ],
)
#v(st.gap * 4pt)
#line(length: 100%, stroke: 0.5pt + rule-color)

#if m.doc.summary != "" { row("Profile", m.doc.summary) }

#for s in m.doc.sections {
  row(s.title, {
    if s.kind == "skills" { skill-lines(s, st) }
    else if s.kind == "pairs" {
      // Languages: name, then the level (CEFR A1 to C2 or "Native"), one row each.
      grid(
        columns: (auto, 1fr),
        column-gutter: 1.5em,
        row-gutter: st.leading * 1em,
        ..s.pairs.map(p => (text(weight: 600, p.label), text(fill: ink2, if p.value != "" { p.value } else { "" }))).flatten(),
      )
    } else {
      for (i, e) in s.entries.enumerate() {
        block(above: if i == 0 { 0pt } else { st.gap * 10pt }, breakable: true)[
          #entry-head(e, st)
          #entry-body(e, st)
        ]
      }
    }
  })
}
