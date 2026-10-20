"use client"

import { useEffect, useRef } from "react"

import { saveDraft } from "./drafts"
import { useResumeEditor } from "./store"
import type { SessionUser } from "./useSessionUser"

const SAVE_DELAY_MS = 800

type RemoteResult = { ok: true; id: string } | { ok: false; status: number; message: string }

async function saveRemote(remoteId: string | null, body: unknown): Promise<RemoteResult> {
  try {
    const res = await fetch(remoteId ? `/api/resumes/${remoteId}` : "/api/resumes", {
      method: remoteId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as { resume?: { id: string }; message?: string }
    if (res.ok && json.resume?.id) return { ok: true, id: json.resume.id }
    return { ok: false, status: res.status, message: json.message ?? "" }
  } catch {
    return { ok: false, status: 0, message: "" }
  }
}

/**
 * Saves the open draft on this device after every pause in editing, then to the account when signed in.
 * The device copy is written first, so a failed network save never loses work.
 */
export function useAutosave(user: SessionUser | null | undefined) {
  const draft = useResumeEditor((s) => s.draft)
  const setSaveState = useResumeEditor((s) => s.setSaveState)
  const setRemoteId = useResumeEditor((s) => s.setRemoteId)
  const lastSaved = useRef(0)
  const remoteBlocked = useRef(false)

  useEffect(() => {
    if (!draft || draft.updatedAt === lastSaved.current) return
    setSaveState("saving")
    const timer = setTimeout(async () => {
      const current = useResumeEditor.getState().draft
      if (!current) return
      const stored = saveDraft(current)
      lastSaved.current = current.updatedAt
      // A draft another account owns stays on this device; it is never saved into the wrong account.
      const foreign = Boolean(current.ownerId && user && current.ownerId !== user.id)
      if (!user || remoteBlocked.current || foreign) {
        setSaveState(stored ? "local" : "error", stored ? "" : "This browser would not save it. Download a copy to keep it.")
        return
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSaveState("offline")
        return
      }
      const r = await saveRemote(current.remoteId, { title: current.title, data: current.doc, design: current.design })
      if (r.ok) {
        if (r.id !== current.remoteId || current.ownerId !== user.id) {
          setRemoteId(r.id, user.id)
          saveDraft({ ...current, remoteId: r.id, ownerId: user.id })
        }
        setSaveState("saved")
      } else if (r.status === 403) {
        // Plan limit: keep editing and downloading; this one just stays on the device.
        remoteBlocked.current = true
        setSaveState("local", r.message)
      } else {
        setSaveState(stored ? "local" : "error", "Couldn't save to your account. It is saved on this device.")
      }
    }, SAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [draft, user, setSaveState, setRemoteId])
}
