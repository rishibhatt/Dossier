"use client"

import { create } from "zustand"

import { track } from "@/lib/analytics/track"
import type { PlanId } from "@/lib/billing/plans"

/**
 * Where an upgrade prompt can come from. Each one is a moment the person asked for something the plan
 * does not include, after they have already seen their own site (see docs/growth/paywalls.md).
 */
export type UpgradeTrigger = "zip_export" | "shuffle_limit" | "remove_badge" | "portfolio_limit" | "pro_feature"

export type UpgradeOptions = {
  /** Plan reported by the API error, when known. The sheet also fetches it. */
  plan?: PlanId
  /** For `pro_feature`: which planned feature was tapped. */
  feature?: string
  /** Extra way out, e.g. "Replace my current one" on the portfolio limit. */
  secondary?: { label: string; href: string }
  /** Runs before the sheet navigates away (the studio saves the draft here). */
  beforeLeave?: () => void
  /** Called after credits were spent successfully, e.g. to retry the shuffle. */
  onCreditSpent?: (item: "shuffle_pack" | "starter_unlock") => void
}

type UpgradeState = {
  open: boolean
  trigger: UpgradeTrigger | null
  options: UpgradeOptions
  openUpgrade: (trigger: UpgradeTrigger, options?: UpgradeOptions) => void
  close: () => void
}

export const useUpgrade = create<UpgradeState>((set) => ({
  open: false,
  trigger: null,
  options: {},
  openUpgrade: (trigger, options = {}) => {
    track("upgrade_sheet_shown", { trigger, plan: options.plan })
    set({ open: true, trigger, options })
  },
  close: () => set({ open: false }),
}))

/** Open the upgrade sheet from anywhere, including non-React code such as studio actions. */
export function openUpgrade(trigger: UpgradeTrigger, options?: UpgradeOptions) {
  useUpgrade.getState().openUpgrade(trigger, options)
}
