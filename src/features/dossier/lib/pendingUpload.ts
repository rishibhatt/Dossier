/**
 * A resume chosen outside the builder (the home page upload slot, a free tool) waits here until the builder
 * mounts and takes it. The builder needs an account, so the visitor may leave for sign-up or Google sign-in
 * (a full page load) before coming back. The file is therefore also kept in this browser's IndexedDB for one
 * hour, and deleted as soon as the builder takes it. It never leaves the device.
 */
let pending: File | null = null

const DB = "dossier-pending"
const STORE = "upload"
const KEY = "resume"
const MAX_AGE_MS = 60 * 60 * 1000

type Stored = { file: File; savedAt: number }

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function persist(file: File | null) {
  const db = await open()
  if (!db) return
  try {
    const tx = db.transaction(STORE, "readwrite")
    if (file) tx.objectStore(STORE).put({ file, savedAt: Date.now() } satisfies Stored, KEY)
    else tx.objectStore(STORE).delete(KEY)
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    })
  } finally {
    db.close()
  }
}

export function setPendingUpload(file: File) {
  pending = file
  void persist(file)
}

/** Reads the waiting file without consuming it (safe inside a state initializer that may run twice). */
export function peekPendingUpload(): File | null {
  return pending
}

export function clearPendingUpload() {
  pending = null
  restoring = null
  void persist(null)
}

let restoring: Promise<File | null> | null = null

/**
 * After a full page load (sign-up, Google sign-in) memory is empty. Read the saved copy; the caller deletes it
 * with `clearPendingUpload` once it has taken the file. One shared read, so a double effect run is harmless.
 */
export function restorePendingUpload(): Promise<File | null> {
  restoring ??= (async () => {
    const db = await open()
    if (!db) return null
    try {
      const stored = await new Promise<Stored | undefined>((resolve) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY)
        req.onsuccess = () => resolve(req.result as Stored | undefined)
        req.onerror = () => resolve(undefined)
      })
      if (!stored || Date.now() - stored.savedAt > MAX_AGE_MS) {
        if (stored) void persist(null)
        return null
      }
      return stored.file
    } finally {
      db.close()
    }
  })()
  return restoring
}
