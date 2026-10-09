import { create } from "zustand"

import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

/** One restorable point. Text edits are not recorded one keystroke at a time; structure and design changes are. */
export type Snapshot = {
  document: PortfolioDocument
  designConfig: DesignConfig
  generationVariation: number
  hiddenSectionIds: Record<string, boolean>
  sectionSurfaceOverrides: Record<string, { bg?: string }>
}

const MAX_HISTORY = 30

export function takeSnapshot(): Snapshot | null {
  const s = usePortfolioStore.getState()
  if (!s.document || !s.designConfig) return null
  return {
    document: s.document,
    designConfig: s.designConfig,
    generationVariation: s.generationVariation,
    hiddenSectionIds: s.hiddenSectionIds,
    sectionSurfaceOverrides: s.sectionSurfaceOverrides,
  }
}

export function restoreSnapshot(snap: Snapshot) {
  usePortfolioStore.setState({ ...snap })
}

type StudioStatusState = {
  /** A change was made and the 500 ms autosave has not written it yet. */
  pendingSave: boolean
  /** The page was edited after the last successful publish. */
  unpublished: boolean
  history: Snapshot[]
  future: Snapshot[]
  publishDialogOpen: boolean
  markChanged: () => void
  markSaved: () => void
  markPublished: () => void
  setPublishDialogOpen: (open: boolean) => void
  /** Record the current state before a change, so the change can be undone. */
  pushHistory: () => void
  undo: () => boolean
  redo: () => boolean
  reset: () => void
}

export const useStudioStatus = create<StudioStatusState>((set, get) => ({
  pendingSave: false,
  unpublished: false,
  history: [],
  future: [],
  publishDialogOpen: false,
  markChanged: () => set({ pendingSave: true, unpublished: true }),
  markSaved: () => set({ pendingSave: false }),
  markPublished: () => set({ unpublished: false }),
  setPublishDialogOpen: (publishDialogOpen) => set({ publishDialogOpen }),
  pushHistory: () => {
    const snap = takeSnapshot()
    if (snap) set((s) => ({ history: [...s.history, snap].slice(-MAX_HISTORY), future: [] }))
  },
  undo: () => {
    const { history } = get()
    const prev = history[history.length - 1]
    const now = takeSnapshot()
    if (!prev || !now) return false
    set((s) => ({ history: s.history.slice(0, -1), future: [...s.future, now].slice(-MAX_HISTORY) }))
    restoreSnapshot(prev)
    return true
  },
  redo: () => {
    const { future } = get()
    const next = future[future.length - 1]
    const now = takeSnapshot()
    if (!next || !now) return false
    set((s) => ({ future: s.future.slice(0, -1), history: [...s.history, now].slice(-MAX_HISTORY) }))
    restoreSnapshot(next)
    return true
  },
  reset: () => set({ pendingSave: false, unpublished: false, history: [], future: [], publishDialogOpen: false }),
}))
