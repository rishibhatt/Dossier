// R-004 Scholar. Academic CV: serif throughout, name and contact left, bold section heads over a thin rule,
// publications and talks as a numbered list. Multi-page by design; one text flow, so every page reads in order.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Source Serif 4")

#let heading(title) = block(above: st.gap * 15pt, below: st.gap * 7pt, width: 100%, sticky: true)[
  #text(size: st.size * 1.2pt, weight: 700, fill: accent, title)
  #v(-0.5em)
  #line(length: 100%, stroke: 0.5pt + ink2)
]

#text(size: st.size * 2.2pt, weight: 700, m.doc.name)
#if m.doc.headline != "" {
  block(above: st.leading * 1em, text(size: st.size * 1.1pt, style: "italic", m.doc.headline))
}
#if m.doc.contact.len() > 0 {
  block(above: st.leading * 1.2em, text(size: st.size * 0.95pt, contact-line(m.doc.contact)))
}
#if m.doc.personal.len() > 0 {
  block(above: st.leading * 0.8em, text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal)))
}

#if m.doc.summary != "" {
  heading("Profile")
  m.doc.summary
}

#for s in m.doc.sections {
  heading(s.title)
  if s.kind == "skills" { skill-lines(s, st) }
  else if s.kind == "pairs" { pair-lines(s, st) }
  else if s.type == "publications" {
    // Numbered references: title, venue, year on one entry each. Plain text, so citations copy cleanly.
    for (i, e) in s.entries.enumerate() {
      block(below: st.gap * 7pt, breakable: true, grid(
        columns: (1.8em, 1fr),
        text(fill: ink2, [#(i + 1).]),
        [#text(weight: 600, maybe-link(e.link, e.title))#if e.subtitle != "" [. #emph(e.subtitle)]#if e.date != "" [, #e.date]#if e.detail != "" [. #e.detail]],
      ))
    }
  } else {
    for e in s.entries {
      block(below: st.gap * 9pt, breakable: true)[
        #entry-head(e, st, sub-fill: ink)
        #entry-body(e, st)
      ]
    }
  }
}
