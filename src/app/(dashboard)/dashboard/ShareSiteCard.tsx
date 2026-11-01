"use client"

import { useState } from "react"

import { GalleryOptIn } from "@/features/studio/share/GalleryOptIn"
import { NameLink } from "@/features/studio/share/NameLink"
import type { ShareFacts } from "@/features/studio/share/postDraft"
import { ShareSteps } from "@/features/studio/share/ShareSteps"

/**
 * The share tools on the dashboard, for people who published before the first-publish dialog had them (that
 * dialog shows once) and for anyone coming back to share again. Same parts as the dialog and the Share panel.
 */
export function ShareSiteCard({ origin, path, slug, facts }: { origin: string; path: string; slug: string; facts: ShareFacts }) {
  const [current, setCurrent] = useState(path)
  const url = `${origin}${current}`
  return (
    <section aria-labelledby="share-site-h" className="mt-8 border border-[var(--site-rule-strong)] bg-white">
      <div className="border-b border-[var(--site-rule-strong)] p-5 sm:p-6">
        <h2 id="share-site-h" className="text-xl font-bold tracking-[-0.02em]" style={{ fontFamily: "var(--site-display)" }}>
          Share your site
        </h2>
        <p className="mt-1 max-w-[38rem] text-sm text-[var(--site-ink-2)]">A live page only helps once people see it. Put the link where recruiters look.</p>
      </div>
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <ShareSteps url={url} source="dashboard" facts={facts} />
        <div className="grid content-start gap-5 border-t border-[var(--site-rule)] pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <NameLink url={url} slug={slug} fullName={facts.name} onClaimed={setCurrent} />
          <GalleryOptIn slug={slug} source="dashboard" />
        </div>
      </div>
    </section>
  )
}
