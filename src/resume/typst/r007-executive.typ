// R-007 Executive. Two pages for a long career: a large name, the summary set as a lead paragraph under a
// double rule, then spaced small-caps section heads. Achievements read first because the summary leads.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Source Serif 4")

#let heading(title) = block(above: st.gap * 16pt, below: st.gap * 8pt, width: 100%, sticky: true)[
  #text(size: st.size * 0.95pt, weight: 600, tracking: 0.07em, fill: accent, upper(title))
  #v(-0.45em)
  #line(length: 100%, stroke: 0.5pt + ink)
]

#align(center)[
  #text(size: st.size * 2.6pt, weight: 700, tracking: 0.02em, m.doc.name)
  #if m.doc.headline != "" {
    block(above: st.leading * 1.1em, text(size: st.size * 1.15pt, tracking: 0.04em, upper(m.doc.headline)))
  }
  #if m.doc.contact.len() > 0 {
    block(above: st.leading * 1.2em, text(size: st.size * 0.95pt, contact-line(m.doc.contact, sep: [#h(0.6em)|#h(0.6em)])))
  }
  #if m.doc.personal.len() > 0 {
    block(above: st.leading * 0.8em, text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal)))
  }
]
#v(st.gap * 6pt)
#line(length: 100%, stroke: 1.2pt + ink)
#v(-0.7em)
#line(length: 100%, stroke: 0.4pt + ink)

#if m.doc.summary != "" {
  block(above: st.gap * 10pt, text(size: st.size * 1.08pt, m.doc.summary))
}

#for s in m.doc.sections {
  heading(s.title)
  if s.kind == "skills" { skill-lines(s, st) }
  else if s.kind == "pairs" { pair-lines(s, st) }
  else {
    for e in s.entries {
      block(below: st.gap * 11pt, breakable: true)[
        #entry-head(e, st, sub-fill: ink)
        #entry-body(e, st)
      ]
    }
  }
}
