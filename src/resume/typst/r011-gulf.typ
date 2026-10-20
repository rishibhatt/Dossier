// R-011 Gulf. CV for the UAE, Saudi Arabia and Qatar: centred name, then a personal details block
// (nationality, visa status, date of birth, licence) as a two-column table, then the history.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Inter")

#let heading(title) = block(above: st.gap * 13pt, below: st.gap * 6pt, width: 100%, sticky: true)[
  #block(width: 100%, fill: rgb("#f1f0ec"), inset: (x: 2.5mm, y: 1.6mm))[
    #text(size: st.size * 0.95pt, weight: 700, tracking: 0.06em, fill: accent, upper(title))
  ]
]

#align(center)[
  #text(size: st.size * 2.3pt, weight: 700, tracking: 0.01em, upper(m.doc.name))
  #if m.doc.headline != "" {
    block(above: st.leading * 1em, text(size: st.size * 1.15pt, fill: ink2, m.doc.headline))
  }
  #if m.doc.contact.len() > 0 {
    block(above: st.leading * 1.2em, text(size: st.size * 0.95pt, contact-line(m.doc.contact)))
  }
]

#if m.doc.personal.len() > 0 {
  heading("Personal details")
  grid(
    columns: (auto, 1fr, auto, 1fr),
    column-gutter: 1em,
    row-gutter: st.leading * 1em,
    ..m.doc.personal.map(p => (text(weight: 600, p.label + ":"), p.value)).flatten(),
  )
}

#if m.doc.summary != "" {
  heading("Profile")
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
