"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { openUpgrade } from "@/features/billing/useUpgrade"
import type { PlanId } from "@/lib/billing/plans"
import { ROUTES } from "@/lib/constants/routes"

/**
 * "New portfolio". Under the plan limit it is a plain link. At the limit it explains what happens first:
 * on one-portfolio plans a new publish replaces the current site, and Pro keeps up to 5.
 */
export function NewPortfolioButton({ atLimit, plan }: { atLimit: boolean; plan: PlanId }) {
  const content = (
    <>
      <Plus className="size-4" aria-hidden />
      New portfolio
    </>
  )

  if (!atLimit) {
    return (
      <Link href={ROUTES.build} className="dx-btn dx-btn-primary w-full sm:w-auto">
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className="dx-btn dx-btn-primary w-full sm:w-auto"
      onClick={() =>
        openUpgrade("portfolio_limit", {
          plan,
          secondary: plan === "pro" ? undefined : { label: "Build one to replace my site", href: ROUTES.build },
        })
      }
    >
      {content}
    </button>
  )
}
