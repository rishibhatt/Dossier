/**
 * A resume chosen outside the builder (the home page upload slot, a free tool) waits here until the
 * builder mounts and takes it. Module state survives client-side navigation and never leaves the tab.
 */
let pending: File | null = null

export function setPendingUpload(file: File) {
  pending = file
}

/** Reads the waiting file without consuming it (safe inside a state initializer that may run twice). */
export function peekPendingUpload(): File | null {
  return pending
}

export function clearPendingUpload() {
  pending = null
}
