// R-018 Brief. Name in centred capitals, double-ruled heads, and the firm before the role, as legal CVs are read.
#import "kit.typ": *

#render(load(), (
  font: "Crimson Text",
  header: "center",
  name-upper: true,
  name-tracking: 0.04em,
  heading: "double-rule",
  entry: "org-first",
))
