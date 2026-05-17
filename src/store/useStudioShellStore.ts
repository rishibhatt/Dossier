import { create } from "zustand"

export type StudioViewport = "desktop" | "tablet" | "mobile"

export type StudioShellState = {
  currentStep: number
  viewport: StudioViewport
  zoom: number
  activeSidebarSection: string
  leftPanelWidth: number
  rightPanelWidth: number
  leftCollapsed: boolean
  /** Design / moodboard / export column — start collapsed for more canvas space. */
  rightCollapsed: boolean
  setCurrentStep: (step: number) => void
  setViewport: (v: StudioViewport) => void
  setZoom: (z: number) => void
  setActiveSidebarSection: (id: string) => void
  setLeftPanelWidth: (w: number) => void
  setRightPanelWidth: (w: number) => void
  setLeftCollapsed: (v: boolean) => void
  setRightCollapsed: (v: boolean) => void
  toggleLeftCollapsed: () => void
  toggleRightCollapsed: () => void
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)))

export const useStudioShellStore = create<StudioShellState>((set) => ({
  currentStep: 1,
  viewport: "desktop",
  zoom: 100,
  activeSidebarSection: "site-seo",
  leftPanelWidth: 260,
  rightPanelWidth: 320,
  leftCollapsed: false,
  rightCollapsed: true,
  setCurrentStep: (currentStep) => set({ currentStep: Math.max(0, Math.min(3, currentStep)) }),
  setViewport: (viewport) => set({ viewport }),
  setZoom: (zoom) => set({ zoom: Math.max(50, Math.min(150, zoom)) }),
  setActiveSidebarSection: (activeSidebarSection) => set({ activeSidebarSection }),
  setLeftPanelWidth: (w) => set({ leftPanelWidth: clamp(w, 200, 400), leftCollapsed: false }),
  setRightPanelWidth: (w) => set({ rightPanelWidth: clamp(w, 260, 480), rightCollapsed: false }),
  setLeftCollapsed: (leftCollapsed) => set({ leftCollapsed }),
  setRightCollapsed: (rightCollapsed) => set({ rightCollapsed }),
  toggleLeftCollapsed: () => set((s) => ({ leftCollapsed: !s.leftCollapsed })),
  toggleRightCollapsed: () => set((s) => ({ rightCollapsed: !s.rightCollapsed })),
}))
