"use client"

import { useActionState } from "react"

import { adjustCreditsAction, setPlanAction, type ActionState } from "../../../actions"

function Result({ state }: { state: ActionState }) {
  if (!state) return null
  return (
    <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-[var(--site-ok)]" : "text-sm text-[var(--site-danger)]"}>
      {state.message}
    </p>
  )
}

export function PlanForm({ userId, plan, expires }: { userId: string; plan: string; expires: string }) {
  const [state, action, pending] = useActionState(setPlanAction, null)
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="userId" value={userId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="plan" className="sp-label">
            Plan
          </label>
          <select id="plan" name="plan" defaultValue={plan} className="sp-field" disabled={pending}>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <div>
          <label htmlFor="expires" className="sp-label">
            Ends on <span className="font-normal text-[var(--site-ink-3)]">(blank = no end)</span>
          </label>
          <input id="expires" name="expires" type="date" defaultValue={expires} className="sp-field" disabled={pending} />
        </div>
      </div>
      <div>
        <label htmlFor="note" className="sp-label">
          Reason (saved in the audit trail)
        </label>
        <input id="note" name="note" maxLength={300} className="sp-field" disabled={pending} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="notify" defaultChecked disabled={pending} className="size-4 accent-[var(--site-accent)]" />
        Email the user about this change
      </label>
      <Result state={state} />
      <button type="submit" disabled={pending} className="site-btn site-btn-primary w-full sm:w-auto">
        <span className="site-btn-label">{pending ? "Saving" : "Save plan"}</span>
      </button>
    </form>
  )
}

export function CreditsForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(adjustCreditsAction, null)
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="userId" value={userId} />
      <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <div>
          <label htmlFor="delta" className="sp-label">
            Change
          </label>
          <input id="delta" name="delta" type="number" step={1} min={-1000} max={1000} required placeholder="+3 or -1" className="sp-field" disabled={pending} />
        </div>
        <div>
          <label htmlFor="cnote" className="sp-label">
            Reason (required)
          </label>
          <input id="cnote" name="note" required minLength={3} maxLength={300} className="sp-field" disabled={pending} />
        </div>
      </div>
      <Result state={state} />
      <button type="submit" disabled={pending} className="site-btn site-btn-primary w-full sm:w-auto">
        <span className="site-btn-label">{pending ? "Saving" : "Apply credits"}</span>
      </button>
    </form>
  )
}
