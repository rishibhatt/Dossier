// R-006 Modern. A short accent bar over the name, section titles in a hanging left gutter, content to the right.
// Each section is one grid row (title cell, then content cell), so it still reads top to bottom.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Inter")

#let gutter = 24%

#let row(title, body) = block(above: st.gap * 12pt, breakable: true, grid(
  columns: (gutter, 1fr),
  column-gutter: 5mm,
  text(size: st.size * 0.95pt, weight: 700, fill: accent, title),
  body,
))

#rect(width: 14mm, height: 1.6mm, fill: accent, stroke: none)
#v(st.gap * 5pt)
#text(size: st.size * 2.6pt, weight: 700, tracking: -0.03em, m.doc.name)
#if m.doc.headline != "" {
  block(above: st.leading * 1em, text(size: st.size * 1.2pt, fill: ink2, m.doc.headline))
}
#if m.doc.contact.len() > 0 {
  block(above: st.leading * 1.4em, text(size: st.size * 0.95pt, contact-line(m.doc.contact, sep: [#h(0.6em)/#h(0.6em)])))
}
#if m.doc.personal.len() > 0 {
  block(above: st.leading * 0.8em, text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal)))
}

#if m.doc.summary != "" { row("Summary", m.doc.summary) }

#for s in m.doc.sections {
  row(s.title, {
    if s.kind == "skills" { skill-lines(s, st) }
    else if s.kind == "pairs" { pair-lines(s, st) }
    else {
      for (i, e) in s.entries.enumerate() {
        block(above: if i == 0 { 0pt } else { st.gap * 10pt }, breakable: true)[
          #entry-head(e, st)
          #entry-body(e, st)
        ]
      }
    }
  })
}
