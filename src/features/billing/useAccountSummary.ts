"use client"

import { useEffect } from "react"
import { create } from "zustand"

import type { PlanId } from "@/lib/billing/plans"

export type AccountSummary = { signedIn: boolean; plan: PlanId; balance: number }

type State = {
  status: "idle" | "loading" | "ready" | "error"
  summary: AccountSummary
  refresh: () => Promise<void>
}

const SIGNED_OUT: AccountSummary = { signedIn: false, plan: "free", balance: 0 }

/** Shared, fetched once per page load from GET /api/credits. Call `refresh()` after spending credits. */
export const useAccountSummaryStore = create<State>((set, get) => ({
  status: "idle",
  summary: SIGNED_OUT,
  refresh: async () => {
    if (get().status === "loading") return
    set({ status: "loading" })
    try {
      const res = await fetch("/api/credits", { cache: "no-store" })
      const body = (await res.json().catch(() => null)) as Partial<AccountSummary> | null
      if (!res.ok || !body) throw new Error("summary_failed")
      set({
        status: "ready",
        summary: {
          signedIn: Boolean(body.signedIn),
          plan: body.plan === "starter" || body.plan === "pro" ? body.plan : "free",
          balance: typeof body.balance === "number" ? body.balance : 0,
        },
      })
    } catch {
      set({ status: "error", summary: SIGNED_OUT })
    }
  },
}))

/** Reads the summary and loads it on first use. `enabled` lets a closed sheet skip the request. */
export function useAccountSummary(enabled = true) {
  const status = useAccountSummaryStore((s) => s.status)
  const summary = useAccountSummaryStore((s) => s.summary)
  const refresh = useAccountSummaryStore((s) => s.refresh)

  useEffect(() => {
    if (enabled && status === "idle") void refresh()
  }, [enabled, status, refresh])

  return { status, summary, refresh }
}
