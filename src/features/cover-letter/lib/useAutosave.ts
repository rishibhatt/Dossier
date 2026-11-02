"use client"

import { useEffect, useRef } from "react"

import type { SessionUser } from "@/features/resume/lib/useSessionUser"

import { saveLetterDraft, type LetterDraft } from "./drafts"
import { useLetterEditor } from "./store"

const SAVE_DELAY_MS = 800

type RemoteResult = { ok: true; id: string } | { ok: false; status: number; message: string; code: string }

async function saveRemote(remoteId: string | null, body: unknown): Promise<RemoteResult> {
  try {
    const res = await fetch(remoteId ? `/api/cover-letters/${remoteId}` : "/api/cover-letters", {
      method: remoteId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as { coverLetter?: { id: string }; message?: string; error?: string }
    if (res.ok && json.coverLetter?.id) return { ok: true, id: json.coverLetter.id }
    return { ok: false, status: res.status, message: json.message ?? "", code: json.error ?? "" }
  } catch {
    return { ok: false, status: 0, message: "", code: "" }
  }
}

/** The account copy: the job ad stays on this device (the server strips it too). */
const bodyOf = (d: LetterDraft, withResume: boolean) => ({
  title: d.title,
  resume_id: withResume ? d.doc.source.resumeRemoteId : null,
  data: { ...d.doc, jobPost: "" },
  design: d.design,
})

/**
 * Saves the open letter on this device after every pause in editing, then to the account when signed in.
 * Same behaviour as the resume editor's autosave (features/resume/lib/useAutosave.ts).
 */
export function useLetterAutosave(user: SessionUser | null | undefined) {
  const draft = useLetterEditor((s) => s.draft)
  const setSaveState = useLetterEditor((s) => s.setSaveState)
  const setRemoteId = useLetterEditor((s) => s.setRemoteId)
  const lastSaved = useRef(0)
  const remoteBlocked = useRef(false)

  useEffect(() => {
    if (!draft || draft.updatedAt === lastSaved.current) return
    setSaveState("saving")
    const timer = setTimeout(async () => {
      const current = useLetterEditor.getState().draft
      if (!current) return
      const stored = saveLetterDraft(current)
      lastSaved.current = current.updatedAt
      // A letter another account owns stays on this device; it is never saved into the wrong account.
      const foreign = Boolean(current.ownerId && user && current.ownerId !== user.id)
      if (!user || remoteBlocked.current || foreign) {
        setSaveState(stored ? "local" : "error", stored ? "" : "This browser would not save it. Download a copy to keep it.")
        return
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSaveState("offline")
        return
      }
      let r = await saveRemote(current.remoteId, bodyOf(current, true))
      // The linked resume is not in this account (made signed out, or deleted): save the letter without the link.
      if (!r.ok && r.status === 400 && r.code === "unknown_resume") r = await saveRemote(current.remoteId, bodyOf(current, false))
      if (r.ok) {
        if (r.id !== current.remoteId || current.ownerId !== user.id) {
          setRemoteId(r.id, user.id)
          saveLetterDraft({ ...current, remoteId: r.id, ownerId: user.id })
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
