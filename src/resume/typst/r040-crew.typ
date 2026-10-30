// R-040 Crew. Name in centred capitals, heads that rule off to the margin, and one line per role.
#import "kit.typ": *

#render(load(), (
  font: "Lato",
  header: "center",
  name-upper: true,
  name-tracking: 0.03em,
  heading: "line-after",
  entry: "one-line",
))
