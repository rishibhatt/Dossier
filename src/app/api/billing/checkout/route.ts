import { z } from "zod"

import { apiError, resolveCaller } from "@/lib/api/guard"
import { INTERNATIONAL } from "@/lib/billing/pricing"
import { createOrder, razorpayConfigured } from "@/lib/billing/razorpay"

export const runtime = "nodejs"

const bodySchema = z.object({ product: z.enum(["starter", "pro_month", "pro_year"]), currency: z.enum(["INR", "USD"]) })

/** Creates a Razorpay order for the signed-in user. The amount comes from our price table, not the body. */
export async function POST(request: Request) {
  const caller = await resolveCaller()
  if (!caller.user) return apiError("unauthorized", 401, { message: "Sign in to buy a plan." })
  if (!razorpayConfigured()) return apiError("billing_unavailable", 503, { message: "Payments are not set up yet." })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return apiError("invalid_body", 400)
  const { product, currency } = parsed.data
  if (currency === "USD" && !INTERNATIONAL) return apiError("currency_unavailable", 400, { message: "Pay in rupees for now. Dollar payments open soon." })
  if (product === "starter" && caller.plan !== "free") return apiError("already_included", 409, { message: "Your plan already includes Starter." })

  try {
    const order = await createOrder(caller.user.id, product, currency)
    return Response.json({ keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency, email: caller.user.email ?? "" })
  } catch (e) {
    console.error("[billing] order failed:", e)
    if (String(e).includes("razorpay_401")) return apiError("billing_misconfigured", 500, { message: "Payments are not set up correctly on our side. Nothing was charged." })
    return apiError("order_failed", 502, { message: "Could not start checkout. Nothing was charged. Try again." })
  }
}
