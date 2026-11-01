"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Check, FileText, Loader2, Mail, MessageCircle, QrCode, Star } from "lucide-react"

import { SocialIcon } from "@/components/portfolio/sections/SocialIcon"
import { LinkedInComposer } from "@/features/studio/share/LinkedInComposer"
import { shareFacts, signature, type ShareFacts } from "@/features/studio/share/postDraft"
import { QrPreview } from "@/features/studio/share/QrPreview"
import { addPortfolioLinkToResume, type ResumeLinkResult } from "@/features/studio/share/resumeLink"
import { copyText, persistNow } from "@/features/studio/studioActions"
import { track } from "@/lib/analytics/track"
import { ROUTES } from "@/lib/constants/routes"
import { usePortfolioStore } from "@/store/usePortfolioStore"

export type ShareSource = "publish_dialog" | "share_panel" | "dashboard"

/** Facts about the person from the portfolio open in the studio. The dashboard passes its own instead. */
export function useStudioShareFacts(): ShareFacts {
  // The document, not a derived object: a fresh object per store read would re-render forever.
  const doc = usePortfolioStore((s) => s.document)
  return useMemo(() => shareFacts(doc), [doc])
}

function Step({ n, title, hint, children }: { n: number; title: string; hint: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-t border-[var(--site-rule)] py-3 first:border-t-0 first:pt-0">
      <span className="site-mono grid size-7 place-items-center rounded-full border border-[var(--site-rule-strong)] text-xs" aria-hidden>
        {n}
      </span>
      {/* A container, not the viewport, decides the layout: the same steps sit in a ~300px panel and a wider dialog. */}
      <div className="@container min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--site-ink-2)]">{hint}</p>
        <div className="mt-2.5">{children}</div>
      </div>
    </li>
  )
}

const toggle = "site-btn site-btn-ghost site-btn-sm min-w-0 aria-expanded:border-[var(--site-ink)] aria-expanded:bg-[var(--site-sheet)]"
const quiet = "site-btn site-btn-quiet site-btn-sm min-w-0 !justify-start !px-2.5 aria-expanded:bg-[var(--site-sheet)]"

/**
 * "Put it where recruiters look": resume header, LinkedIn, then anywhere else. Shown in the first-publish
 * dialog and kept in the Share panel, so a person who closed the dialog can still do it later.
 */
