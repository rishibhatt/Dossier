"use client"

import { create } from "zustand"

import type { ResumeDesign, ResumeDocument } from "@/lib/resume/schema"

import type { Draft } from "./drafts"

/**
 * Editor state: the open draft plus an undo history. Every change goes through `edit`, which clones the
 * document, applies the change and records the previous version. Typing in one field within a short window
 * is merged into one undo step, so Cmd-Z undoes a word, not a letter.
 */
type SaveState = "idle" | "saving" | "saved" | "local" | "offline" | "error"

type EditorState = {
  draft: Draft | null
  past: ResumeDocument[]
  future: ResumeDocument[]
  lastKey: string
  lastAt: number
  saveState: SaveState
  saveMessage: string
  open: (draft: Draft) => void
  edit: (key: string, fn: (doc: ResumeDocument) => void) => void
  setDesign: (patch: Partial<ResumeDesign>) => void
  setTitle: (title: string) => void
  setRemoteId: (id: string, ownerId: string) => void
  undo: () => void
  redo: () => void
  setSaveState: (s: SaveState, message?: string) => void
}

const MERGE_MS = 900
const MAX_HISTORY = 80

export const useResumeEditor = create<EditorState>((set, get) => ({
  draft: null,
  past: [],
  future: [],
  lastKey: "",
  lastAt: 0,
  saveState: "idle",
  saveMessage: "",
  open: (draft) => set({ draft, past: [], future: [], lastKey: "", lastAt: 0, saveState: "saved", saveMessage: "" }),
  edit: (key, fn) => {
    const { draft, past, lastKey, lastAt } = get()
    if (!draft) return
    const next = structuredClone(draft.doc)
    fn(next)
    const now = Date.now()
    const merge = key === lastKey && now - lastAt < MERGE_MS
    set({
      draft: { ...draft, doc: next, updatedAt: now },
      past: merge ? past : [...past, draft.doc].slice(-MAX_HISTORY),
      future: [],
      lastKey: key,
      lastAt: now,
    })
  },
  setDesign: (patch) => {
    const { draft } = get()
    if (!draft) return
    const templateChosen = draft.templateChosen || "templateId" in patch
    set({ draft: { ...draft, design: { ...draft.design, ...patch }, templateChosen, updatedAt: Date.now() } })
  },
  setTitle: (title) => {
    const { draft } = get()
    if (!draft) return
    set({ draft: { ...draft, title: title.slice(0, 120), updatedAt: Date.now() } })
  },
  setRemoteId: (id, ownerId) => {
    const { draft } = get()
    if (!draft) return
    set({ draft: { ...draft, remoteId: id, ownerId } })
  },
  undo: () => {
    const { draft, past, future } = get()
    if (!draft || past.length === 0) return
    set({
      draft: { ...draft, doc: past[past.length - 1], updatedAt: Date.now() },
      past: past.slice(0, -1),
      future: [draft.doc, ...future].slice(0, MAX_HISTORY),
      lastKey: "",
    })
  },
  redo: () => {
    const { draft, past, future } = get()
    if (!draft || future.length === 0) return
    set({
      draft: { ...draft, doc: future[0], updatedAt: Date.now() },
      past: [...past, draft.doc],
      future: future.slice(1),
      lastKey: "",
    })
  },
  setSaveState: (saveState, saveMessage = "") => set({ saveState, saveMessage }),
}))
