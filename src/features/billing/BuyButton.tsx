"use client"

import { useRouter } from "next/navigation"
import { useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import { track } from "@/lib/analytics"
import { localCurrency } from "@/features/billing/useOffer"
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

/** India sees rupees (UPI, RuPay, Indian cards); everyone else pays in dollars. */
export function guessCurrency(): Currency {
  return INTERNATIONAL ? localCurrency() : "INR"
}

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

export function BuyButton({ product, currency, className, label }: { product: ProductId; currency: Currency; className?: string; label?: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const now = useSyncExternalStore(
    noop,
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => 0
  )
  const full = PRODUCTS[product].price[currency]
  const cost = now ? priceFor(product, currency, now) : full

  async function buy() {
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

  return (
    <button type="button" onClick={buy} disabled={busy} className={className}>
      {busy ? "Opening checkout…" : (label ?? `Buy ${PRODUCTS[product].name}`)} ·{" "}
      {cost < full ? <s className="opacity-60">{formatPrice(full, currency)}</s> : null} {formatPrice(cost, currency)}
    </button>
  )
}

/** Buy buttons for one plan card, with a rupee/dollar switch (guessed from the time zone). */
export function PlanBuy({ plan }: { plan: "starter" | "pro" }) {
  // Server render says USD; the browser switches to its guess on hydration, and the link below overrides it.
  const guessed = useSyncExternalStore(noop, guessCurrency, () => "USD" as Currency)
  const [picked, setCurrency] = useState<Currency | null>(null)
  const currency = picked ?? guessed
  const other: Currency = currency === "INR" ? "USD" : "INR"
  return (
    <div className="grid gap-2">
      {plan === "starter" ? (
        <BuyButton product="starter" currency={currency} label="Get Starter" className="dx-btn dx-btn-primary w-full" />
      ) : (
        <>
          <BuyButton product="pro_year" currency={currency} label="Pro for a year" className="dx-btn dx-btn-primary w-full" />
          <BuyButton product="pro_month" currency={currency} label="Pro for a month" className="dx-btn dx-btn-outline w-full" />
        </>
      )}
      {INTERNATIONAL ? (
        <button type="button" onClick={() => setCurrency(other)} className="text-center text-xs text-[var(--site-ink-2)] underline underline-offset-4">
          Pay in {other === "INR" ? "rupees (UPI, cards)" : "US dollars"} instead
        </button>
      ) : null}
    </div>
  )
}
