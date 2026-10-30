// R-008 Fresher. For students and first jobs: name left with contact stacked on the right, headings in the
// accent with a short bar, and room for coursework, projects and activities. Put Education first in the form.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Inter")

#let heading(title) = block(above: st.gap * 13pt, below: st.gap * 6pt, sticky: true)[
  #grid(
    columns: (auto, auto),
    column-gutter: 0.5em,
    align: horizon,
    rect(width: 2.2mm, height: 2.2mm, fill: accent, stroke: none),
    text(size: st.size * 1.08pt, weight: 700, title),
  )
]

#grid(
  columns: (1fr, auto),
  column-gutter: 1.2em,
  align: (left + horizon, right + horizon),
  [
    #text(size: st.size * 2.3pt, weight: 700, tracking: -0.02em, m.doc.name)
    #if m.doc.headline != "" { block(above: st.leading * 1em, text(size: st.size * 1.1pt, fill: accent, weight: 600, m.doc.headline)) }
  ],
  text(size: st.size * 0.92pt, m.doc.contact.map(c => maybe-link(c.url, c.text)).join(linebreak())),
)
#if m.doc.personal.len() > 0 {
  block(above: st.leading * 0.8em, text(size: st.size * 0.92pt, fill: ink2, personal-line(m.doc.personal)))
}
#v(st.gap * 2pt)
#line(length: 100%, stroke: 0.6pt + rule-color)

#if m.doc.summary != "" {
  heading("Objective")
  m.doc.summary
}

#for s in m.doc.sections {
  heading(s.title)
  if s.kind == "skills" { skill-lines(s, st) }
  else if s.kind == "pairs" { pair-lines(s, st) }
  else {
    for e in s.entries {
      block(below: st.gap * 9pt, breakable: true)[
        #entry-head(e, st)
        #entry-body(e, st)
      ]
    }
  }
}
