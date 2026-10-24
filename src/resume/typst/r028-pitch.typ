// R-028 Pitch. A shaded header band, accent underlines on sentence-case heads, and skills on one line so results lead.
#import "kit.typ": *

#render(load(), (
  font: "Lato",
  header: "banner",
  heading: "accent-underline",
  skills: "inline",
))
