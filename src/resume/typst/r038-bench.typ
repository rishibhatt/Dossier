// R-038 Bench. IBM Plex Serif with dates in a left column and heads that rule off to the margin.
#import "kit.typ": *

#render(load(), (
  font: "IBM Plex Serif",
  heading: "line-after",
  entry: "date-gutter",
))
