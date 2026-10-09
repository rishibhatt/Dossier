"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { Gift, RefreshCw, Sparkles, X } from "lucide-react"

import { NEW_TEMPLATE_IDS } from "@/config/newTemplates"
import { track } from "@/lib/analytics/track"
import { ROUTES } from "@/lib/constants/routes"

type Latest = { slug: string; updatedAt: string; latestJob: string | null } | null

type Nudge = {
  id: string
  icon: "refresh" | "template" | "gift"
  text: string
  cta: { label: string; href: string }
  /** Days before a dismissed nudge may come back. Infinity = never. */
  snoozeDays: number
}

const STORE_KEY = "dx_nudges_v1"
const SEEN_TEMPLATES_KEY = "dx_seen_templates_v1"
const CHANGE_EVENT = "dx-nudges-change"
const DAY_MS = 24 * 60 * 60 * 1000
const STALE_DAYS = 90

/** Hidden for the rest of this page session even if storage writes are blocked. */
const sessionHiddenIds = new Set<string>()
/** Bumped on every dismissal so the snapshot changes even when storage is blocked. */
let hiddenVersion = 0
const SEP = "\u0000"

type Stored = { dismissed: Record<string, number>; seenTemplates: string[] }

function readRaw(): string {
  try {
    return [hiddenVersion, localStorage.getItem(STORE_KEY) ?? "", localStorage.getItem(SEEN_TEMPLATES_KEY) ?? ""].join(SEP)
  } catch {
    return [hiddenVersion, "", ""].join(SEP)
  }
}

function parse(raw: string): Stored {
  const [, a = "", b = ""] = raw.split(SEP)
  let dismissed: Record<string, number> = {}
  let seenTemplates: string[] = []
  try {
    const d = a ? (JSON.parse(a) as unknown) : {}
    if (d && typeof d === "object" && !Array.isArray(d)) dismissed = d as Record<string, number>
  } catch {
    /* corrupt value: start fresh */
  }
  try {
    const s = b ? (JSON.parse(b) as unknown) : []
    if (Array.isArray(s)) seenTemplates = s.filter((x): x is string => typeof x === "string")
  } catch {
    /* corrupt value: start fresh */
  }
  return { dismissed, seenTemplates }
}

function write(mutate: (s: Stored) => Stored) {
  try {
    const next = mutate(parse(readRaw()))
    localStorage.setItem(STORE_KEY, JSON.stringify(next.dismissed))
    localStorage.setItem(SEEN_TEMPLATES_KEY, JSON.stringify(next.seenTemplates))
  } catch {
    /* Storage blocked: the card just closes for this visit. */
  }
  hiddenVersion += 1
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb)
  window.addEventListener(CHANGE_EVENT, cb)
  return () => {
    window.removeEventListener("storage", cb)
    window.removeEventListener(CHANGE_EVENT, cb)
  }
}

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" })

/** Candidates in priority order. Only the first one not dismissed is shown, so there is never more than one. */
function pickNudge(latest: Latest, stored: Stored, sessionHidden: Set<string>): Nudge | null {
  const now = Date.now()
  const candidates: Nudge[] = []

  if (latest) {
    const updated = new Date(latest.updatedAt).getTime()
    if (Number.isFinite(updated) && now - updated > STALE_DAYS * DAY_MS) {
      candidates.push({
        // Includes updatedAt, so a new publish resets the dismissal.
        id: `stale:${latest.slug}:${latest.updatedAt}`,
        icon: "refresh",
        text: latest.latestJob
          ? `Your site still shows ${latest.latestJob}. Upload your newest resume to refresh it.`
          : `Your site was last updated on ${dateFormat.format(new Date(updated))}. Upload your newest resume to refresh it.`,
        cta: { label: "Upload my resume", href: ROUTES.build },
        snoozeDays: 30,
      })
    }

    const unseen = NEW_TEMPLATE_IDS.filter((t) => !stored.seenTemplates.includes(t.id))
    if (unseen.length > 0) {
      const names = unseen.map((t) => t.name)
      const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
      candidates.push({
        id: "templates",
        icon: "template",
        text: `New ${unseen.length === 1 ? "look" : "looks"} to try: ${list}. Open your portfolio and pick one under Design. Your text stays as it is.`,
        cta: { label: "Try a new look", href: ROUTES.build },
        snoozeDays: Infinity,
      })
    }

    candidates.push({
      id: "referral-intro",
      icon: "gift",
      text: "Know someone job hunting? Send them your invite link. You both get a credit when they publish.",
      cta: { label: "Get my invite link", href: ROUTES.referrals },
      snoozeDays: 60,
    })
  }

  for (const n of candidates) {
    if (sessionHidden.has(n.id)) continue
    const at = stored.dismissed[n.id]
    if (typeof at === "number" && (n.snoozeDays === Infinity || now - at < n.snoozeDays * DAY_MS)) continue
    return n
  }
  return null
}

const ICONS = { refresh: RefreshCw, template: Sparkles, gift: Gift } as const

/** Calm, dismissible prompts on the dashboard home. At most one at a time. */
export function DashboardNudges({ latest }: { latest: Latest }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null)
  const nudge = raw === null ? null : pickNudge(latest, parse(raw), sessionHiddenIds)

  const nudgeId = nudge?.id ?? null
  useEffect(() => {
    if (nudgeId) track("nudge_shown", { id: nudgeId.split(":")[0] })
  }, [nudgeId])

  if (!nudge) return null
  const Icon = ICONS[nudge.icon]

  const dismiss = (reason: "dismissed" | "clicked") => {
    sessionHiddenIds.add(nudge.id)
    write((s) => ({
      dismissed: { ...s.dismissed, [nudge.id]: Date.now() },
      seenTemplates: nudge.id === "templates" ? Array.from(new Set([...s.seenTemplates, ...NEW_TEMPLATE_IDS.map((t) => t.id)])) : s.seenTemplates,
    }))
    track(reason === "clicked" ? "nudge_clicked" : "nudge_dismissed", { id: nudge.id.split(":")[0] })
  }

  return (
    <aside
      aria-label="Suggestion"
      className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--site-rule-strong)] bg-white p-4 sm:items-center sm:p-5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--site-accent-wash)] text-[var(--site-accent-ink)]">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">{nudge.text}</p>
        <Link href={nudge.cta.href} onClick={() => dismiss("clicked")} className="dx-btn dx-btn-outline shrink-0 self-start sm:self-auto">
          {nudge.cta.label}
        </Link>
      </div>
      <button
        type="button"
        onClick={() => dismiss("dismissed")}
        aria-label="Dismiss suggestion"
        className="dx-btn dx-btn-ghost -mr-1 -mt-1 size-11 shrink-0 p-0 sm:mt-0"
      >
        <X className="size-4" aria-hidden />
      </button>
    </aside>
  )
}
