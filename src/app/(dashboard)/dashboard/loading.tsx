import { cn } from "@/lib/utils"

function Bar({ className }: { className?: string }) {
  return <div className={cn("dossier-skeleton rounded-md", className)} />
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl" role="status" aria-label="Loading your dashboard">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Bar className="h-9 w-56" />
          <Bar className="h-4 w-64 max-w-full opacity-70" />
        </div>
        <Bar className="h-11 w-full rounded-xl sm:w-40" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <div className="divide-y divide-[var(--site-rule)] overflow-hidden rounded-2xl border border-[var(--site-rule-strong)] bg-white">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3 p-5">
              <Bar className="h-5 w-48" />
              <Bar className="h-4 w-32 opacity-70" />
              <div className="flex gap-2 pt-1">
                <Bar className="h-9 w-28 rounded-lg" />
                <Bar className="h-9 w-20 rounded-lg" />
                <Bar className="h-9 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-2xl border border-[var(--site-rule-strong)] bg-white p-5">
          <Bar className="h-4 w-20" />
          <Bar className="h-7 w-24" />
          <Bar className="h-4 w-full opacity-70" />
          <Bar className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
