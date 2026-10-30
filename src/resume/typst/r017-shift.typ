// R-017 Shift. One line per role and headings followed by a rule to the margin; fits many short jobs on one page.
#import "kit.typ": *

#render(load(), (
  font: "Fira Sans",
  heading: "line-after",
  entry: "one-line",
  header: "split",
))
