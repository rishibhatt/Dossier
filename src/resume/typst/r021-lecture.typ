// R-021 Lecture. Crimson Text with dates in a left column and the summary set as a lead paragraph without a heading.
#import "kit.typ": *

#render(load(), (
  font: "Crimson Text",
  heading: "bold-rule",
  entry: "date-gutter",
  summary-label: none,
))
