import { OG_SIZE, specimenCard } from "@/lib/og/specimenCard"

export const alt = "Dossier: your resume, set as a website."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpengraphImage() {
  return specimenCard({
    title: "Your resume, set as a website.",
    running: "Dossier specimens",
    no: "001",
    footnote: "dossier-cv.com",
  })
}
