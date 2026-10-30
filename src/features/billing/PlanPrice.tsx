"use client"

import { timeLeft, useOffer } from "@/features/billing/useOffer"
import type { PlanId } from "@/lib/billing/plans"
import { discounted, formatPrice, PRODUCTS, type ProductId } from "@/lib/billing/pricing"
import { cn } from "@/lib/utils"

const MAIN: Record<Exclude<PlanId, "free">, ProductId> = { starter: "starter", pro: "pro_year" }

/**
 * A plan's price in the visitor's currency (rupees in India, dollars elsewhere). While a festival offer runs
 * for them, the sale price leads, the full price is struck through, and the offer's end time sits underneath.
 * Server render shows dollars at full price; the browser corrects it on hydration.
 */
export function PlanPrice({ plan, onInk = false }: { plan: PlanId; onInk?: boolean }) {
  const { now, currency, offer } = useOffer()
  const cur = currency ?? "USD"
  const muted = onInk ? "!text-white/70" : ""

  if (plan === "free") {
    return (
      <>
        <p className="mt-6 text-[3.5rem] font-bold leading-none tracking-[-0.04em]" style={{ fontFamily: "var(--site-display)" }}>
          {formatPrice(0, cur)}
        </p>
        <p className={cn("sp-data mt-2", muted)}>No card needed</p>
      </>
    )
  }

  const full = PRODUCTS[MAIN[plan]].price[cur]
  const sale = offer && (!offer.currency || offer.currency === cur) ? offer : null
  const price = sale ? discounted(full, sale.percent) : full
  const month = PRODUCTS.pro_month.price[cur]
  const t = sale ? timeLeft(Date.parse(sale.ends) - now) : null

  return (
    <>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-3" style={{ fontFamily: "var(--site-display)" }}>
        <span
          className={cn(
            "text-[3.5rem] font-bold leading-none tracking-[-0.04em]",
            sale && "underline decoration-[var(--site-accent)] decoration-[4px] underline-offset-[8px]"
          )}
        >
          {formatPrice(price, cur)}
        </span>
        {sale ? (
          <s className={cn("text-2xl font-semibold", onInk ? "text-white/55" : "text-[var(--site-ink-3)]")}>
            <span className="sr-only">was </span>
            {formatPrice(full, cur)}
          </s>
        ) : null}
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
