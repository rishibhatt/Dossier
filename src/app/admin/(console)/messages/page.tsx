import { requireAdmin } from "@/lib/admin/auth"
import { listMessages } from "@/lib/admin/data"

import { setMessageStatusAction } from "../../actions"

export const dynamic = "force-dynamic"

export default async function AdminMessages() {
  const { admin } = await requireAdmin()
  const messages = await listMessages(admin)
  const open = messages.filter((m) => m.status === "new").length

  return (
    <div>
      <p className="sp-data">Console / Messages</p>
      <h1 className="site-h2 mt-2">Contact messages</h1>
      <p className="sp-data mt-2">{open} open</p>

      <ul className="mt-6 grid gap-4">
        {messages.map((m) => (
          <li key={m.id} className="border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                {m.name} <span className="font-normal text-[var(--site-ink-2)]">&lt;{m.email}&gt;</span>
              </p>
              <p className="sp-data">
                {m.created_at.slice(0, 16).replace("T", " ")} · {m.status}
              </p>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{m.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Dossier")}`} className="underline underline-offset-4">
                Reply
              </a>
              {m.user_id ? (
                <a href={`/admin/users/${m.user_id}`} className="underline underline-offset-4">
                  Open user
                </a>
              ) : null}
              <form action={setMessageStatusAction}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="status" value={m.status === "new" ? "handled" : "new"} />
                <button type="submit" className="underline underline-offset-4">
                  {m.status === "new" ? "Mark handled" : "Reopen"}
                </button>
              </form>
            </div>
          </li>
        ))}
        {messages.length === 0 ? <li className="site-body">No messages yet.</li> : null}
      </ul>
    </div>
  )
}
