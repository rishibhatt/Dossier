"use client"

import { useId, useState } from "react"
import { Copy } from "lucide-react"

import { SocialIcon } from "@/components/portfolio/sections/SocialIcon"
import { LINKEDIN_POST_LIMIT, linkedInComposeUrl, postDraft, type PostTone, type ShareFacts } from "@/features/studio/share/postDraft"
import { copyText } from "@/features/studio/studioActions"

const TONES: { id: PostTone; label: string }[] = [
  { id: "open", label: "Open to work" },
  { id: "share", label: "Just sharing" },
]

/**
 * The drafted LinkedIn post, editable in place. "Open LinkedIn" opens the composer with the text filled in and
 * also copies it, because LinkedIn drops the text when it has to ask the person to sign in first.
 */
export function LinkedInComposer({ url, facts, onPost }: { url: string; facts: ShareFacts; onPost: (tone: PostTone, edited: boolean) => void }) {
  const [tone, setTone] = useState<PostTone>("open")
  const [text, setText] = useState(() => postDraft(url, facts, "open"))
  const [edited, setEdited] = useState(false)
  const id = useId()
  const over = text.length > LINKEDIN_POST_LIMIT

  function pickTone(next: PostTone) {
    setTone(next)
    // A new tone replaces the draft only while it is still ours; their own edits are never thrown away.
    if (!edited) setText(postDraft(url, facts, next))
  }

  async function open() {
    onPost(tone, edited)
    await copyText(text, "Post copied too, in case LinkedIn asks you to sign in first.")
    window.open(linkedInComposeUrl(text), "_blank", "noopener,noreferrer")
  }

  return (
    <div className="mt-2.5 grid gap-2.5 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-2.5 [border-radius:4px] @[18rem]:p-3">
      <div role="radiogroup" aria-label="Kind of post" className="flex flex-wrap gap-1.5">
        {TONES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={tone === t.id}
            onClick={() => pickTone(t.id)}
            className="inline-flex min-h-9 items-center border px-3 text-xs font-medium transition-colors [border-radius:4px] aria-checked:border-[var(--site-ink)] aria-checked:bg-[var(--site-ink)] aria-checked:text-[var(--site-paper)] aria-[checked=false]:border-[var(--site-rule-strong)] aria-[checked=false]:hover:border-[var(--site-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-accent-ink)]"
          >
            {t.label}
          </button>
        ))}
      </div>
      <label htmlFor={id} className="sr-only">
        Your LinkedIn post
      </label>
      <textarea
        id={id}
        value={text}
        rows={9}
        onChange={(e) => (setText(e.target.value), setEdited(true))}
        aria-invalid={over || undefined}
        className="sp-field min-h-[12rem] w-full resize-y !text-sm !leading-relaxed"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`sp-data sp-no ${over ? "!text-[var(--site-danger)]" : ""}`}>
          {text.length.toLocaleString()} / {LINKEDIN_POST_LIMIT.toLocaleString()}
        </p>
        {edited ? (
          <button type="button" onClick={() => (setText(postDraft(url, facts, tone)), setEdited(false))} className="text-xs underline underline-offset-2">
            Reset to our draft
          </button>
        ) : null}
      </div>
      <div className="grid gap-2 @[22rem]:grid-cols-2">
        <button type="button" onClick={() => void open()} disabled={over || !text.trim()} className="site-btn site-btn-primary site-btn-sm">
          <SocialIcon platform="linkedin" className="size-4" />
          <span className="site-btn-label">Open LinkedIn</span>
        </button>
        <button type="button" onClick={() => void copyText(text, "Post copied")} className="site-btn site-btn-ghost site-btn-sm">
          <Copy className="size-4" aria-hidden />
          <span className="site-btn-label">Copy text</span>
        </button>
      </div>
    </div>
  )
}
