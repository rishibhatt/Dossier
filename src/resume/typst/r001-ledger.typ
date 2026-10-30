// R-001 Ledger. One column, Inter, uppercase section heads over a hairline. The safest layout for any ATS.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Inter")

#let heading(title) = block(above: st.gap * 14pt, below: st.gap * 7pt, width: 100%)[
  #text(size: st.size * 0.92pt, weight: 700, tracking: 0.08em, fill: accent, upper(title))
  #v(-0.5em)
  #line(length: 100%, stroke: 0.6pt + rule-color)
]

#text(size: st.size * 2.3pt, weight: 700, tracking: -0.02em, m.doc.name)
#if m.doc.headline != "" {
  block(above: st.leading * 1em, text(size: st.size * 1.15pt, fill: ink2, m.doc.headline))
}
#if m.doc.contact.len() > 0 {
  block(above: st.leading * 1.3em, text(size: st.size * 0.95pt, contact-line(m.doc.contact)))
}
#if m.doc.personal.len() > 0 {
  block(above: st.leading * 0.8em, text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal)))
}

#if m.doc.summary != "" {
  heading("Summary")
  m.doc.summary
}

#for s in m.doc.sections {
  heading(s.title)
  if s.kind == "skills" { skill-lines(s, st) }
  else if s.kind == "pairs" { pair-lines(s, st) }
  else {
    for e in s.entries {
      block(below: st.gap * 10pt, breakable: true)[
        #entry-head(e, st)
        #entry-body(e, st)
      ]
    }
  }
}
