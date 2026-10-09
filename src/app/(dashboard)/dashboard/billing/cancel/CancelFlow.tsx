"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

import { track } from "@/lib/analytics/track"
import type { PlanId } from "@/lib/billing/plans"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import type { CancelOutcome, CancelReason } from "@/types/database"

const REASONS: { id: CancelReason; label: string }[] = [
  { id: "got_job", label: "I got the job" },
  { id: "too_expensive", label: "It costs too much" },
  { id: "missing_feature", label: "It is missing something I need" },
  { id: "hard_to_use", label: "It was hard to use" },
  { id: "only_once", label: "I only needed it once" },
  { id: "other", label: "Something else" },
]

const PLAN_NAME: Record<PlanId, string> = { free: "Free", starter: "Starter", pro: "Pro" }

type Step = "survey" | "offer" | "confirm" | "done"

type Submit = { outcome: CancelOutcome; offer?: string; doneText: string }

const display = { fontFamily: "var(--site-display)" } as const

export function CancelFlow({ plan, supportEmail }: { plan: PlanId; supportEmail: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("survey")
  const [reason, setReason] = useState<CancelReason | null>(null)
  const [details, setDetails] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doneText, setDoneText] = useState("")
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  const detailsId = useId()
  const isPro = plan === "pro"

  // Move focus to the new step's heading so keyboard and screen reader users land in the right place.
  useEffect(() => {
    if (firstRender.current) firstRender.current = false
    else headingRef.current?.focus()
    track("cancel_flow_step", { step, plan })
  }, [step, plan])

  async function submit({ outcome, offer, doneText: text }: Submit) {
    if (!reason) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/billing/cancel-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          details: details.trim() || undefined,
          offer,
          outcome,
          confirmDowngrade: outcome === "downgraded" ? true : undefined,
        }),
      })
      const body = (await res.json().catch(() => null)) as { message?: string } | null
      if (!res.ok) {
        setError(body?.message ?? "That did not save. Try again.")
        return
      }
      track("cancel_flow_finished", { reason, outcome, offer, plan })
      setDoneText(text)
      setStep("done")
      if (outcome === "downgraded") router.refresh()
    } catch {
      setError("Could not reach the server. Check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  const heading = (text: string) => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="text-[clamp(1.5rem,4vw,2.125rem)] font-bold leading-[1.1] tracking-[-0.03em] outline-none"
      style={display}
    >
      {text}
    </h1>
  )

  const errorNote = error ? (
    <p role="alert" className="mt-4 text-sm font-medium text-[var(--site-danger)]">
      {error}
    </p>
  ) : null

  const stepLabel = (n: number) => (
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--site-ink-2)]">Step {n} of 3</p>
  )

  if (step === "done") {
    return (
      <div className="mt-4 rounded-2xl border border-[var(--site-rule-strong)] bg-white p-5 sm:p-6">
        <span className="grid size-10 place-items-center rounded-full bg-[var(--site-ink)] text-[var(--site-paper)]" aria-hidden>
          <Check className="size-5" strokeWidth={3} />
        </span>
        <div className="mt-4">{heading("Thanks for telling us")}</div>
        <p className="mt-2 text-[var(--site-ink-2)]">{doneText}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href={ROUTES.dashboard} className="dx-btn dx-btn-primary">
            Back to my portfolios
          </Link>
          <Link href={ROUTES.billing} className="dx-btn dx-btn-outline">
            See plans
          </Link>
        </div>
      </div>
    )
  }

  if (step === "survey") {
    return (
      <div className="mt-4">
        {stepLabel(1)}
        {heading("Before you go, what changed?")}
        <p className="mt-2 text-[var(--site-ink-2)]">
          You are on {PLAN_NAME[plan]}. Pick the closest answer. It helps us fix the right thing.
        </p>
        <fieldset className="mt-6">
          <legend className="sr-only">Main reason</legend>
          <div className="grid gap-2">
            {REASONS.map((r) => (
              <label
                key={r.id}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 text-sm font-medium transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--site-accent-ink)] motion-reduce:transition-none",
                  reason === r.id ? "border-[var(--site-ink)] shadow-[inset_0_0_0_1px_var(--site-ink)]" : "border-[var(--site-rule-strong)] hover:border-[var(--site-ink)]"
                )}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  className="size-4 accent-[var(--site-accent-ink)]"
                />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label htmlFor={detailsId} className="mt-5 block text-sm font-semibold">
          Anything else? <span className="font-normal text-[var(--site-ink-2)]">(optional)</span>
        </label>
        <textarea
          id={detailsId}
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
          rows={3}
          className="dx-field mt-2 w-full py-2.5"
          placeholder="What would have made Dossier work for you?"
        />
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
          <button type="button" disabled={!reason} onClick={() => setStep("offer")} className="dx-btn dx-btn-primary">
            Continue
          </button>
          <Link href={ROUTES.billing} className="dx-btn dx-btn-ghost">
            Never mind, keep {PLAN_NAME[plan]}
          </Link>
        </div>
      </div>
    )
  }

  if (step === "offer" && reason) {
    const offer = offerFor(reason, plan, supportEmail)
    return (
      <div className="mt-4">
        {stepLabel(2)}
        {heading(offer.title)}
        <p className="mt-2 text-[var(--site-ink-2)]">{offer.body}</p>

        {reason === "missing_feature" ? (
          <>
            <label htmlFor={`${detailsId}-feature`} className="mt-5 block text-sm font-semibold">
              Which feature?
            </label>
            <textarea
              id={`${detailsId}-feature`}
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
              rows={3}
              className="dx-field mt-2 w-full py-2.5"
              placeholder="For example: a contact form, or more than one language"
            />
          </>
        ) : null}

        {errorNote}

        <div className="mt-6 flex flex-col gap-2">
          {offer.actions.map((a) =>
            a.kind === "link" ? (
              <a key={a.label} href={a.href} className="dx-btn dx-btn-outline">
                {a.label}
              </a>
            ) : (
              <button
                key={a.label}
                type="button"
                disabled={busy}
                onClick={() => void submit({ outcome: a.outcome, offer: a.offer, doneText: a.doneText })}
                className={cn("dx-btn", a.primary ? "dx-btn-primary" : "dx-btn-outline")}
              >
                {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
                {a.label}
              </button>
            )
          )}
          <button type="button" disabled={busy} onClick={() => setStep("confirm")} className="dx-btn dx-btn-ghost">
            {isPro ? "No thanks, continue to switch to Free" : "No thanks, continue"}
          </button>
        </div>
      </div>
    )
  }

  // Step 3: confirm.
  return (
    <div className="mt-4">
      {stepLabel(3)}
      {heading(isPro ? "Switch to Free now?" : "Send your answer?")}
      {isPro ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--site-rule-strong)] bg-white p-4">
            <p className="text-sm font-semibold">You keep</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--site-ink-2)]">
              <li>Your published pages and their links</li>
              <li>Everything you wrote</li>
              <li>3 design shuffles a day</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--site-rule-strong)] bg-white p-4">
            <p className="text-sm font-semibold">You lose</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--site-ink-2)]">
              <li>ZIP downloads</li>
              <li>Unlimited shuffles</li>
              <li>Room for 5 portfolios. New publishes update your latest one</li>
              <li>Pages without the badge. It comes back</li>
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[var(--site-ink-2)]">
          {plan === "starter"
            ? "Starter was a one-time purchase, so there is nothing to cancel and nothing more to pay. Your site stays as it is."
            : "Free never charges you, so there is nothing to cancel. Your site stays live as it is."}
        </p>
      )}
      {isPro ? (
        <p className="mt-4 text-sm text-[var(--site-ink-2)]">
          Checkout is not live yet, so no one has been charged for Pro and there is no refund to process. The switch happens now.
        </p>
      ) : null}
      {errorNote}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {isPro ? (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void submit({
                outcome: "downgraded",
                offer: "confirm_free",
                doneText: "You are on Free now. Your links still work. You can come back to Pro from Plan & billing whenever you like.",
              })
            }
            className="dx-btn dx-btn-primary"
          >
            {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
            Switch to Free
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit({ outcome: "feedback_only", doneText: "Your answer is saved. Your site stays as it is." })}
            className="dx-btn dx-btn-primary"
          >
            {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
            Send my answer
          </button>
        )}
        <Link href={ROUTES.billing} className="dx-btn dx-btn-outline">
          Keep {PLAN_NAME[plan]}
        </Link>
      </div>
    </div>
  )
}

