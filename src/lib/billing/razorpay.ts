import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

import type { SupabaseClient } from "@supabase/supabase-js"

import { PRODUCTS, priceFor, validAmounts, type Currency, type ProductId } from "@/lib/billing/pricing"
import type { Database } from "@/types/database"

/**
 * Razorpay over plain fetch (no SDK). Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (server only),
 * RAZORPAY_WEBHOOK_SECRET (the secret typed when adding the webhook in the dashboard).
 * Test keys (rzp_test_...) charge nothing: card 4100 2800 0000 1007 or any net banking bank (UPI ID entry may be absent; QR needs live mode).
 */
const API = "https://api.razorpay.com/v1"

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: { authorization: `Basic ${auth}`, "content-type": "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`razorpay_${res.status}: ${(await res.text()).slice(0, 200)}`)
  return (await res.json()) as T
}

export type RzpOrder = { id: string; amount: number; currency: string; status: string; notes: Record<string, string> | [] }
export type RzpPayment = { id: string; order_id: string | null; amount: number; currency: string; status: string; notes?: Record<string, string> | [] }

export function createOrder(userId: string, product: ProductId, currency: Currency) {
  return call<RzpOrder>("/orders", {
    method: "POST",
    body: { amount: priceFor(product, currency), currency, receipt: `${product}-${Date.now()}`, notes: { user_id: userId, product } },
  })
}

export const fetchOrder = (id: string) => call<RzpOrder>(`/orders/${encodeURIComponent(id)}`)
export const fetchPayment = (id: string) => call<RzpPayment>(`/payments/${encodeURIComponent(id)}`)

/** Constant-time compare of a hex HMAC-SHA256. */
export function hmacMatches(secret: string, message: string, signature: string): boolean {
  const expected = Buffer.from(createHmac("sha256", secret).update(message).digest("hex"))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export const checkoutSignatureOk = (orderId: string, paymentId: string, signature: string) =>
  hmacMatches(process.env.RAZORPAY_KEY_SECRET ?? "", `${orderId}|${paymentId}`, signature)

export const webhookSignatureOk = (rawBody: string, signature: string) =>
  Boolean(process.env.RAZORPAY_WEBHOOK_SECRET) && hmacMatches(process.env.RAZORPAY_WEBHOOK_SECRET!, rawBody, signature)

/**
 * Grants what a paid order bought. The order's notes (set by us at creation) say who and what, and the
 * amount must be one of our prices for that product (full or a festival offer), so nothing else can grant it.
 * Idempotent: returns "granted" once, then "already".
 */
export async function grantFromOrder(
  admin: SupabaseClient<Database>,
  order: RzpOrder,
  paymentId: string
): Promise<{ result: "granted" | "already"; userId: string; product: ProductId } | { result: "invalid"; reason: string }> {
  const notes = Array.isArray(order.notes) ? {} : order.notes
  const product = notes.product as ProductId | undefined
  const userId = notes.user_id
  if (!product || !(product in PRODUCTS) || !userId) return { result: "invalid", reason: "notes" }
  if (!validAmounts(product, order.currency as Currency).includes(order.amount)) return { result: "invalid", reason: "amount" }

  const { data, error } = await admin.rpc("grant_purchase", {
    p_user: userId,
    p_payment_id: paymentId,
    p_order_id: order.id,
    p_product: product,
    p_amount: order.amount,
    p_currency: order.currency,
  })
  if (error) throw new Error(`grant_failed: ${error.message}`)
  return { result: data ? "granted" : "already", userId, product }
}
