import type { Metadata } from "next"

import "@/styles/resume.css"

// The builder is an app, not a page to rank: keep it out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function ResumeAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="site rz">{children}</main>
}
