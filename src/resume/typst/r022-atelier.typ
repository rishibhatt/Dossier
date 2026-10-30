// R-022 Atelier. Bricolage Grotesque name in the accent colour, sentence-case heads, and a right sidebar for tools.
#import "kit.typ": *

#render(load(), (
  font: "Inter",
  head-font: "Bricolage Grotesque",
  layout: "side-right",
  heading: "plain",
  accent-name: true,
))
