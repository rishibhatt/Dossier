// R-023 Signal. Headings followed by a rule to the margin, dash bullets and skill groups two to a row.
#import "kit.typ": *

#render(load(), (
  font: "Inter",
  heading: "line-after",
  skills: "grid",
  marker: [–],
))
