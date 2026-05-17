"use client"

import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type StepperNavProps = {
  steps: readonly string[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export function StepperNav({ steps, currentStep, onStepClick }: StepperNavProps) {
  return (
    <div className="flex max-w-full flex-wrap items-center justify-center gap-0">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!onStepClick}
              onClick={() => onStepClick?.(i)}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < currentStep && "bg-primary text-primary-foreground",
                i === currentStep && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                i > currentStep && "border border-muted-foreground/40 text-muted-foreground",
                onStepClick && "cursor-pointer hover:opacity-90"
              )}
            >
              {i < currentStep ? <Check className="size-3" aria-hidden /> : i + 1}
            </button>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                i === currentStep ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 ? (
            <div
              className={cn("mx-2 h-px w-8 shrink-0 sm:w-12", i < currentStep ? "bg-primary" : "bg-border")}
              aria-hidden
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}
