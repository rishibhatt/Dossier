/**
 * Deprecated: runtime LLM-written JSX is removed from the product flow (unreliable, costly, unsafe surface).
 * Design variation now comes from the config-driven design engine (`/api/regenerate-design`).
 * The `src/features/jsx-engine` code stays in the repo until it is deleted in a follow-up.
 */
export const runtime = "nodejs"

export async function POST() {
  return Response.json({ error: "gone", message: "The JSX engine has been retired." }, { status: 410 })
}
