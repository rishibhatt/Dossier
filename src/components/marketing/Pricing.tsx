import { Check, Minus } from "lucide-react"

import { RunningHead } from "@/components/marketing/PageHead"
import { SiteButton } from "@/components/marketing/primitives"
import { PLAN_CARDS } from "@/lib/billing/pricing"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const COMPARE: { row: string; free: string | boolean; starter: string | boolean; pro: string | boolean; soon?: boolean }[] = [
  { row: "Published portfolios", free: "1", starter: "1", pro: "5" },
  { row: "Public Dossier link", free: true, starter: true, pro: true },
  { row: "Edit every line", free: true, starter: true, pro: true },
  { row: "Design shuffles", free: "3 a day", starter: "Unlimited", pro: "Unlimited" },
  { row: "\"Made with Dossier\" badge", free: "Shown", starter: "Removed", pro: "Removed" },
  { row: "Download the site as a ZIP", free: false, starter: true, pro: true },
  { row: "Your own domain", free: false, starter: false, pro: true, soon: true },
  { row: "Visit counts", free: false, starter: false, pro: true, soon: true },
  { row: "PDF copy of your resume", free: false, starter: false, pro: true, soon: true },
]

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto size-4" aria-label="Included" />
  if (v === false) return <Minus className="mx-auto size-4 opacity-40" aria-label="Not included" />
  return <span>{v}</span>
}

/** Three plans as ruled columns. Starter is the marked proof (inverted). `full` adds the row-by-row comparison. */
export function Pricing({ as: Heading = "h2", full = false }: { as?: "h1" | "h2"; full?: boolean }) {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className={cn("scroll-mt-20 pb-20 sm:pb-28", Heading === "h1" ? "pt-6 sm:pt-10" : "pt-20 sm:pt-28")}>
      <div className="site-wrap">
        <RunningHead label="Pricing" no="006" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Heading id="pricing-title" className="site-h2 lg:col-span-7">
            Free to publish. Pay once to make it yours.
          </Heading>
          <p className="site-lead self-end lg:col-span-5">
            Start with a free account, no card. Paid plans remove the badge and give you the files.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 border-y border-[var(--site-ink)] lg:grid-cols-3">
          {PLAN_CARDS.map((plan, k) => {
            const marked = plan.id === "starter"
            return (
              <article
                key={plan.id}
                aria-labelledby={`plan-${plan.id}`}
                className={cn(
                  "flex flex-col p-6 sm:p-8",
                  k > 0 && "border-t border-[var(--site-rule-strong)] lg:border-l lg:border-t-0",
                  marked && "bg-[var(--site-ink)] text-[var(--site-paper)]"
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 id={`plan-${plan.id}`} className="site-h3">
                    {plan.name}
                  </h3>
                  <span className={cn("sp-data", marked && "!text-white/70")}>{plan.cadence}</span>
                </div>
                <p className="mt-6 text-[3.5rem] font-bold leading-none tracking-[-0.04em]" style={{ fontFamily: "var(--site-display)" }}>
                  {plan.price}
                </p>
                <p className={cn("mt-3 text-[0.9375rem]", marked ? "text-white/80" : "text-[var(--site-ink-2)]")}>{plan.summary}</p>

                <ul className={cn("mt-6 flex-1 border-t pt-4 text-[0.9375rem]", marked ? "border-white/20" : "border-[var(--site-rule)]")}>
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex gap-3 py-1.5">
                      <Check className={cn("mt-1 size-4 shrink-0", marked ? "text-[#b8aeff]" : "text-[var(--site-accent-ink)]")} aria-hidden />
                      <span className={cn(f.soon && (marked ? "text-white/70" : "text-[var(--site-ink-2)]"))}>
                        {f.text}
                        {f.soon ? <span className="sp-data ml-2 !text-current">(planned)</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>

                <SiteButton
                  href={plan.id === "free" ? ROUTES.build : `${ROUTES.signup}?plan=${plan.id}`}
                  variant={marked ? "paper" : plan.id === "free" ? "primary" : "secondary"}
                  arrow
                  className="mt-8 w-full justify-between"
                >
                  {plan.cta}
                </SiteButton>
              </article>
            )
          })}
        </div>

        <p className="mt-6 max-w-2xl text-sm text-[var(--site-ink-2)]">
          Checkout is not open yet. For now the paid buttons create a free account, and you can upgrade from your dashboard once payments open. Prices are in US
          dollars. Starter is one payment for one portfolio. Pro renews yearly and you can cancel any time.
        </p>

        {full ? (
          <div className="mt-16 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-[0.9375rem]">
              <caption className="site-h3 pb-6 text-left">Plan by plan</caption>
              <thead>
                <tr className="border-b border-[var(--site-ink)] text-left">
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    <span className="sr-only">Feature</span>
                  </th>
                  {PLAN_CARDS.map((p) => (
                    <th key={p.id} scope="col" className="w-[22%] py-3 text-center font-semibold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.row} className="border-b border-[var(--site-rule)]">
                    <th scope="row" className="py-3 pr-4 text-left font-normal">
                      {r.row}
                      {r.soon ? <span className="sp-data ml-2">(planned)</span> : null}
                    </th>
                    <td className="py-3 text-center">
                      <Cell v={r.free} />
                    </td>
                    <td className="bg-[var(--site-paper-deep)] py-3 text-center">
                      <Cell v={r.starter} />
                    </td>
                    <td className="py-3 text-center">
                      <Cell v={r.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}
