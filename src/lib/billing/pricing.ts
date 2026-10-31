import type { PlanId } from "@/lib/billing/plans"

export type Currency = "INR" | "USD"

/** Dollar checkout needs "International payments" approved on the Razorpay account. Until then everyone pays in rupees. */
export const INTERNATIONAL = process.env.NEXT_PUBLIC_RAZORPAY_INTERNATIONAL === "1"
export type ProductId = "starter" | "pro_month" | "pro_year"

/** What checkout sells, in the smallest unit (paise, cents). The server charges these numbers, never the client's. */
export const PRODUCTS: Record<ProductId, { name: string; plan: Exclude<PlanId, "free">; days: number | null; price: Record<Currency, number> }> = {
  starter: { name: "Starter", plan: "starter", days: null, price: { INR: 39900, USD: 900 } },
  pro_month: { name: "Pro, 1 month", plan: "pro", days: 30, price: { INR: 29900, USD: 700 } },
  pro_year: { name: "Pro, 1 year", plan: "pro", days: 365, price: { INR: 149900, USD: 3900 } },
}

/**
 * Festival offers. A percentage off every paid product while the window is open, applied by the server at
 * order time. `currency` limits an offer to one market (Diwali: rupee buyers). Max ~4 a year, or the
 * discount becomes the price. Dates are UTC.
 */
export type Offer = { id: string; name: string; percent: number; starts: string; ends: string; currency?: Currency }
export const OFFERS: readonly Offer[] = [
  { id: "diwali-2026", name: "Diwali offer", percent: 30, starts: "2026-11-01T00:00:00Z", ends: "2026-11-11T18:29:59Z", currency: "INR" },
  { id: "bf-2026", name: "Black Friday", percent: 30, starts: "2026-11-24T00:00:00Z", ends: "2026-12-01T23:59:59Z" },
  { id: "newyear-2027", name: "New year, new job", percent: 25, starts: "2026-12-26T00:00:00Z", ends: "2027-01-05T23:59:59Z" },
  { id: "grad-2027", name: "Graduation season", percent: 25, starts: "2027-05-15T00:00:00Z", ends: "2027-06-15T23:59:59Z" },
]

export function activeOffer(currency: Currency | null, now = Date.now()): Offer | null {
  return OFFERS.find((o) => Date.parse(o.starts) <= now && now <= Date.parse(o.ends) && (!o.currency || !currency || o.currency === currency)) ?? null
}

/** A price with `percent` off, rounded to a whole rupee or dollar (minor units in, minor units out). */
export const discounted = (full: number, percent: number) => Math.round((full * (100 - percent)) / 10000) * 100

/** What a product costs right now, offer applied. */
export function priceFor(product: ProductId, currency: Currency, now = Date.now()): number {
  const full = PRODUCTS[product].price[currency]
  const offer = activeOffer(currency, now)
  return offer ? discounted(full, offer.percent) : full
}

/** Every amount an order for this product could legitimately have been created with. */
export function validAmounts(product: ProductId, currency: Currency): number[] {
  const full = PRODUCTS[product].price[currency]
  return [full, ...OFFERS.filter((o) => !o.currency || o.currency === currency).map((o) => discounted(full, o.percent))]
}

export function formatPrice(minor: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100)
}

export type PlanFeature = { text: string; soon?: boolean }

export type PlanCard = {
  id: PlanId
  name: string
  price: string
  cadence: string
  /** Price line for India, shown under the main one. */
  inr: string
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
    inr: "₹0",
    summary: "Try it and publish one portfolio.",
    features: [
      { text: "1 published portfolio" },
      { text: "Public link you can share" },
      { text: "3 design shuffles a day" },
      { text: "Edit every line of text" },
      { text: "Small Dossier badge on your page" },
      { text: "Resume builder: free PDF, 2 saved resumes" },
    ],
    cta: "Start free",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    cadence: "one time",
    inr: "₹399 in India",
    summary: "One payment. No badge, and the code is yours.",
    features: [
      { text: "Everything in Free" },
      { text: "Dossier badge removed" },
      { text: "Shuffle designs as much as you like" },
      { text: "Download your site as a ZIP and host it anywhere" },
      { text: "Up to 200 saved resumes" },
    ],
    cta: "Get Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    cadence: "per year",
    inr: "or $7 a month · ₹1,499/yr or ₹299/mo in India",
    summary: "For people who keep several portfolios.",
    features: [
      { text: "Everything in Starter" },
      { text: "Up to 5 portfolios" },
      { text: "Visit counts for each page" },
      { text: "Your own domain", soon: true },
      { text: "Pay per month or year. Nothing renews by itself" },
    ],
    cta: "Get Pro",
  },
] as const
