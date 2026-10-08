import { notFound } from "next/navigation"

import { DevStudio } from "@/app/dev/studio/dev-studio"

/** Dev-only: opens the studio with a sample portfolio, so the editor can be checked without uploading a PDF. */
export default function DevStudioPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <main className="workspace-redesign site">
      <DevStudio />
    </main>
  )
}
