import { create } from "zustand"

/** Tool panels. `add` is the section gallery; it lives in the same panel host as the others. */
export type StudioPanelId = "content" | "design" | "ai" | "share" | "add"

/** Phone bottom sheet snap: peek shows the tabs, half splits with the canvas, full owns the screen. */
export type SheetSnap = "closed" | "peek" | "half" | "full"

type Busy = { publish: boolean; export: boolean; design: boolean; ai: boolean }

type StudioUiState = {
  panel: StudioPanelId
  /** Desktop and tablet: the side panel can be tucked away to give the canvas more room. */
  panelOpen: boolean
  /** Phone: where the bottom sheet rests. */
  snap: SheetSnap
  /** Section picked on the canvas or in the content list. */
  selectedId: string | null
  /** Section whose editor is expanded in the content panel. */
  editorId: string | null
  /** Template being applied, so only that card shows a spinner. */
  pendingTemplateId: string | null
  /** Path of the last published page, such as `/p/abc123`. */
  publishedPath: string | null
  /** When the draft was last written to this device (ms). */
  savedAt: number | null
  busy: Busy
  setPanel: (panel: StudioPanelId) => void
  /** Opens a tool: side panel on wide screens, the sheet on phones (half unless told otherwise). */
  openTool: (panel: StudioPanelId, snap?: SheetSnap) => void
  setPanelOpen: (open: boolean) => void
  /** Phone bottom sheet open state. */
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  setSnap: (snap: SheetSnap) => void
  select: (id: string | null) => void
  /** Select a section and open its editor in the content panel. */
  editSection: (id: string, snap?: SheetSnap) => void
  setEditorId: (id: string | null) => void
  setPendingTemplate: (id: string | null) => void
  setPublishedPath: (path: string | null) => void
  markSaved: () => void
  setBusy: (key: keyof Busy, value: boolean) => void
  reset: () => void
}

const initial = {
  panel: "content" as StudioPanelId,
  panelOpen: true,
  sheetOpen: false,
  snap: "closed" as SheetSnap,
  selectedId: null as string | null,
  editorId: null as string | null,
  pendingTemplateId: null as string | null,
  publishedPath: null as string | null,
  savedAt: null as number | null,
  busy: { publish: false, export: false, design: false, ai: false },
}

export const useStudioUiStore = create<StudioUiState>((set) => ({
  ...initial,
  setPanel: (panel) => set({ panel, panelOpen: true }),
  openTool: (panel, snap) =>
    set((s) => ({
      panel,
      panelOpen: true,
      sheetOpen: true,
      snap: snap ?? (s.snap === "closed" || s.snap === "peek" ? "half" : s.snap),
    })),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setSheetOpen: (sheetOpen) => set({ sheetOpen, snap: sheetOpen ? "half" : "closed" }),
  setSnap: (snap) => set({ snap, sheetOpen: snap !== "closed" }),
  select: (selectedId) => set({ selectedId }),
  editSection: (id, snap) =>
    set((s) => ({ selectedId: id, editorId: id, panel: "content", panelOpen: true, snap: snap ?? (s.snap === "full" ? "full" : "half") })),
  setEditorId: (editorId) => set({ editorId }),
  setPendingTemplate: (pendingTemplateId) => set({ pendingTemplateId }),
  setPublishedPath: (publishedPath) => set({ publishedPath }),
  markSaved: () => set({ savedAt: Date.now() }),
  setBusy: (key, value) => set((s) => ({ busy: { ...s.busy, [key]: value } })),
  reset: () => set(initial),
}))
