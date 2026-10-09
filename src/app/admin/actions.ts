"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { z } from "zod"

import { requireAdminAction } from "@/lib/admin/auth"
import { notifyPlanChanged } from "@/lib/email/events"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database"

export type ActionState = { ok: boolean; message: string; nonce: number } | null

const fail = (message: string): ActionState => ({ ok: false, message, nonce: Date.now() })
const done = (message: string): ActionState => ({ ok: true, message, nonce: Date.now() })

const uuid = z.string().uuid()

/** Every admin change is written to the audit trail with who did it, to whom, and what changed. */
async function audit(admin: Awaited<ReturnType<typeof requireAdminAction>>["admin"], adminId: string, action: string, target: string | null, details: Json) {
  await admin.from("admin_audit").insert({ admin_id: adminId, action, target_user: target, details })
}

const planSchema = z.object({
  userId: uuid,
  plan: z.enum(["free", "starter", "pro"]),
  expires: z.string().trim().optional(),
  note: z.string().trim().max(300).optional(),
  notify: z.boolean(),
})

export async function setPlanAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, admin } = await requireAdminAction()

  const parsed = planSchema.safeParse({
    userId: formData.get("userId"),
    plan: formData.get("plan"),
    expires: String(formData.get("expires") ?? ""),
    note: String(formData.get("note") ?? ""),
    notify: formData.get("notify") === "on",
  })
  if (!parsed.success) return fail("Check the plan and the date.")
  const { userId, plan, note, notify } = parsed.data

  let expiresAt: string | null = null
  if (plan !== "free" && parsed.data.expires) {
    const d = new Date(`${parsed.data.expires}T23:59:59Z`)
    if (Number.isNaN(d.getTime())) return fail("That date is not valid.")
    if (d.getTime() < Date.now()) return fail("The expiry date is in the past.")
    expiresAt = d.toISOString()
  }

  const { data: before } = await admin.from("users").select("plan, plan_expires_at").eq("id", userId).maybeSingle()
  if (!before) return fail("User not found.")

  const { error } = await admin.from("users").update({ plan, plan_expires_at: expiresAt }).eq("id", userId)
  if (error) return fail("The update failed. Try again.")

  await audit(admin, user.id, "set_plan", userId, { from: before.plan, to: plan, expires_from: before.plan_expires_at, expires_to: expiresAt, note: note || null, notified: notify })
  if (notify) after(() => notifyPlanChanged(userId, plan, expiresAt))

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath("/admin/users")
  return done(`Plan set to ${plan}${expiresAt ? ` until ${expiresAt.slice(0, 10)}` : ""}.`)
}

const creditSchema = z.object({
  userId: uuid,
  delta: z.coerce.number().int().min(-1000).max(1000).refine((n) => n !== 0, "zero"),
  note: z.string().trim().min(3).max(300),
})

export async function adjustCreditsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, admin } = await requireAdminAction()

  const parsed = creditSchema.safeParse({ userId: formData.get("userId"), delta: formData.get("delta"), note: formData.get("note") })
  if (!parsed.success) return fail("Enter a whole number other than 0 (up to 1000) and a short reason.")
  const { userId, delta, note } = parsed.data

  const [{ data: exists }, { data: bal }] = await Promise.all([
    admin.from("users").select("id").eq("id", userId).maybeSingle(),
    admin.from("credit_balances").select("balance").eq("user_id", userId).maybeSingle(),
  ])
  if (!exists) return fail("User not found.")
  const balance = bal?.balance ?? 0
  if (balance + delta < 0) return fail(`This would take the balance below zero. It is ${balance} now.`)

  const { error } = await admin.from("credit_ledger").insert({ user_id: userId, delta, reason: "admin_adjustment" })
  if (error) return fail("The update failed. Try again.")

  await audit(admin, user.id, "adjust_credits", userId, { delta, note, balance_before: balance, balance_after: balance + delta })
  revalidatePath(`/admin/users/${userId}`)
  return done(`Balance is now ${balance + delta}.`)
}

export async function setMessageStatusAction(formData: FormData): Promise<void> {
  const { user, admin } = await requireAdminAction()
  const id = uuid.safeParse(formData.get("id"))
  const status = z.enum(["new", "handled"]).safeParse(formData.get("status"))
  if (!id.success || !status.success) return
  await admin.from("contact_messages").update({ status: status.data }).eq("id", id.data)
  await audit(admin, user.id, "message_status", null, { id: id.data, status: status.data })
  revalidatePath("/admin/messages")
  revalidatePath("/admin")
}

export async function adminSignOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}
