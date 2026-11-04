"use client"

import { useId, useState } from "react"
import { Check } from "lucide-react"

import { SocialIcon } from "@/components/portfolio/sections/SocialIcon"
import { ALL_SOCIAL_PLATFORMS, linkPlatform, normaliseSocial, socialLabel, socialNeedsLink, socialPlaceholder, type SocialPlatform } from "@/lib/portfolio/links"
import { GROUP_SOCIALS, portfolioGroup } from "@/lib/portfolio/professions"
import { usePortfolioStore } from "@/store/usePortfolioStore"

const sameLink = (a: string, b: string) => a.trim().toLowerCase().replace(/\/+$/, "") === b.trim().toLowerCase().replace(/\/+$/, "")

/**
 * One tap per platform, then a username or a pasted link. Whatever is typed is turned into a full
 * profile URL before it joins the Contact links, so the page never shows a bare handle.
 */
export function SocialQuickAdd({ links, onAdd }: { links: string[]; onAdd: (url: string) => void }) {
  const id = useId()
  const [active, setActive] = useState<SocialPlatform | null>(null)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [more, setMore] = useState(false)
  const present = new Set(links.map(linkPlatform))
  const group = usePortfolioStore((s) => portfolioGroup(s.document?.portfolioMeta))
  const first = GROUP_SOCIALS[group]
  const shown = more ? [...first, ...ALL_SOCIAL_PLATFORMS.filter((p) => !first.includes(p))] : first

  const pick = (p: SocialPlatform) => {
    setActive(active === p ? null : p)
    setDraft("")
    setError(null)
  }

  const add = () => {
    if (!active) return
    const url = normaliseSocial(active, draft)
    if (!url)
      return setError(
        active === "website"
          ? "That doesn't look like a web address."
          : socialNeedsLink(active)
            ? `Paste the full link to your ${socialLabel(active)} page.`
            : `That doesn't look like a ${socialLabel(active)} username or link.`
      )
    if (links.some((l) => sameLink(l, url))) return setError("That link is already on your page.")
    onAdd(url)
    setActive(null)
    setDraft("")
    setError(null)
  }

  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="sp-label !text-[0.8125rem]">Quick add a profile</legend>
      <div className="flex flex-wrap gap-2">
        {shown.map((p) => {
          const label = socialLabel(p)
          const added = p !== "website" && present.has(p)
          return (
            <button
              key={p}
              type="button"
              aria-pressed={active === p}
              aria-controls={active === p ? `${id}-form` : undefined}
              aria-label={added ? `${label}, added. Add another` : `Add ${label}`}
              onClick={() => pick(p)}
              className="sp-chip !gap-1.5 !px-3"
            >
              <SocialIcon platform={p} className="size-4 shrink-0" />
              {label}
              {added ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
            </button>
          )
        })}
        <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="sp-chip !px-3">
          {more ? "Fewer" : "More"}
        </button>
      </div>
      {active ? (
        <form
          id={`${id}-form`}
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
          className="space-y-1.5"
        >
          <label htmlFor={`${id}-input`} className="sr-only">
            {active === "website" ? "Website address" : socialNeedsLink(active) ? `${socialLabel(active)} link` : `${socialLabel(active)} username or link`}
          </label>
          <div className="flex gap-2">
            <input
              id={`${id}-input`}
              // A fresh field after tapping a platform: focus is the point of the tap.
              autoFocus
              value={draft}
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={socialPlaceholder(active)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => (setDraft(e.target.value), setError(null))}
              className="sp-field min-w-0 flex-1"
            />
            <button type="submit" disabled={!draft.trim()} className="site-btn site-btn-primary site-btn-sm !h-12 shrink-0">
              <span className="site-btn-label">Add</span>
            </button>
          </div>
          {error ? (
            <p id={`${id}-error`} role="alert" className="text-sm text-[var(--site-danger)]">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}
    </fieldset>
  )
}

/** Show or hide the icon row under the hero name. Missing in older documents means on. */
export function HeroSocialToggle({ checked, hasLinks, onChange }: { checked: boolean; hasLinks: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
      <input type="checkbox" className="mt-0.5 size-4 accent-[var(--site-ink)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="font-semibold">Show profile icons under your name</span>
        <span className="block text-[var(--site-ink-2)]">{hasLinks ? "Each web link above becomes an icon at the top of your page." : "Add a profile link to see icons at the top of your page."}</span>
      </span>
    </label>
  )
}
