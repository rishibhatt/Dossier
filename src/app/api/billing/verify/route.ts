import { after } from "next/server"
import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { checkoutSignatureOk, fetchOrder, grantFromOrder } from "@/lib/billing/razorpay"
import { notifyPurchase } from "@/lib/email/events"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(128),
})

/**
 * Checkout's success callback. The signature proves Razorpay saw this payment for this order; the plan is
 * granted here so the user sees it at once. The webhook grants it too (idempotent) in case this call never arrives.
 */
export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user) return apiError("unauthorized", 401)
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return apiError("invalid_body", 400)
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = parsed.data
  if (!checkoutSignatureOk(orderId, paymentId, signature)) return apiError("bad_signature", 400)

  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("billing_unavailable", 503)
  try {
    const order = await fetchOrder(orderId)
    const notes = Array.isArray(order.notes) ? {} : order.notes
    if (notes.user_id !== caller.user.id) return apiError("forbidden", 403)
    const res = await grantFromOrder(admin, order, paymentId)
    if (res.result === "invalid") return apiError("invalid_order", 400)
    if (res.result === "granted") after(() => notifyPurchase(res.userId, res.product))
    return Response.json({ ok: true, product: res.product })
  } catch (e) {
    console.error("[billing] verify failed:", e)
    // The payment went through; the webhook will still grant it.
    return Response.json({ ok: false, pending: true, message: "Payment received. Your plan switches on within a minute." }, { status: 202 })
  }
}
