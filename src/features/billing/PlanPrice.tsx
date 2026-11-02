"use client"

import { DEFAULT_CURRENCY, timeLeft, useOffer } from "@/features/billing/useOffer"
import type { PlanId } from "@/lib/billing/plans"
import { discounted, formatPrice, PRODUCTS, type Currency, type Offer, type ProductId } from "@/lib/billing/pricing"
import { cn } from "@/lib/utils"

const MAIN: Record<Exclude<PlanId, "free">, ProductId> = { starter: "starter", pro: "pro_year" }

/** The live price of a plan's main product for this visitor: the same numbers /pricing, billing and checkout use. */
function usePlanPrice(plan: Exclude<PlanId, "free">): { now: number; cur: Currency; full: number; price: number; sale: Offer | null } {
  const { now, currency, offer } = useOffer()
  const cur = currency ?? DEFAULT_CURRENCY
  const full = PRODUCTS[MAIN[plan]].price[cur]
  const sale = offer && (!offer.currency || offer.currency === cur) ? offer : null
  return { now, cur, full, price: sale ? discounted(full, sale.percent) : full, sale }
}

/** One-line price for tight spots (the upgrade sheet): sale price, the full price struck through, and the cadence. */
export function PriceTag({ plan, cadence }: { plan: Exclude<PlanId, "free">; cadence: string }) {
  const { cur, full, price, sale } = usePlanPrice(plan)
  return (
    <span className="text-sm">
      <span className="text-lg font-bold tabular-nums">{formatPrice(price, cur)}</span>{" "}
      {sale ? (
        <s className="tabular-nums text-[var(--site-ink-3)]">
          <span className="sr-only">was </span>
          {formatPrice(full, cur)}
        </s>
      ) : null}{" "}
      <span className="text-[var(--site-ink-2)]">{cadence}</span>
    </span>
  )
}

/**
 * A plan's price in the visitor's currency (rupees in India, dollars elsewhere). While a festival offer runs
 * for them, the sale price leads, the full price is struck through, and the offer's end time sits underneath.
 * Server render shows the default currency at full price; the browser corrects it on hydration.
 * `size="md"` is the smaller dashboard version, with the cadence after the price.
 */
export function PlanPrice({ plan, onInk = false, size = "lg", cadence }: { plan: PlanId; onInk?: boolean; size?: "lg" | "md"; cadence?: string }) {
  if (plan === "free") return <FreePrice onInk={onInk} size={size} cadence={cadence} />
  return <PaidPrice plan={plan} onInk={onInk} size={size} cadence={cadence} />
}

const SIZE = {
  lg: { top: "mt-6", amount: "text-[3.5rem] leading-none tracking-[-0.04em]", was: "text-2xl" },
  md: { top: "mt-3", amount: "text-4xl tracking-[-0.04em]", was: "text-lg" },
} as const

function Cadence({ cadence }: { cadence?: string }) {
  return cadence ? <span className="text-sm font-normal text-[var(--site-ink-2)]">{cadence}</span> : null
}

function FreePrice({ onInk, size, cadence }: { onInk: boolean; size: "lg" | "md"; cadence?: string }) {
  const { currency } = useOffer()
  const cur = currency ?? DEFAULT_CURRENCY
  return (
    <>
      <p className={cn(SIZE[size].top, "flex flex-wrap items-baseline gap-x-1.5")} style={{ fontFamily: "var(--site-display)" }}>
        <span className={cn(SIZE[size].amount, "font-bold")}>{formatPrice(0, cur)}</span>
        <Cadence cadence={cadence} />
      </p>
      <p className={cn("sp-data mt-2", onInk && "!text-white/70")}>No card needed</p>
    </>
  )
}

function PaidPrice({ plan, onInk, size, cadence }: { plan: Exclude<PlanId, "free">; onInk: boolean; size: "lg" | "md"; cadence?: string }) {
  const { now, cur, full, price, sale } = usePlanPrice(plan)
  const muted = onInk ? "!text-white/70" : ""
  const month = PRODUCTS.pro_month.price[cur]
  const t = sale ? timeLeft(Date.parse(sale.ends) - now) : null

  return (
    <>
      <p className={cn(SIZE[size].top, "flex flex-wrap items-baseline", size === "lg" ? "gap-x-3" : "gap-x-1.5")} style={{ fontFamily: "var(--site-display)" }}>
        <span
          className={cn(
            SIZE[size].amount,
            "font-bold",
            sale && "underline decoration-[var(--site-accent)] decoration-[4px] underline-offset-[8px]"
          )}
        >
          {formatPrice(price, cur)}
        </span>
        {sale ? (
          <s className={cn(SIZE[size].was, "font-semibold", onInk ? "text-white/55" : "text-[var(--site-ink-3)]")}>
            <span className="sr-only">was </span>
            {formatPrice(full, cur)}
          </s>
        ) : null}
        <Cadence cadence={cadence} />
      </p>
      <p className={cn("sp-data mt-3", muted)}>
        {sale && t
          ? `${sale.name}, ${sale.percent}% off · ends in ${t.d ? `${t.d}d ${t.h}h` : `${t.h}h ${t.m}m`}`
          : plan === "pro"
            ? `or ${formatPrice(month, cur)} a month`
            : "Pay once, keep it"}
      </p>
    </>
  )
}
