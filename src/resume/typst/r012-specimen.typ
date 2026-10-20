// R-012 Specimen. For designers and creative roles: the name set large in Bricolage Grotesque, section heads
// in the same face, body in Inter. Still one column and one text flow; the character is all in the type.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Inter")

#let display = "Bricolage Grotesque"

#let heading(title) = block(above: st.gap * 15pt, below: st.gap * 6pt, width: 100%, sticky: true)[
  #text(font: display, size: st.size * 1.35pt, weight: 600, tracking: -0.01em, fill: accent, title)
]

#text(font: display, size: st.size * 3.4pt, weight: 700, tracking: -0.035em, m.doc.name)
#if m.doc.headline != "" {
  block(above: st.leading * 1.1em, text(size: st.size * 1.2pt, m.doc.headline))
}
#if m.doc.contact.len() > 0 {
  block(above: st.leading * 1.3em, text(size: st.size * 0.95pt, fill: ink2, contact-line(m.doc.contact, sep: [#h(0.8em)])))
}
#if m.doc.personal.len() > 0 {
  block(above: st.leading * 0.8em, text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal)))
}
#v(st.gap * 4pt)
#line(length: 100%, stroke: 1.5pt + accent)

#if m.doc.summary != "" {
  block(above: st.gap * 12pt, text(size: st.size * 1.1pt, m.doc.summary))
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
