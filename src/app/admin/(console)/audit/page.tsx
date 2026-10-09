import { requireAdmin } from "@/lib/admin/auth"
import { listAudit } from "@/lib/admin/data"

export const dynamic = "force-dynamic"

export default async function AdminAudit() {
  const { admin } = await requireAdmin()
  const rows = await listAudit(admin)

  return (
    <div>
      <p className="sp-data">Console / Audit</p>
      <h1 className="site-h2 mt-2">Audit trail</h1>
      <p className="site-body mt-2">Every plan and credit change made from this console. The last 100.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--site-ink)] text-left">
              {["When (UTC)", "Admin", "Action", "User", "Details"].map((h) => (
                <th key={h} scope="col" className="sp-data py-2 pr-4 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--site-rule)] align-top">
                <td className="py-3 pr-4 whitespace-nowrap text-[var(--site-ink-2)]">{r.created_at.slice(0, 16).replace("T", " ")}</td>
                <td className="py-3 pr-4">{r.adminEmail ?? r.admin_id.slice(0, 8)}</td>
                <td className="py-3 pr-4">{r.action.replace(/_/g, " ")}</td>
                <td className="py-3 pr-4">
                  {r.target_user ? (
                    <a href={`/admin/users/${r.target_user}`} className="underline underline-offset-4">
                      {r.targetEmail ?? r.target_user.slice(0, 8)}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="sp-data max-w-[24rem] break-words py-3 normal-case">{JSON.stringify(r.details)}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-[var(--site-ink-3)]">
                  No changes yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
