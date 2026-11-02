import type { Metadata } from "next"

import { LetterStartScreen } from "@/features/cover-letter/editor/LetterStartScreen"

export const metadata: Metadata = {
  title: "New cover letter | Dossier",
  description: "Start a cover letter from your resume and the job ad, or begin blank. Free to write and download.",
}

export default function NewCoverLetterPage() {
  return <LetterStartScreen />
}