export function ShareSteps({ url, source, facts }: { url: string; source: ShareSource; facts: ShareFacts }) {
  const [resume, setResume] = useState<"idle" | "loading" | ResumeLinkResult>("idle")
  const [linkedIn, setLinkedIn] = useState<"none" | "post" | "featured">("none")
  const [showQr, setShowQr] = useState(false)
  const clicked = (channel: string, extra: Record<string, string | boolean> = {}) => track("share_click", { channel, source, ...extra })

  async function addToResume() {
    setResume("loading")
    clicked("resume")
    setResume(await addPortfolioLinkToResume(url).catch((): ResumeLinkResult => ({ ok: false, reason: "no_resume" })))
  }

  function openLinkedIn(next: "post" | "featured") {
    const opening = linkedIn !== next
    setLinkedIn(opening ? next : "none")
    if (!opening) return
    clicked(next === "post" ? "linkedin_compose" : "linkedin_featured")
    if (next === "featured") void copyText(url)
  }

  return (
    <ol className="grid">
      <Step n={1} title="Add it to your resume" hint="Recruiters who open your PDF get one click to your work.">
        {resume === "idle" || resume === "loading" ? (
          <button type="button" onClick={() => void addToResume()} disabled={resume === "loading"} className="site-btn site-btn-ghost site-btn-sm w-full @[22rem]:w-auto">
            {resume === "loading" ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <FileText className="size-4" aria-hidden />}
            <span className="site-btn-label">Add to my resume</span>
          </button>
        ) : resume.ok ? (
          <p role="status" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <Check className="size-4 shrink-0 text-[var(--site-ok)]" aria-hidden />
            <span>{resume.already ? "Already on" : "Added to"} &ldquo;{resume.title}&rdquo;.</span>
            <Link href={`${ROUTES.resumeEdit}?id=${encodeURIComponent(resume.draftId)}`} onClick={() => persistNow()} className="underline underline-offset-4">
              Open resume
            </Link>
          </p>
        ) : resume.reason === "full" ? (
          <p role="status" className="text-sm text-[var(--site-ink-2)]">
            Your resume already has 6 links. Remove one in the resume editor, then try again.
          </p>
        ) : (
          <p role="status" className="text-sm text-[var(--site-ink-2)]">
            No resume yet.{" "}
            <Link href={ROUTES.resumeNew} onClick={() => persistNow()} className="underline underline-offset-4">
              Make one free
            </Link>{" "}
            and add this link to its header.
          </p>
        )}
      </Step>

      <Step n={2} title="Put it on LinkedIn" hint="A post reaches your network. Featured keeps the link on your profile.">
        <div className="grid gap-2 @[22rem]:grid-cols-2">
          <button type="button" onClick={() => openLinkedIn("post")} aria-expanded={linkedIn === "post"} className={toggle}>
            <SocialIcon platform="linkedin" className="size-4 shrink-0" />
            <span className="site-btn-label min-w-0 truncate">Write a post</span>
          </button>
          <button type="button" onClick={() => openLinkedIn("featured")} aria-expanded={linkedIn === "featured"} className={toggle}>
            <Star className="size-4 shrink-0" aria-hidden />
            <span className="site-btn-label min-w-0 truncate">Add to Featured</span>
          </button>
        </div>
        {linkedIn === "post" ? <LinkedInComposer key={url} url={url} facts={facts} onPost={(tone, edited) => clicked("linkedin_post", { tone, edited })} /> : null}
        {linkedIn === "featured" ? (
          <ol className="mt-2.5 list-decimal space-y-1 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] py-3 pl-8 pr-3 text-xs text-[var(--site-ink-2)] [border-radius:4px]">
            <li>
              Open{" "}
              <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                your LinkedIn profile
              </a>
              .
            </li>
            <li>Choose Add section, then Add featured, then Add a link.</li>
            <li>Paste your link (it is already copied) and save.</li>
          </ol>
        ) : null}
      </Step>

      <Step n={3} title="Send it anywhere" hint="Messages, your email signature, or a QR code for printed CVs.">
        <div className="grid grid-cols-1 gap-2 @[15rem]:grid-cols-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(`My portfolio: ${url}`)}`} target="_blank" rel="noopener noreferrer" onClick={() => clicked("whatsapp")} className={quiet}>
            <MessageCircle className="size-4 shrink-0" aria-hidden />
            <span className="site-btn-label min-w-0 truncate">WhatsApp</span>
          </a>
          <a
            href={`https://x.com/intent/post?text=${encodeURIComponent("My portfolio is live:")}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => clicked("x")}
            className={quiet}
          >
            <SocialIcon platform="x" className="size-4 shrink-0" />
            <span className="site-btn-label min-w-0 truncate">Post on X</span>
          </a>
          <button type="button" onClick={() => (clicked("signature"), void copyText(signature(url, facts), "Signature copied. Paste it into your email settings."))} className={quiet}>
            <Mail className="size-4 shrink-0" aria-hidden />
            <span className="site-btn-label min-w-0 truncate">Signature</span>
          </button>
          <button type="button" onClick={() => (setShowQr((v) => !v), showQr || clicked("qr_preview"))} aria-expanded={showQr} className={quiet}>
            <QrCode className="size-4 shrink-0" aria-hidden />
            <span className="site-btn-label min-w-0 truncate">QR code</span>
          </button>
        </div>
        {showQr ? <QrPreview url={url} onDownload={(format) => clicked("qr", { format })} /> : null}
      </Step>
    </ol>
  )
}
