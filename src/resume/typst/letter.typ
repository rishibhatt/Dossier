// Dossier cover letter. One file for every template: the masthead options come from the data
// (src/lib/cover-letter/looks.ts, through renderModel.ts), so the letter's header matches the resume set in
// the same template. Same rules as the resumes: data only from sys.inputs.data, every string set as literal
// text, one text flow in reading order (masthead, date and recipient, subject, greeting, paragraphs, sign-off).
// Checked by scripts/cover-letter/verify-letter.ts.
#import "kit.typ": *

#let m = load()
#let l = m.look

#render-letter(m, (
  font: l.font,
  head-font: l.at("head-font"),
  name-font: l.at("name-font"),
  name-scale: l.at("name-scale"),
  name-weight: l.at("name-weight"),
  name-upper: l.at("name-upper"),
  name-tracking: l.at("name-tracking") * 1em,
  header: l.header,
  contact-sep: if l.at("contact-sep") == "pipe" { [#h(0.5em)|#h(0.5em)] } else { [#h(0.45em)·#h(0.45em)] },
  accent-name: l.at("accent-name"),
))
