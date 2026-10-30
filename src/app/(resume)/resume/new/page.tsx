import type { Metadata } from "next"

import { StartScreen } from "@/features/resume/editor/StartScreen"

export const metadata: Metadata = {
  title: "New resume | Dossier",
  description: "Import your old resume, edit a sample or start blank. Free to build and download.",
}

export default function NewResumePage() {
  return <StartScreen />
}
