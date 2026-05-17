"use client"

import { useMemo } from "react"

import { getSectionMotionPreset } from "@/lib/animations/presets"
import type { DesignConfig } from "@/types/designEngine"

export function useSectionAnimation(designConfig: DesignConfig, sectionIndex = 0) {
  return useMemo(
    () => getSectionMotionPreset(designConfig, sectionIndex),
    [designConfig, sectionIndex]
  )
}
