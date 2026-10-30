// R-009 Switcher. A hybrid resume for career changers and returners: the summary and skills sit in a shaded
// panel before the history, so transferable skills are read first. The panel is a plain block, not a text box.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#let panel = rgb("#f3f2ee")
#show: page-setup.with(m, font: "Inter")

#let heading(title) = block(above: st.gap * 13pt, below: st.gap * 6pt, width: 100%, sticky: true)[
  #text(size: st.size * 1.1pt, weight: 700, fill: accent, title)
  #v(-0.55em)
  #line(length: 100%, stroke: 1pt + accent)
]

#let render(s) = {
  heading(s.title)
  if s.kind == "skills" {
    // Skill groups two to a row; cells are emitted row by row, so they still extract in order.
    grid(
      columns: (1fr, 1fr),
      column-gutter: 1.2em,
      row-gutter: st.leading * 1.2em,
      ..s.groups.map(g => [#if g.label != "" [#text(weight: 600, g.label) \ ]#keep-slashes(g.items)]),
    )
  } else if s.kind == "pairs" { pair-lines(s, st) }
  else {
    for e in s.entries {
      block(below: st.gap * 9pt, breakable: true)[
        #entry-head(e, st)
        #entry-body(e, st)
      ]
    }
  }
}

#text(size: st.size * 2.3pt, weight: 700, tracking: -0.02em, m.doc.name)
#if m.doc.headline != "" {
  block(above: st.leading * 1em, text(size: st.size * 1.15pt, fill: accent, weight: 600, m.doc.headline))
}
#if m.doc.contact.len() > 0 {
  block(above: st.leading * 1.2em, text(size: st.size * 0.95pt, contact-line(m.doc.contact)))
}
#if m.doc.personal.len() > 0 {
  block(above: st.leading * 0.8em, text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal)))
}

#if m.doc.summary != "" {
  block(above: st.gap * 12pt, width: 100%, fill: panel, inset: (x: 4mm, y: 3.5mm), radius: 1pt)[
    #text(weight: 700, "Profile") \
    #m.doc.summary
  ]
}

#for s in m.doc.sections { render(s) }
