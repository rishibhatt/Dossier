export type AuthFormState = {
  /** Form-level problem, shown in a banner and a toast. */
  error: string | null
  /** Form-level good news, shown in a banner and a toast. */
  success?: string | null
  /** Problems tied to one field, keyed by the input's `name`. */
  fieldErrors?: Record<string, string>
  /** Echoed back so a failed submit does not wipe what the person typed. */
  email?: string
  /** Changes on every result so the toast fires again for a repeated identical message. */
  nonce?: number
}

export const authFormInitialState: AuthFormState = { error: null }