type OfferAction =
  | { kind: "submit"; label: string; outcome: CancelOutcome; offer: string; doneText: string; primary?: boolean }
  | { kind: "link"; label: string; href: string }

type Offer = { title: string; body: string; actions: OfferAction[] }

const KEPT = "Your answer is saved and your plan stays as it is."

/** One reason-matched offer per answer. Nothing here changes a plan; only step 3 can, and only Pro to Free. */
function offerFor(reason: CancelReason, plan: PlanId, supportEmail: string): Offer {
  const isPro = plan === "pro"
  const keepLabel = `Keep ${PLAN_NAME[plan]}`
  const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent("Help with Dossier")}`

  switch (reason) {
    case "got_job":
      return isPro
        ? {
            title: "Congratulations on the new job",
            body: "Your site can stay live on Free, with the small badge. If you want a copy of the full site first, download the ZIP from the Share panel before you switch.",
            actions: [
              { kind: "link", label: "Download a ZIP first", href: ROUTES.build },
              { kind: "submit", label: keepLabel, outcome: "kept_plan", offer: "none", doneText: KEPT },
            ],
          }
        : {
            title: "Congratulations on the new job",
            body: "Your site stays live as it is. Keep the link on your profile for next time.",
            actions: [],
          }
    case "too_expensive":
      return isPro
        ? {
            title: "Would Starter work instead?",
            body: "Starter is $9 once and never renews. It keeps no badge, unlimited shuffles and ZIP downloads, for one portfolio. Or pause Pro for 3 months. Checkout is not open yet, so we save your choice and nothing is charged today.",
            actions: [
              {
                kind: "submit",
                label: "Move me to Starter instead",
                outcome: "accepted_offer",
                offer: "switch_starter",
                doneText: "Your request to move to Starter is saved. Checkout is not open yet, so nothing is charged and your plan stays as it is for now.",
                primary: true,
              },
              {
                kind: "submit",
                label: "Pause Pro for 3 months",
                outcome: "accepted_offer",
                offer: "pause_3_months",
                doneText: "Your pause request is saved. Checkout is not open yet, so nothing is charged in the meantime.",
              },
            ],
          }
        : {
            title: plan === "starter" ? "Starter never charges again" : "Free stays free",
            body:
              plan === "starter"
                ? "You paid once, and nothing renews. There is nothing more to pay."
                : "Nothing on Free costs money. Inviting friends earns credits for extra shuffles and Starter.",
            actions: plan === "free" ? [{ kind: "link", label: "See how invites work", href: ROUTES.referrals }] : [],
          }
    case "missing_feature":
      return {
        title: "Tell us what is missing",
        body: "Planned for Pro: your own domain, visit counts for each page and a PDF copy of your resume. None of these are built yet. If yours is not on that list, say so below. We read every answer.",
        actions: [{ kind: "submit", label: `Send and keep ${PLAN_NAME[plan]}`, outcome: "kept_plan", offer: "roadmap_note", doneText: KEPT, primary: true }],
      }
    case "hard_to_use":
      return {
        title: "Let us help",
        body: `Tell us where you got stuck and we will write back. Email ${supportEmail}.`,
        actions: [
          { kind: "link", label: "Email us", href: mailto },
          { kind: "submit", label: keepLabel, outcome: "kept_plan", offer: "help_email", doneText: KEPT },
        ],
      }
    case "only_once":
      return isPro
        ? {
            title: "Free keeps your link live",
            body: "Switch to Free and your page stays at the same link, with the small badge. Come back to Pro any time.",
            actions: [{ kind: "submit", label: keepLabel, outcome: "kept_plan", offer: "none", doneText: KEPT }],
          }
        : {
            title: "Your link stays live",
            body: "Nothing renews, and your page stays where it is. Use it whenever you apply next.",
            actions: [],
          }
    case "other":
      return {
        title: "Thanks for saying so",
        body: "If there is something we can fix, write to us and we will reply.",
        actions: [{ kind: "link", label: "Email us", href: mailto }],
      }
  }
}
