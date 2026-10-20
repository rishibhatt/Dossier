// R-005 Compact. A long history on one page: tight margins, small caps heads, and each role on one line
// ("Title, Company" then the dates at the right edge), bullets close under it. Still one text flow.
#import "lib.typ": *

#let m = load()
#let st = m.style
#let accent = rgb(st.accent)
#show: page-setup.with(m, font: "Inter")
#set par(leading: st.leading * 0.9em)

#let heading(title) = block(above: st.gap * 10pt, below: st.gap * 5pt, width: 100%, sticky: true)[
  #grid(
    columns: (auto, 1fr),
    column-gutter: 0.6em,
    align: horizon,
    text(size: st.size * 0.9pt, weight: 700, tracking: 0.06em, fill: accent, upper(title)),
    line(length: 100%, stroke: 0.5pt + rule-color),
  )
]

#grid(
  columns: (1fr, auto),
  column-gutter: 1em,
  align: (left + bottom, right + bottom),
  [
    #text(size: st.size * 2pt, weight: 700, tracking: -0.02em, m.doc.name)
    #if m.doc.headline != "" { linebreak(); text(size: st.size * 1.05pt, fill: ink2, m.doc.headline) }
  ],
  text(size: st.size * 0.92pt, m.doc.contact.map(c => maybe-link(c.url, c.text)).join(linebreak())),
)
#if m.doc.personal.len() > 0 {
  block(above: st.leading * 0.8em, text(size: st.size * 0.92pt, fill: ink2, personal-line(m.doc.personal)))
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
      block(below: st.gap * 7pt, breakable: true)[
        #grid(
          columns: (1fr, auto),
          column-gutter: 1em,
          [#text(weight: 700, maybe-link(e.link, e.title))#if e.subtitle != "" [, #e.subtitle]#if e.meta != "" [#text(fill: ink2)[, #e.meta]]],
          align(right, text(fill: ink2, e.date)),
        )
        #if e.detail != "" { block(above: st.leading * 0.7em, e.detail) }
        #if e.bullets.len() > 0 { block(above: st.leading * 0.8em, bullets(e)) }
      ]
    }
  }
}
