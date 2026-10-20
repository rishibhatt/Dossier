import type { Metadata } from "next"
import { Suspense } from "react"

import { ResumeEditor } from "@/features/resume/editor/ResumeEditor"

export const metadata: Metadata = { title: "Resume editor | Dossier" }

export default function ResumeEditPage() {
  // The editor reads ?id from the URL on the client; Suspense lets the shell render without it.
  return (
    <Suspense fallback={null}>
      <ResumeEditor />
    </Suspense>
  )
}
