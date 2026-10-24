// R-034 Notebook. Crimson Text with sentence-case heads and dash bullets; reads like a well-edited page.
#import "kit.typ": *

#render(load(), (
  font: "Crimson Text",
  heading: "plain",
  marker: [–],
  head-scale: 1.05,
))
