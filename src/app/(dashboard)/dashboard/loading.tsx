import { ExternalLink } from "lucide-react"

import { messages } from "@/config/messages"
import { cn } from "@/lib/utils"

function Bar({ className }: { className?: string }) {
  return <div className={cn("dossier-skeleton rounded", className)} />
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-(--container-landing) p-6 sm:p-8 lg:p-10">
      <div className="mb-10 flex flex-col gap-2">
        <Bar className="h-8 w-48 sm:w-64" />
        <Bar className="h-4 w-full max-w-md opacity-70" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex min-h-[24rem] flex-col gap-6 border border-border bg-card p-6 sm:p-8 lg:col-span-8 lg:min-h-[25rem]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Bar className="h-4 w-24" />
              <Bar className="h-10 w-full max-w-xs sm:max-w-md" />
            </div>
            <Bar className="size-10 shrink-0 rounded-full" />
          </div>
          <Bar className="min-h-0 flex-1 rounded-lg" />
          <div className="flex flex-wrap gap-4">
            <Bar className="h-4 w-28" />
            <Bar className="h-4 w-28" />
          </div>
        </div>

        <div className="col-span-12 flex min-h-[24rem] flex-col gap-6 lg:col-span-4 lg:min-h-[25rem]">
          <div className="flex flex-1 flex-col gap-4 border border-border bg-card p-6">
            <Bar className="h-4 w-3/4" />
            <div className="mt-4 space-y-2">
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-4/5" />
            </div>
            <div className="mt-auto flex items-center justify-between gap-4">
              <Bar className="h-8 w-24" />
              <Bar className="h-4 w-12" />
            </div>
          </div>
          <div className="flex min-h-[8rem] items-center gap-4 border border-border bg-card p-6">
            <Bar className="size-12 shrink-0 rounded-full" />
            <div className="flex w-full flex-col gap-2">
              <Bar className="h-4 w-1/2" />
              <Bar className="h-3 w-1/3" />
            </div>
          </div>
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="col-span-12 flex min-h-[17rem] flex-col gap-4 border border-border bg-card p-6 md:col-span-4"
          >
            <Bar className="h-[7.5rem] w-full rounded-md sm:h-32" />
            <Bar className="h-5 w-2/3" />
            <Bar className="h-3 w-full" />
            <Bar className="h-3 w-1/2" />
          </div>
        ))}

        <div className="col-span-12 mt-4 border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
            <Bar className="h-4 w-40" />
            <Bar className="h-4 w-20" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Bar className="h-4 w-4 rounded-sm" />
                <Bar className="h-4 min-w-0 flex-1" />
                <Bar className="hidden h-4 w-24 sm:block" />
                <Bar className="hidden h-4 w-24 md:block" />
                <Bar className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-4 z-40 sm:right-8">
        <div className="flex w-60 max-w-[calc(100vw-2rem)] items-center gap-4 border border-border bg-card p-4 shadow-sm sm:w-64">
          <Bar className="size-10 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bar className="h-3 w-3/4" />
            <Bar className="h-2 w-1/2" />
          </div>
          <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
        <p className="mt-2 text-center typo-label-sm text-muted-foreground">{messages.dashboardLoading.floatingHint}</p>
      </div>
    </div>
  )
}
