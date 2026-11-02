"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import { track } from "@/lib/analytics"
import { checkoutCurrency, DEFAULT_CURRENCY } from "@/features/billing/useOffer"
import { formatPrice, INTERNATIONAL, priceFor, PRODUCTS, type Currency, type ProductId } from "@/lib/billing/pricing"

type RzpResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
type RzpInstance = {
  open: () => void
  on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RzpInstance
  }
}

const noop = () => () => {}

/** India sees rupees (UPI, RuPay, Indian cards); everyone else pays in dollars (rupees for all while international payments are off). */
export const guessCurrency = checkoutCurrency

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.head.appendChild(s)
  })
}

type BuyButtonProps = {
  product: ProductId
  currency: Currency
  className?: string
  label?: string
  /** Runs on click, before checkout opens (analytics, closing a sheet). */
  onStart?: () => void
  /** Open checkout as soon as the page is ready, once. Used when someone arrives from a pricing button after signing up. */
  autoStart?: boolean
}

export function BuyButton({ product, currency, className, label, onStart, autoStart = false }: BuyButtonProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const started = useRef(false)
  const now = useSyncExternalStore(
    noop,
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => 0
  )
  const full = PRODUCTS[product].price[currency]
  const cost = now ? priceFor(product, currency, now) : full

  async function buy() {
    started.current = true
    setBusy(true)
    track("checkout_started", { product, currency })
    try {
      const [ok, res] = await Promise.all([
        loadCheckout(),
        fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ product, currency }),
        }),
      ])
      const order = (await res.json().catch(() => ({}))) as {
        keyId?: string
        orderId?: string
        amount?: number
        currency?: string
        email?: string
        message?: string
      }
      if (!ok || !window.Razorpay) throw new Error("Checkout could not load. Check your connection and try again.")
      if (!res.ok || !order.orderId) throw new Error(order.message ?? "Could not start checkout.")

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Dossier",
        description: PRODUCTS[product].name,
        prefill: { email: order.email },
        theme: { color: "#6d5cf6" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (r: RzpResponse) => {
          const v = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(r),
          })
          const body = (await v.json().catch(() => ({}))) as {
            message?: string
          }
          track("checkout_paid", { product, currency })
          toast.success(
            v.ok && v.status === 200
              ? `${PRODUCTS[product].name} is on. Thank you!`
              : (body.message ?? "Payment received. Your plan switches on within a minute.")
          )
          setBusy(false)
          router.refresh()
        },
      })
      rzp.on("payment.failed", (r) => {
        track("checkout_failed", { product, currency })
        toast.error(r.error?.description ?? "The payment did not go through. Nothing was charged.")
      })
      rzp.open()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout.")
      setBusy(false)
    }
  }

  // `now` is 0 until hydration, when the currency and offer are still the server's guess.
  useEffect(() => {
    if (!autoStart || !now || started.current) return
    started.current = true
    // Drop `?buy=` so a reload or the back button does not open checkout again.
    const url = new URL(window.location.href)
    url.searchParams.delete("buy")
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`)
    const id = setTimeout(() => void buy(), 0)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, after hydration
  }, [autoStart, now])

  return (
    <button
      type="button"
      onClick={() => {
        onStart?.()
        void buy()
      }}
      disabled={busy}
      className={className}
    >
      {/* One wrapper, so `.site-btn` keeps the label above its hover fill. */}
      <span>
        {busy ? "Opening checkout…" : (label ?? `Buy ${PRODUCTS[product].name}`)} ·{" "}
        {cost < full ? <s className="opacity-60">{formatPrice(full, currency)}</s> : null} {formatPrice(cost, currency)}
      </span>
    </button>
  )
}

type PlanBuyProps = {
  plan: "starter" | "pro"
  /** Opens this product's checkout on arrival (from `?buy=`). Ignored when it is not one of this plan's buttons. */
  autoBuy?: ProductId
  /** Called with the product when a button is clicked. */
  onStart?: (product: ProductId) => void
  /** Button classes: the main one, the second Pro button, and the currency switch link. Default: the dashboard look. */
  primaryClass?: string
  secondaryClass?: string
  switchClass?: string
}

/** Buy buttons for one plan card, with a rupee/dollar switch (guessed from the time zone). */
export function PlanBuy({
  plan,
  autoBuy,
  onStart,
  primaryClass = "dx-btn dx-btn-primary w-full",
  secondaryClass = "dx-btn dx-btn-outline w-full",
  switchClass = "text-[var(--site-ink-2)]",
}: PlanBuyProps) {
  // Server render shows the default currency; the browser switches to its guess on hydration, and the link below overrides it.
  const guessed = useSyncExternalStore(noop, guessCurrency, () => DEFAULT_CURRENCY)
  const [picked, setCurrency] = useState<Currency | null>(null)
  const currency = picked ?? guessed
  const other: Currency = currency === "INR" ? "USD" : "INR"
  const button = (product: ProductId, label: string, className: string) => (
    <BuyButton product={product} currency={currency} label={label} className={className} onStart={() => onStart?.(product)} autoStart={autoBuy === product} />
  )
  return (
    <div className="grid gap-2">
      {plan === "starter" ? (
        button("starter", "Get Starter", primaryClass)
      ) : (
        <>
          {button("pro_year", "Pro for a year", primaryClass)}
          {button("pro_month", "Pro for a month", secondaryClass)}
        </>
      )}
      {INTERNATIONAL ? (
        <button type="button" onClick={() => setCurrency(other)} className={`text-center text-xs underline underline-offset-4 ${switchClass}`}>
          Pay in {other === "INR" ? "rupees (UPI, cards)" : "US dollars"} instead
        </button>
      ) : null}
    </div>
  )
}
