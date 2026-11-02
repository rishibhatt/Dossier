import type { Metadata } from "next"
import { Suspense } from "react"

import { CoverLetterEditor } from "@/features/cover-letter/editor/CoverLetterEditor"

export const metadata: Metadata = { title: "Cover letter editor | Dossier" }

export default function CoverLetterEditPage() {
  // The editor reads ?id and ?download from the URL on the client; Suspense lets the shell render without them.
  return (
    <Suspense fallback={null}>
      <CoverLetterEditor />
    </Suspense>
  )
}
