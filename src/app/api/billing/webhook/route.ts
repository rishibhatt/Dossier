import { after } from "next/server"

import { fetchOrder, fetchPayment, grantFromOrder, webhookSignatureOk, type RzpOrder, type RzpPayment } from "@/lib/billing/razorpay"
import { notifyPurchase } from "@/lib/email/events"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"

export const runtime = "nodejs"

type Event = {
  event?: string
  payload?: {
    order?: { entity: RzpOrder }
    payment?: { entity: RzpPayment }
    refund?: { entity: { payment_id: string; amount: number } }
    dispute?: { entity: { payment_id: string } }
  }
}

/**
 * Razorpay webhook. Subscribe in the dashboard to: order.paid, payment.captured, payment.failed,
 * refund.processed, payment.dispute.lost. Each event id is stored first (payment_events), so a retry of a
 * processed event is a no-op; if processing throws, the row is removed and a 500 makes Razorpay retry.
 */
export async function POST(request: Request) {
  const raw = await request.text()
  if (!webhookSignatureOk(raw, request.headers.get("x-razorpay-signature") ?? "")) return new Response("bad signature", { status: 400 })

  let body: Event
  try {
    body = JSON.parse(raw) as Event
  } catch {
    return new Response("bad json", { status: 400 })
  }
  const { event = "", payload = {} } = body

  const admin = createAdminSupabaseClient()
  if (!admin) return new Response("unavailable", { status: 503 })

  const eventId = request.headers.get("x-razorpay-event-id") ?? `${event}:${payload.payment?.entity.id ?? payload.order?.entity.id ?? ""}`
  const { error: dup } = await admin.from("payment_events").insert({ provider: "razorpay", provider_event_id: eventId, payload: body as Json })
  // 23505 = this event id was stored before (a retry). Any other failure must make Razorpay retry, or a paid order is lost.
  if (dup?.code === "23505") return new Response("duplicate", { status: 200 })
  if (dup) return new Response("retry", { status: 500 })

  try {
    const payment = payload.payment?.entity
    switch (event) {
      case "order.paid":
      case "payment.captured": {
        if (!payment?.order_id) break
        const order = payload.order?.entity ?? (await fetchOrder(payment.order_id))
        const res = await grantFromOrder(admin, order, payment.id)
        if (res.result === "invalid") console.error("[billing] webhook order rejected:", order.id, res.reason)
        if (res.result === "granted") after(() => notifyPurchase(res.userId, res.product))
        break
      }
      case "refund.processed": {
        const refund = payload.refund?.entity
        // Partial refunds are goodwill; only a full refund takes the plan back.
        const paid = refund ? (payment ?? (await fetchPayment(refund.payment_id))) : null
        if (refund && paid && refund.amount >= paid.amount) {
          const { error } = await admin.rpc("revoke_purchase", { p_payment_id: refund.payment_id, p_status: "refunded" })
          if (error) throw new Error(error.message)
        }
        break
      }
      case "payment.dispute.lost": {
        const id = payload.dispute?.entity.payment_id
        if (id) {
          const { error } = await admin.rpc("revoke_purchase", { p_payment_id: id, p_status: "disputed" })
          if (error) throw new Error(error.message)
        }
        break
      }
      // payment.failed and anything else: nothing to change. Kept in payment_events for support.
    }
    await admin.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("provider", "razorpay").eq("provider_event_id", eventId)
    return new Response("ok", { status: 200 })
  } catch (e) {
    console.error("[billing] webhook failed:", event, e)
    await admin.from("payment_events").delete().eq("provider", "razorpay").eq("provider_event_id", eventId)
    return new Response("retry", { status: 500 })
  }
}
