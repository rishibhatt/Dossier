// R-002 Plain. Dense serif page, centred name, small-caps heads over a full rule, right-aligned dates.
// The engineering and student pattern: everything on one page, nothing decorative.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Source Serif 4")

#let heading(title) = block(above: st.gap * 12pt, below: st.gap * 6pt, width: 100%)[
  #text(size: st.size * 1.18pt, weight: 600, fill: accent, smallcaps(title))
  #v(-0.55em)
  #line(length: 100%, stroke: 0.7pt + ink)
]

#align(center)[
  #text(size: st.size * 2.4pt, weight: 700, m.doc.name)
  #if m.doc.headline != "" {
    block(above: st.leading * 0.9em, text(size: st.size * 1.05pt, m.doc.headline))
  }
  #if m.doc.contact.len() > 0 {
    block(above: st.leading * 1.1em, text(size: st.size * 0.95pt, contact-line(m.doc.contact, sep: [#h(0.5em)|#h(0.5em)])))
  }
  #if m.doc.personal.len() > 0 {
    block(above: st.leading * 0.7em, text(size: st.size * 0.95pt, personal-line(m.doc.personal, sep: [#h(0.5em)|#h(0.5em)])))
  }
]

#if m.doc.summary != "" {
  heading("Summary")
  m.doc.summary
}

#for s in m.doc.sections {
  heading(s.title)
  if s.kind == "skills" { skill-lines(s, st, label-weight: 700) }
  else if s.kind == "pairs" { pair-lines(s, st) }
  else {
    // Organisation leads for jobs and schools: "Company ...... Location", then "Role ...... Dates".
    let org-first = s.type in ("experience", "volunteering", "education")
    for e in s.entries {
      let lead = if org-first and e.subtitle != "" { e.subtitle } else { e.title }
      let second = if org-first and e.subtitle != "" { e.title } else { e.subtitle }
      block(below: st.gap * 8pt, breakable: true)[
        #grid(
          columns: (1fr, auto),
          column-gutter: 1em,
          row-gutter: st.leading * 0.9em,
          text(weight: 700, maybe-link(e.link, lead)),
          align(right, if second != "" { e.meta } else { e.date }),
          ..if second != "" { (emph(second), align(right, emph(e.date))) } else { () },
        )
        #entry-body(e, st)
      ]
    }
  }
}
