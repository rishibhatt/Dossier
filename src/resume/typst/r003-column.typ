// R-003 Column. Header across the page, then a main column and a narrow side column for skills and languages.
// The main column is first in source order, so parsers read experience before the sidebar.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Inter")

#let side-kinds = ("skills", "languages", "certifications", "awards")
#let main = m.doc.sections.filter(s => s.type not in side-kinds)
#let side = m.doc.sections.filter(s => s.type in side-kinds)

#let heading(title, size: 1) = block(above: st.gap * 13pt, below: st.gap * 6pt)[
  #text(size: st.size * 1.05pt * size, weight: 700, fill: accent, title)
]

#let render(s, compact: false) = {
  heading(s.title)
  if s.kind == "skills" {
    for g in s.groups {
      block(below: st.leading * 1.3em)[
        #if g.label != "" { block(below: st.leading * 0.8em, text(weight: 600, g.label)) }
        #text(fill: ink2, keep-slashes(g.items))
      ]
    }
  } else if s.kind == "pairs" { pair-lines(s, st) }
  else {
    for e in s.entries {
      block(below: st.gap * 9pt, breakable: true)[
        #if compact [
          #text(weight: 600, maybe-link(e.link, e.title))
          #if e.subtitle != "" { linebreak(); text(fill: ink2, e.subtitle) }
          #if e.date != "" { linebreak(); text(fill: ink2, e.date) }
          #if e.detail != "" { linebreak(); e.detail }
        ] else [
          #entry-head(e, st)
          #entry-body(e, st)
        ]
      ]
    }
  }
}

#text(size: st.size * 2.4pt, weight: 700, tracking: -0.02em, m.doc.name)
#if m.doc.headline != "" {
  block(above: st.leading * 1em, text(size: st.size * 1.2pt, fill: accent, weight: 600, m.doc.headline))
}
#if m.doc.contact.len() > 0 {
  block(above: st.leading * 1.3em, text(size: st.size * 0.95pt, contact-line(m.doc.contact)))
}
#if m.doc.personal.len() > 0 {
  block(above: st.leading * 0.8em, text(size: st.size * 0.95pt, fill: ink2, personal-line(m.doc.personal)))
}
#line(length: 100%, stroke: 0.6pt + rule-color)

#grid(
  columns: (1fr, 30%),
  column-gutter: 7mm,
  [
    #if m.doc.summary != "" {
      heading("Summary")
      m.doc.summary
    }
    #for s in main { render(s) }
  ],
  [
    #for s in side { render(s, compact: true) }
  ],
)
