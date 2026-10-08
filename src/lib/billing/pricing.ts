import type { PlanId } from "@/lib/billing/plans"

export type PlanFeature = { text: string; soon?: boolean }

export type PlanCard = {
  id: PlanId
  name: string
  price: string
  cadence: string
  summary: string
  features: readonly PlanFeature[]
  cta: string
}

/** Public pricing copy. Limits behind these claims live in `plans.ts`. */
export const PLAN_CARDS: readonly PlanCard[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    summary: "Try it and publish one portfolio.",
    features: [
      { text: "1 published portfolio" },
      { text: "Public link you can share" },
      { text: "3 design shuffles a day" },
      { text: "Edit every line of text" },
      { text: "Small Dossier badge on your page" },
    ],
    cta: "Start free",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    cadence: "one time",
    summary: "One payment. No badge, and the code is yours.",
    features: [
      { text: "Everything in Free" },
      { text: "Dossier badge removed" },
      { text: "Shuffle designs as much as you like" },
      { text: "Download your site as a ZIP and host it anywhere" },
    ],
    cta: "Get Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    cadence: "per year",
    summary: "For people who keep several portfolios.",
    features: [
      { text: "Everything in Starter" },
      { text: "Up to 5 portfolios" },
      { text: "Your own domain", soon: true },
      { text: "Visit counts for each page", soon: true },
      { text: "PDF copy of your resume", soon: true },
    ],
    cta: "Get Pro",
  },
] as const
